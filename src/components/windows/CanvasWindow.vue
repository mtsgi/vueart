<script setup lang="ts">
/**
 * CanvasWindow — キャンバスウィンドウのコンテンツ
 * 各MDIキャンバスウィンドウに対してツールバーメニューとSvgCanvasを管理する。
 * canvasId でドキュメントストアとの紐付けを行う。
 */
import { ref, computed, onMounted } from 'vue'
import SvgCanvas from '@/components/canvas/SvgCanvas.vue'
import ContextMenu from '@/components/ui/ContextMenu.vue'
import type { ContextMenuItem } from '@/components/ui/ContextMenu.vue'
import { useDocumentStore } from '@/stores/useDocumentStore'
import { useUiStore } from '@/stores/useUiStore'
import { useHistory } from '@/composables/useHistory'
import { useClipboard } from '@/composables/useClipboard'
import { exportAsPng, exportAsSvg } from '@/utils/exportSvg'

const props = defineProps<{ canvasId: string }>()

const docStore = useDocumentStore()
const uiStore = useUiStore()
const { commit } = useHistory()
const { copySelected, pasteClipboard, clipboard } = useClipboard()
const canvasRef = ref<InstanceType<typeof SvgCanvas> | null>(null)

onMounted(() => {
  docStore.getOrCreateDocument(props.canvasId)
  docStore.setActiveCanvas(props.canvasId)
  uiStore.activeCanvasId = props.canvasId
})

function onWindowFocus() {
  docStore.setActiveCanvas(props.canvasId)
  uiStore.activeCanvasId = props.canvasId
}

const doc = computed(() => docStore.getOrCreateDocument(props.canvasId))
const isActive = computed(() => docStore.activeCanvasId === props.canvasId)
const hasMultiSelect = computed(() => docStore.selectedObjects.length >= 2)
const hasSelect = computed(() => docStore.selectedObjects.length >= 1)

// ---- ズーム ----
const zoomPercent = computed(() => Math.round((canvasRef.value?.zoom ?? 1) * 100))

function changeZoom(delta: number) {
  if (!canvasRef.value) return
  canvasRef.value.zoom = Math.min(8, Math.max(0.1, canvasRef.value.zoom + delta))
}

// ---- オブジェクト整列 ----
function getBounds() {
  const objs = docStore.selectedObjects
  if (objs.length < 2) return null
  const minX = Math.min(...objs.map(o => o.x))
  const minY = Math.min(...objs.map(o => o.y))
  const maxX = Math.max(...objs.map(o => o.x + o.width))
  const maxY = Math.max(...objs.map(o => o.y + o.height))
  return { minX, minY, maxX, maxY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 }
}

function align(dir: 'left' | 'centerH' | 'right' | 'top' | 'middleV' | 'bottom') {
  const objs = docStore.selectedObjects
  if (objs.length < 2) return
  const bounds = getBounds()!
  commit()
  for (const obj of objs) {
    if (dir === 'left')    docStore.updateObject(obj.id, { x: bounds.minX })
    if (dir === 'centerH') docStore.updateObject(obj.id, { x: bounds.cx - obj.width / 2 })
    if (dir === 'right')   docStore.updateObject(obj.id, { x: bounds.maxX - obj.width })
    if (dir === 'top')     docStore.updateObject(obj.id, { y: bounds.minY })
    if (dir === 'middleV') docStore.updateObject(obj.id, { y: bounds.cy - obj.height / 2 })
    if (dir === 'bottom')  docStore.updateObject(obj.id, { y: bounds.maxY - obj.height })
  }
}

// ---- エクスポート ----
async function onExportPng() {
  const svgEl = canvasRef.value?.svgEl
  if (svgEl) await exportAsPng(svgEl as SVGElement, `${doc.value.name}.png`)
}
function onExportSvg() {
  const svgEl = canvasRef.value?.svgEl
  if (svgEl) exportAsSvg(svgEl as SVGElement, `${doc.value.name}.svg`)
}

// ---- ツールバーメニュー定義 ----
const openMenu = ref<string | null>(null)

function toggleMenu(name: string) {
  openMenu.value = openMenu.value === name ? null : name
}
function closeMenus() {
  openMenu.value = null
}
function execAndClose(fn: () => void) {
  fn()
  closeMenus()
}

// 背景色選択項目
const bgOptions = [
  { value: 'transparent', label: '透過' },
  { value: '#ffffff', label: '白' },
  { value: '#000000', label: '黒' },
  { value: '#1e1e2e', label: '濃紺' },
]

// ---- 右クリックコンテキストメニュー ----
const ctxMenu = ref<{ x: number; y: number } | null>(null)

