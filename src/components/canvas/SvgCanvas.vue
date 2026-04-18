<script setup lang="ts">
/**
 * SvgCanvas — SVGキャンバス本体
 * canvasId に対応するドキュメントをストアから取得し、<svg>要素として描画する。
 * 図形の追加・選択・ドラッグ移動のインタラクションを管理する。
 */
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useDocumentStore } from '@/stores/useDocumentStore'
import { useUiStore } from '@/stores/useUiStore'
import { useHistory } from '@/composables/useHistory'
import { generateId } from '@/utils/idGenerator'
import type { CanvasObject, TextObject } from '@/types/objects'
import type { ResizeHandle } from '@/types/ui'
import SvgFilterDefs from './SvgFilterDefs.vue'
import ShapeRenderer from './ShapeRenderer.vue'
import ResizeHandles from './ResizeHandles.vue'

// このキャンバスウィンドウのID（CanvasWindowから受け取る）
const props = defineProps<{ canvasId: string }>()

const docStore = useDocumentStore()
const uiStore = useUiStore()
const { commit } = useHistory()

// <svg>要素の参照（エクスポート時に使用）
const svgEl = ref<SVGElement | null>(null)

// このcanvasIdに対応するドキュメント
const doc = computed(() => docStore.getOrCreateDocument(props.canvasId))

// ドキュメント内のオブジェクト一覧
const objects = computed(() => doc.value.objects)

// このキャンバスの選択オブジェクトID集合
const selectedIds = computed(() =>
  docStore.activeCanvasId === props.canvasId
    ? docStore.activeSelectedIds
    : new Set<string>()
)

// ---- オブジェクトドラッグ移動の状態 ----
const dragState = ref<{
  objId: string
  startMouseX: number
  startMouseY: number
  origX: number
  origY: number
} | null>(null)

// ---- オブジェクトリサイズの状態 ----
const resizeState = ref<{
  objId: string
  handle: ResizeHandle
  startMouseX: number
  startMouseY: number
  origX: number
  origY: number
  origWidth: number
  origHeight: number
} | null>(null)

// ---- キャンバス自体のリサイズ状態 ----
const canvasResizeState = ref<{
  direction: string
  startMouseX: number
  startMouseY: number
  origWidth: number
  origHeight: number
} | null>(null)

/** キャンバスリサイズハンドルのスタイル（ズーム/パン補正済み絶対座標） */
const canvasResizeHandleS = computed(() => ({
  left: `${panX.value + doc.value.width * zoom.value / 2 - 6}px`,
  top:  `${panY.value + doc.value.height * zoom.value + 1}px`,
}))
const canvasResizeHandleE = computed(() => ({
  left: `${panX.value + doc.value.width * zoom.value + 1}px`,
  top:  `${panY.value + doc.value.height * zoom.value / 2 - 6}px`,
}))
const canvasResizeHandleSE = computed(() => ({
  left: `${panX.value + doc.value.width * zoom.value + 1}px`,
  top:  `${panY.value + doc.value.height * zoom.value + 1}px`,
}))

