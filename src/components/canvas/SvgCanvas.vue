<script setup lang="ts">
/**
 * SvgCanvas — SVGキャンバス本体
 * canvasId に対応するドキュメントをストアから取得し、<svg>要素として描画する。
 * 図形の追加・選択・ドラッグ移動のインタラクションを管理する。
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDocumentStore } from '@/stores/useDocumentStore'
import { useUiStore } from '@/stores/useUiStore'
import { useHistory } from '@/composables/useHistory'
import { generateId } from '@/utils/idGenerator'
import type { CanvasObject } from '@/types/objects'
import SvgFilterDefs from './SvgFilterDefs.vue'
import ShapeRenderer from './ShapeRenderer.vue'

// このキャンバスウィンドウのID（CanvasWindowから受け取る）
const props = defineProps<{ canvasId: string }>()

const docStore = useDocumentStore()
const uiStore = useUiStore()
const { commit } = useHistory()

// <svg>要素の参照（エクスポート時に使用）
const svgEl = ref<SVGElement | null>(null)
defineExpose({ svgEl })

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

/** キャンバス背景クリック処理 */
function onSvgMousedown(e: MouseEvent) {
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
  if (!dragState.value) return
  const dx = e.clientX - dragState.value.startMouseX
  const dy = e.clientY - dragState.value.startMouseY
  docStore.updateObject(dragState.value.objId, {
    x: dragState.value.origX + dx,
    y: dragState.value.origY + dy,
  })
}

function onSvgMouseup() {
  finishDrag()
}

/** window レベルの mouseup ハンドラ（SVG外でドラッグ終了した場合も確実に解除する） */
function onWindowMouseup() {
  finishDrag()
}

/** ドラッグ状態を確定・クリアする共通処理 */
function finishDrag() {
  if (dragState.value) {
    commit()
    dragState.value = null
  }
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

/** マウス座標をSVG座標系に変換 */
function getSvgPoint(e: MouseEvent): { x: number; y: number } {
  if (!svgEl.value) return { x: 0, y: 0 }
  const rect = svgEl.value.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

/** 現在のツールに応じてオブジェクトを生成してストアに追加 */
function createObjectAt(e: MouseEvent) {
  const { x, y } = getSvgPoint(e)
  commit() // 変更前のスナップショットを履歴に保存

  let obj: CanvasObject

  const base = {
    id: generateId(),
    x: Math.round(x - 50),
    y: Math.round(y - 25),
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

// SVG外でマウスボタンを離した場合もドラッグを確実に終了させる
onMounted(() => window.addEventListener('mouseup', onWindowMouseup))
onUnmounted(() => window.removeEventListener('mouseup', onWindowMouseup))
</script>

<template>
  <svg
    ref="svgEl"
    :width="doc.width"
    :height="doc.height"
    :style="{
      background: doc.backgroundColor === 'transparent' ? undefined : doc.backgroundColor,
      cursor: uiStore.activeTool === 'select' ? 'default' : 'crosshair',
    }"
    @mousedown="onSvgMousedown"
    @mousemove="onSvgMousemove"
    @mouseup="onSvgMouseup"
  >
    <!-- フィルタ定義（<defs>内） -->
    <SvgFilterDefs :canvas-id="canvasId" />

    <!-- オブジェクト一覧（可視のもののみ描画） -->
    <template v-for="obj in objects" :key="obj.id">
      <ShapeRenderer
        v-if="obj.visible"
        :obj="obj"
        :selected="selectedIds.has(obj.id)"
        @object-mousedown="onObjectMousedown"
      />
    </template>
  </svg>
</template>