function onContextMenu(e: MouseEvent) {
  e.preventDefault()
  closeMenus()
  ctxMenu.value = { x: e.clientX, y: e.clientY }
}

const ctxItems = computed(() => [
  { label: 'コピー    Ctrl+C',  action: copySelected,  disabled: !hasSelect.value },
  { label: '貼り付け Ctrl+V', action: pasteClipboard, disabled: clipboard.value.length === 0 },
  { label: '削除    Delete', disabled: !hasSelect.value, action: () => {
    commit()
    Array.from(docStore.activeSelectedIds).forEach(id => docStore.removeObject(id))
  }},
  { separator: true as const },
  { label: '左揃え',   action: () => align('left'),    disabled: !hasMultiSelect.value },
  { label: '水平中央', action: () => align('centerH'), disabled: !hasMultiSelect.value },
  { label: '右揃え',   action: () => align('right'),   disabled: !hasMultiSelect.value },
  { label: '上揃え',   action: () => align('top'),     disabled: !hasMultiSelect.value },
  { label: '垂直中央', action: () => align('middleV'), disabled: !hasMultiSelect.value },
  { label: '下揃え',   action: () => align('bottom'),  disabled: !hasMultiSelect.value },
  { separator: true as const },
  { label: 'ズームリセット',  action: () => canvasRef.value?.resetView() },
  { label: uiStore.gridEnabled ? 'グリッドを非表示' : 'グリッドを表示',
    checked: uiStore.gridEnabled,
    action: () => { uiStore.gridEnabled = !uiStore.gridEnabled } },
] satisfies ContextMenuItem[])
</script>

<template>
  <div class="canvas-window" @mousedown="onWindowFocus">
    <!-- ツールバー（メニューバー形式） -->
    <div class="canvas-toolbar" :class="{ active: isActive }" @mouseleave="closeMenus">
      <!-- ドキュメント名・サイズ情報 -->
      <span class="doc-name">{{ doc.name }}</span>
      <span class="size-info">{{ doc.width }}×{{ doc.height }}</span>

      <div class="tb-sep" />

      <!-- ズームメニュー -->
      <div class="tb-menu-item" :class="{ open: openMenu === 'ズーム' }">
        <button class="tb-menu-trigger" @click="toggleMenu('ズーム')">
          ズーム {{ zoomPercent }}%
        </button>
        <div v-if="openMenu === 'ズーム'" class="tb-dropdown">
          <button class="tb-dropdown__item" @click="execAndClose(() => changeZoom(0.25))">+ ズームイン</button>
          <button class="tb-dropdown__item" @click="execAndClose(() => changeZoom(-0.25))">- ズームアウト</button>
          <button class="tb-dropdown__item" @click="execAndClose(() => canvasRef?.resetView())">リセット (100%)</button>
          <div class="tb-dropdown__sep" />
          <button class="tb-dropdown__item" @click="execAndClose(() => { if (canvasRef) canvasRef.zoom = 0.5 })">50%</button>
          <button class="tb-dropdown__item" @click="execAndClose(() => { if (canvasRef) canvasRef.zoom = 1.0 })">100%</button>
          <button class="tb-dropdown__item" @click="execAndClose(() => { if (canvasRef) canvasRef.zoom = 2.0 })">200%</button>
        </div>
      </div>

      <!-- 表示メニュー -->
      <div class="tb-menu-item" :class="{ open: openMenu === '表示' }">
        <button class="tb-menu-trigger" @click="toggleMenu('表示')">表示</button>
        <div v-if="openMenu === '表示'" class="tb-dropdown">
          <button
            class="tb-dropdown__item"
            @click="execAndClose(() => { uiStore.gridEnabled = !uiStore.gridEnabled })"
          >
            <span class="tb-dropdown__check">{{ uiStore.gridEnabled ? '✓' : '' }}</span>
            グリッドを表示
          </button>
          <div class="tb-dropdown__sep" />
          <div class="tb-dropdown__label">背景色</div>
          <button
            v-for="opt in bgOptions"
            :key="opt.value"
            class="tb-dropdown__item"
            @click="execAndClose(() => { docStore.getOrCreateDocument(canvasId).backgroundColor = opt.value })"
          >
            <span class="tb-dropdown__check">{{ doc.backgroundColor === opt.value ? '✓' : '' }}</span>
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- 整列メニュー -->
      <div class="tb-menu-item" :class="{ open: openMenu === '整列' }">
        <button class="tb-menu-trigger" @click="toggleMenu('整列')">整列</button>
        <div v-if="openMenu === '整列'" class="tb-dropdown">
          <button class="tb-dropdown__item" :disabled="!hasMultiSelect" @click="execAndClose(() => align('left'))">左揃え</button>
          <button class="tb-dropdown__item" :disabled="!hasMultiSelect" @click="execAndClose(() => align('centerH'))">水平中央</button>
          <button class="tb-dropdown__item" :disabled="!hasMultiSelect" @click="execAndClose(() => align('right'))">右揃え</button>
          <div class="tb-dropdown__sep" />
          <button class="tb-dropdown__item" :disabled="!hasMultiSelect" @click="execAndClose(() => align('top'))">上揃え</button>
          <button class="tb-dropdown__item" :disabled="!hasMultiSelect" @click="execAndClose(() => align('middleV'))">垂直中央</button>
          <button class="tb-dropdown__item" :disabled="!hasMultiSelect" @click="execAndClose(() => align('bottom'))">下揃え</button>
          <div v-if="!hasMultiSelect" class="tb-dropdown__hint">2個以上選択してください</div>
        </div>
      </div>

      <!-- 書き出しメニュー -->
      <div class="tb-menu-item" :class="{ open: openMenu === '書き出し' }">
        <button class="tb-menu-trigger" @click="toggleMenu('書き出し')">書き出し</button>
        <div v-if="openMenu === '書き出し'" class="tb-dropdown">
          <button class="tb-dropdown__item" @click="execAndClose(onExportPng)">PNGとして保存</button>
          <button class="tb-dropdown__item" @click="execAndClose(onExportSvg)">SVGとして保存</button>
        </div>
      </div>
    </div>

    <!-- SVGキャンバス領域 -->
    <div class="canvas-area" @contextmenu="onContextMenu">
      <SvgCanvas ref="canvasRef" :canvas-id="canvasId" />
    </div>

    <!-- 右クリックコンテキストメニュー -->
    <ContextMenu
      v-if="ctxMenu"
      :items="ctxItems"
      :x="ctxMenu.x"
      :y="ctxMenu.y"
      @close="ctxMenu = null"
    />
  </div>