/** キャンバスリサイズ開始 */
function startCanvasResize(direction: string, e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  canvasResizeState.value = {
    direction,
    startMouseX: e.clientX,
    startMouseY: e.clientY,
    origWidth: doc.value.width,
    origHeight: doc.value.height,
  }
  function onMove(ev: MouseEvent) {
    if (!canvasResizeState.value) return
    const rs = canvasResizeState.value
    // ズーム補正してSVG座標系の差分を計算
    const dx = (ev.clientX - rs.startMouseX) / zoom.value
    const dy = (ev.clientY - rs.startMouseY) / zoom.value
    let w = rs.origWidth, h = rs.origHeight
    if (rs.direction.includes('e')) w = Math.max(10, rs.origWidth + dx)
    if (rs.direction.includes('s')) h = Math.max(10, rs.origHeight + dy)
    docStore.updateCanvasSize(props.canvasId, w, h)
  }
  function onUp() {
    canvasResizeState.value = null
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

// ---- テキストインライン編集 ----
// 編集中のテキストオブジェクトID（null = 非編集モード）
const editingTextId = ref<string | null>(null)
// 編集中のテキスト内容（確定前の一時的な値）
const editingTextValue = ref('')
// foreignObject 内の input への ref（自動フォーカス用）
const textInputRef = ref<HTMLInputElement | null>(null)

/** テキストオブジェクトのダブルクリック → インライン編集開始 */
function onTextDblclick(id: string) {
  const obj = doc.value.objects.find(o => o.id === id) as TextObject | undefined
  if (!obj) return
  docStore.setActiveCanvas(props.canvasId)
  uiStore.activeTool = 'select'
  docStore.selectObject(id)
  editingTextId.value = id
  editingTextValue.value = obj.text
  // 次の DOM 更新後に input にフォーカスを当てる
  nextTick(() => textInputRef.value?.focus())
}

/** テキスト編集を確定してストアに反映 */
function commitTextEdit() {
  if (!editingTextId.value) return
  commit()
  docStore.updateObject(editingTextId.value, { text: editingTextValue.value })
  editingTextId.value = null
}

/** テキスト編集をキャンセル */
function cancelTextEdit() {
  editingTextId.value = null
}

/** 編集中テキストオブジェクトの参照（foreignObject の位置算出用） */
const editingTextObj = computed(() => {
  if (!editingTextId.value) return null
  return doc.value.objects.find(o => o.id === editingTextId.value) as TextObject | null
})

/**
 * リサイズ計算
 * ハンドル方向と移動量から新しい x/y/width/height を返す。
 * 最小サイズ 10px を下回らないよう制約する。
 */
function applyResize(
  handle: ResizeHandle,
  orig: { x: number; y: number; width: number; height: number },
  dx: number,
  dy: number,
): { x: number; y: number; width: number; height: number } {
  const MIN = 10
  let { x, y, width, height } = orig

  // 水平方向: e = 右端を動かす、w = 左端を動かす（x も連動）
  if (handle.includes('e')) {
    width = Math.max(MIN, orig.width + dx)
  } else if (handle.includes('w')) {
    const newWidth = Math.max(MIN, orig.width - dx)
    x = orig.x + orig.width - newWidth
    width = newWidth
  }

  // 垂直方向: s = 下端を動かす、n = 上端を動かす（y も連動）
  if (handle.includes('s')) {
    height = Math.max(MIN, orig.height + dy)
  } else if (handle.includes('n')) {
    const newHeight = Math.max(MIN, orig.height - dy)
    y = orig.y + orig.height - newHeight
    height = newHeight
  }

  return { x, y, width, height }
}

/** キャンバス背景クリック処理 */
function onSvgMousedown(e: MouseEvent) {
  // テキスト編集中の場合は確定して終了
  if (editingTextId.value) {
    commitTextEdit()
    return
  }

  // このキャンバスをアクティブに設定
  docStore.setActiveCanvas(props.canvasId)
  uiStore.activeCanvasId = props.canvasId

  if (e.target === svgEl.value) {
    if (uiStore.activeTool === 'select') {
      // 背景クリック → 選択解除
      docStore.clearSelection()
    } else {
      // 描画ツール使用中 → 新規図形を追加
      createObjectAt(e)
    }
  }
}

function onSvgMousemove(e: MouseEvent) {
  if (panState.value) {
    // 中ボタンパン
    panX.value = panState.value.origPanX + (e.clientX - panState.value.startX)
    panY.value = panState.value.origPanY + (e.clientY - panState.value.startY)
    return
  }
  if (dragState.value) {
    // オブジェクト移動（ズーム補正あり）
    const dx = (e.clientX - dragState.value.startMouseX) / zoom.value
    const dy = (e.clientY - dragState.value.startMouseY) / zoom.value
    docStore.updateObject(dragState.value.objId, {
      x: snapV(dragState.value.origX + dx),
      y: snapV(dragState.value.origY + dy),
    })
  } else if (resizeState.value) {
    // オブジェクトリサイズ（ズーム補正あり）
    const rs = resizeState.value
    const dx = (e.clientX - rs.startMouseX) / zoom.value
    const dy = (e.clientY - rs.startMouseY) / zoom.value
    const result = applyResize(rs.handle, {
      x: rs.origX, y: rs.origY, width: rs.origWidth, height: rs.origHeight,
    }, dx, dy)
    // リサイズ結果もグリッドにスナップ
    docStore.updateObject(rs.objId, {
      x: snapV(result.x), y: snapV(result.y),
      width: snapV(result.width), height: snapV(result.height),
    })
  }
}

function onSvgMouseup() {
  finishInteraction()
}

/** window レベルの mouseup ハンドラ（SVG外でドラッグ終了した場合も確実に解除する） */
function onWindowMouseup() {
  finishInteraction()
}

/** ドラッグ/リサイズ状態を確定・クリアする共通処理 */
function finishInteraction() {
  if (dragState.value || resizeState.value) {
    commit()
    dragState.value = null
    resizeState.value = null
  }
  // パン終了
  panState.value = null
}

/**
 * 図形上の mousedown 処理（ShapeRenderer から id + MouseEvent が届く）
 * 選択とドラッグ開始を一箇所で処理する。
 */
function onObjectMousedown(id: string, e: MouseEvent) {
  docStore.setActiveCanvas(props.canvasId)
  uiStore.activeCanvasId = props.canvasId

  // Shift押下で複数選択トグル、通常は単一選択
  docStore.selectObject(id, e.shiftKey)

  if (uiStore.activeTool !== 'select') return
  const obj = doc.value.objects.find(o => o.id === id)
  if (!obj || obj.locked) return

  // ドラッグ開始状態を記録
  dragState.value = {
    objId: id,
    startMouseX: e.clientX,
    startMouseY: e.clientY,
    origX: obj.x,
    origY: obj.y,
  }
}

/** リサイズハンドルの mousedown（ResizeHandles から呼ばれる） */
function onResizeStart(objId: string, handle: ResizeHandle, e: MouseEvent) {
  docStore.setActiveCanvas(props.canvasId)
  uiStore.activeCanvasId = props.canvasId

  const obj = doc.value.objects.find(o => o.id === objId)
  if (!obj || obj.locked) return

  resizeState.value = {
    objId,
    handle,
    startMouseX: e.clientX,
    startMouseY: e.clientY,
    origX: obj.x,
    origY: obj.y,
    origWidth: obj.width,
    origHeight: obj.height,
  }
}

/** マウス座標をSVG座標系に変換（ズーム・パン補正あり） */
function getSvgPoint(e: MouseEvent): { x: number; y: number } {
  if (!svgEl.value) return { x: 0, y: 0 }
  const rect = svgEl.value.getBoundingClientRect()
  // CSS transform で zoom/pan されているため補正する
  return {
    x: (e.clientX - rect.left - panX.value) / zoom.value,
    y: (e.clientY - rect.top - panY.value) / zoom.value,
  }
}

/** 現在のツールに応じてオブジェクトを生成してストアに追加 */
function createObjectAt(e: MouseEvent) {
  const { x, y } = getSvgPoint(e)
  commit() // 変更前のスナップショットを履歴に保存

  let obj: CanvasObject

  const base = {
    id: generateId(),
    x: snapV(Math.round(x - 50)),
    y: snapV(Math.round(y - 25)),
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    filterId: null,
    label: '',
  }

  if (uiStore.activeTool === 'rect') {
    obj = {
      ...base, type: 'rect', width: 100, height: 50,
      fill: '#4a9eff', stroke: '#2255aa', strokeWidth: 1, rx: 4, ry: 4, label: '矩形',
    }
  } else if (uiStore.activeTool === 'ellipse') {
    obj = {
      ...base, type: 'ellipse', width: 100, height: 60,
      fill: '#ff9944', stroke: '#cc6600', strokeWidth: 1, label: '楕円',
    }
  } else if (uiStore.activeTool === 'text') {
    obj = {
      ...base, type: 'text', width: 160, height: 32,
      text: 'テキスト', fontSize: 24, fontFamily: 'sans-serif',
      fontWeight: 'bold', fill: '#ffffff', textAnchor: 'start', label: 'テキスト',
    }
  } else {
    return
  }

  docStore.addObject(obj)
  // 図形追加後は選択ツールに戻す
  uiStore.setTool('select')
}

// SVG外でマウスボタンを離した場合もインタラクションを確実に終了させる
onMounted(() => window.addEventListener('mouseup', onWindowMouseup))
onUnmounted(() => window.removeEventListener('mouseup', onWindowMouseup))

// ---- ズーム/パン ----
const zoom = ref(1.0)
const panX = ref(0)
const panY = ref(0)

/** ビューをリセット（ズーム1倍・原点） */
function resetView() {
  zoom.value = 1.0
  panX.value = 0
  panY.value = 0
}

/** Ctrl+スクロールでズーム（マウス位置を中心に） */
function onSvgWheel(e: WheelEvent) {
  if (!e.ctrlKey) return
  e.preventDefault()
  const rect = svgEl.value!.getBoundingClientRect()
  const mx = e.clientX - rect.left
  const my = e.clientY - rect.top
  const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15
  const newZoom = Math.min(8, Math.max(0.1, zoom.value * factor))
  // ズームの基準点をマウスカーソル位置に合わせる
  panX.value = mx - (mx - panX.value) * (newZoom / zoom.value)
  panY.value = my - (my - panY.value) * (newZoom / zoom.value)
  zoom.value = newZoom
}

// 中ボタンドラッグ（パン）状態
const panState = ref<{ startX: number; startY: number; origPanX: number; origPanY: number } | null>(null)

/** 中ボタン押下でパン開始 */
function onMiddleMousedown(e: MouseEvent) {
  if (e.button !== 1) return
  e.preventDefault()
  panState.value = { startX: e.clientX, startY: e.clientY, origPanX: panX.value, origPanY: panY.value }
}

// ---- グリッドスナップ ----
/** 値をグリッドにスナップ（gridEnabled=false の場合はそのまま返す） */
function snapV(v: number): number {
  if (!uiStore.gridEnabled) return v
  return Math.round(v / uiStore.gridSize) * uiStore.gridSize
}

// SVG のカーソルスタイル（リサイズ中はハンドル方向に合わせて変更、パン中はグラブ）
const svgCursor = computed(() => {
  if (panState.value) return 'grabbing'
  if (resizeState.value) return `${resizeState.value.handle}-resize`
  if (uiStore.activeTool === 'select') return 'default'
  return 'crosshair'
})

// zoom/pan/resetView を親コンポーネント（CanvasWindow）に公開
defineExpose({ svgEl, zoom, panX, panY, resetView })
</script>

<template>
  <div
    class="svg-canvas-wrapper"
    :style="{ cursor: svgCursor }"
    @wheel.prevent="onSvgWheel"
    @mousedown.middle.prevent="onMiddleMousedown"
  >
  <!-- ズーム/パン変換（CSS transform） -->
  <svg
    ref="svgEl"
    :width="doc.width"
    :height="doc.height"
    :style="{
      transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
      transformOrigin: '0 0',
      background: doc.backgroundColor === 'transparent' ? undefined : doc.backgroundColor,
      display: 'block',
    }"
    @mousedown="onSvgMousedown"
    @mousemove="onSvgMousemove"
    @mouseup="onSvgMouseup"
  >
    <!-- グリッドパターン定義 -->
    <defs>
      <pattern
        v-if="uiStore.gridEnabled"
        id="vad-grid"
        :width="uiStore.gridSize"
        :height="uiStore.gridSize"
        patternUnits="userSpaceOnUse"
      >
        <path
          :d="`M ${uiStore.gridSize} 0 L 0 0 0 ${uiStore.gridSize}`"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          stroke-width="0.5"
        />
      </pattern>
    </defs>

    <!-- グリッドオーバーレイ -->
    <rect
      v-if="uiStore.gridEnabled"
      :width="doc.width"
      :height="doc.height"
      fill="url(#vad-grid)"
      pointer-events="none"
    />

    <!-- フィルタ定義（<defs>内） -->
    <SvgFilterDefs :canvas-id="canvasId" />

    <!-- オブジェクト一覧（可視のもののみ描画） -->
    <template v-for="obj in objects" :key="obj.id">
      <ShapeRenderer
        v-if="obj.visible"
        :obj="obj"
        :selected="selectedIds.has(obj.id)"
        @object-mousedown="onObjectMousedown"
        @object-dblclick="(id) => onTextDblclick(id)"
      />
    </template>

    <!-- 選択オブジェクトのリサイズハンドル（全オブジェクトの上に重ねる） -->
    <template v-for="obj in objects" :key="`handle-${obj.id}`">
      <ResizeHandles
        v-if="obj.visible && selectedIds.has(obj.id) && editingTextId !== obj.id"
        :x="obj.x"
        :y="obj.y"
        :width="obj.width"
        :height="obj.height"
        @resize-start="(handle, e) => onResizeStart(obj.id, handle, e)"
      />
    </template>

    <!-- テキストインライン編集（foreignObjectでSVG内にネイティブinputを埋め込む） -->
    <foreignObject
      v-if="editingTextObj"
      :x="editingTextObj.x - 2"
      :y="editingTextObj.y - 2"
      :width="Math.max(editingTextObj.width + 4, 120)"
      :height="editingTextObj.height + 4"
    >
      <input
        ref="textInputRef"
        xmlns="http://www.w3.org/1999/xhtml"
        class="text-edit-input"
        type="text"
        :value="editingTextValue"
        :style="{
          fontSize: `${editingTextObj.fontSize}px`,
          fontFamily: editingTextObj.fontFamily,
          fontWeight: editingTextObj.fontWeight,
          color: editingTextObj.fill,
          width: '100%',
          height: '100%',
        }"
        @input="editingTextValue = ($event.target as HTMLInputElement).value"
        @keydown.enter.prevent="commitTextEdit"
        @keydown.escape.prevent="cancelTextEdit"
        @blur="commitTextEdit"
        @mousedown.stop
        @click.stop
      />
    </foreignObject>
  </svg>

  <!-- キャンバスリサイズハンドル（SVG外側、ズーム/パン反映済みの絶対座標で配置） -->
  <div
    class="canvas-resize-handle canvas-resize-handle--s"
    :style="canvasResizeHandleS"
    title="キャンバスの高さをリサイズ"
    @mousedown.stop="startCanvasResize('s', $event)"
  />
  <div
    class="canvas-resize-handle canvas-resize-handle--e"
    :style="canvasResizeHandleE"
    title="キャンバスの幅をリサイズ"
    @mousedown.stop="startCanvasResize('e', $event)"
  />
  <div
    class="canvas-resize-handle canvas-resize-handle--se"
    :style="canvasResizeHandleSE"
    title="キャンバスをリサイズ"
    @mousedown.stop="startCanvasResize('se', $event)"
  />
  </div>
</template>

<style lang="scss" scoped>
.svg-canvas-wrapper {
  /* ズーム/パン操作の領域 — SVGがはみ出さないようclipする */
  overflow: hidden;
  width: 100%;
  height: 100%;
  position: relative;
}

// キャンバスリサイズハンドル（SVG外側のハンドル）
$ch: 8px;
.canvas-resize-handle {
  position: absolute;
  background: var(--accent);
  border: 1px solid var(--win-border-dark);
  width: $ch;
  height: $ch;
  border-radius: 1px;
  z-index: 5;
  &--s  { cursor: s-resize; }
  &--e  { cursor: e-resize; }
  &--se { cursor: se-resize; }
}
</style>

<style>
/* foreignObject 内の input（scoped を外す必要がある） */
.text-edit-input {
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.7);
  border: 1px dashed #4a9eff;
  outline: none;
  padding: 0 2px;
  caret-color: #fff;
  border-radius: 2px;
}
</style>