</template>

<style lang="scss" scoped>
.canvas-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--panel-inset-bg);
}

// ---- ツールバー（メニューバー形式） ----
.canvas-toolbar {
  display: flex;
  align-items: center;
  gap: 0;
  height: 20px;
  padding: 0;
  background: var(--panel-bg);
  border-bottom: 1px solid var(--win-border-dark);
  flex-shrink: 0;
  position: relative;
  z-index: 100;

  &.active { background: var(--win-bg); }

  .doc-name {
    font-size: 11px;
    font-weight: bold;
    color: var(--text-primary);
    padding: 0 8px;
    white-space: nowrap;
  }

  .size-info {
    font-size: 10px;
    color: var(--text-secondary);
    padding-right: 4px;
    white-space: nowrap;
  }
}

.tb-sep {
  width: 1px;
  height: 14px;
  background: var(--win-border-dark);
  flex-shrink: 0;
  margin: 0 2px;
}

// ---- チャイルドメニュー項目 ----
.tb-menu-item {
  position: relative;

  &.open > .tb-menu-trigger {
    background: var(--win-titlebar-active);
    color: #fff;
  }
}

.tb-menu-trigger {
  height: 20px;
  padding: 0 8px;
  font-size: 11px;
  background: transparent;
  color: var(--text-primary);
  border: none;
  cursor: default;
  white-space: nowrap;

  &:hover {
    background: var(--win-bg);
  }
}

.tb-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 140px;
  background: var(--win-bg);
  border: 1px solid var(--win-border-dark);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  padding: 2px;
  z-index: 9999;

  &__item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 3px 12px 3px 4px;
    font-size: 11px;
    text-align: left;
    background: transparent;
    color: var(--text-primary);
    border: none;
    cursor: default;
    gap: 2px;

    &:hover:not(:disabled) {
      background: var(--win-titlebar-active);
      color: #fff;
    }

    &:disabled {
      color: var(--text-secondary);
      cursor: not-allowed;
    }
  }

  &__check {
    width: 14px;
    font-size: 10px;
    flex-shrink: 0;
    text-align: center;
  }

  &__sep {
    height: 1px;
    background: var(--win-border-dark);
    margin: 2px 4px;
  }

  &__label {
    font-size: 10px;
    color: var(--text-secondary);
    padding: 2px 8px;
  }

  &__hint {
    font-size: 10px;
    color: var(--text-secondary);
    padding: 2px 8px;
    font-style: italic;
  }
}

.canvas-area {
  flex: 1;
  overflow: hidden;
  position: relative;
  // チェッカーボード背景で透過確認ができるように
  background-image:
    linear-gradient(45deg, #555 25%, transparent 25%),
    linear-gradient(-45deg, #555 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #555 75%),
    linear-gradient(-45deg, transparent 75%, #555 75%);
  background-size: 10px 10px;
  background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
  background-color: #666;
}
</style>

