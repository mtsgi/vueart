<script setup lang="ts">
/**
 * CanvasWindow — キャンバスウィンドウのコンテンツ
 * 各MDIキャンバスウィンドウに対して1つのSvgCanvasを管理する。
 * canvasId でドキュメントストアとの紐付けを行う。
 */
import { ref, computed, onMounted } from 'vue'
import SvgCanvas from '@/components/canvas/SvgCanvas.vue'
import { useDocumentStore } from '@/stores/useDocumentStore'
import { useUiStore } from '@/stores/useUiStore'
import { exportAsPng, exportAsSvg } from '@/utils/exportSvg'

const props = defineProps<{ canvasId: string }>()

const docStore = useDocumentStore()
const uiStore = useUiStore()
const canvasRef = ref<InstanceType<typeof SvgCanvas> | null>(null)

// このウィンドウがフォーカスされたらアクティブキャンバスに設定
onMounted(() => {
  docStore.getOrCreateDocument(props.canvasId)
  docStore.setActiveCanvas(props.canvasId)
  uiStore.activeCanvasId = props.canvasId
})

// キャンバスウィンドウがクリックされたらアクティブを切り替え
function onWindowFocus() {
  docStore.setActiveCanvas(props.canvasId)
  uiStore.activeCanvasId = props.canvasId
}

// このcanvasIdに対応するドキュメント
const doc = computed(() => docStore.getOrCreateDocument(props.canvasId))

// activeCanvasIdがこのcanvasIdと一致するかどうか
const isActive = computed(() => docStore.activeCanvasId === props.canvasId)

async function onExportPng() {
  const svgEl = canvasRef.value?.svgEl
  if (svgEl) await exportAsPng(svgEl as SVGElement, `${doc.value.name}.png`)
}

function onExportSvg() {
  const svgEl = canvasRef.value?.svgEl
  if (svgEl) exportAsSvg(svgEl as SVGElement, `${doc.value.name}.svg`)
}
</script>

<template>
  <div class="canvas-window" @mousedown="onWindowFocus">
    <!-- キャンバスツールバー（ドキュメント情報とエクスポート） -->
    <div class="canvas-toolbar" :class="{ active: isActive }">
      <span class="doc-name">{{ doc.name }}</span>
      <span class="size-info">{{ doc.width }} × {{ doc.height }}px</span>
      <div class="spacer" />
      <select
        class="bg-select"
        :value="doc.backgroundColor"
        title="背景色"
        @change="docStore.getOrCreateDocument(canvasId).backgroundColor = ($event.target as HTMLSelectElement).value"
      >
        <option value="transparent">透過</option>
        <option value="#ffffff">白</option>
        <option value="#000000">黒</option>
        <option value="#1e1e2e">濃紺</option>
      </select>
      <button class="toolbar-btn" title="PNG書き出し" @click="onExportPng">PNG</button>
      <button class="toolbar-btn" title="SVG書き出し" @click="onExportSvg">SVG</button>
    </div>

    <!-- SVGキャンバス領域 -->
    <div class="canvas-area">
      <SvgCanvas ref="canvasRef" :canvas-id="canvasId" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.canvas-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--panel-inset-bg);
}

.canvas-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 22px;
  padding: 0 6px;
  background: var(--panel-bg);
  border-bottom: 1px solid var(--win-border-dark);
  flex-shrink: 0;

  &.active {
    background: var(--win-bg);
  }

  .doc-name {
    font-size: 11px;
    font-weight: bold;
    color: var(--text-primary);
  }

  .size-info {
    font-size: 10px;
    color: var(--text-secondary);
  }

  .spacer { flex: 1; }
}

.toolbar-btn {
  height: 16px;
  padding: 0 6px;
  font-size: 10px;
  cursor: default;
  background: var(--win-bg);
  color: var(--text-primary);
  border-top: 1px solid var(--win-border-light);
  border-left: 1px solid var(--win-border-light);
  border-right: 1px solid var(--win-border-dark);
  border-bottom: 1px solid var(--win-border-dark);

  &:active {
    border-top-color: var(--win-border-dark);
    border-left-color: var(--win-border-dark);
    border-right-color: var(--win-border-light);
    border-bottom-color: var(--win-border-light);
  }
}

.bg-select {
  height: 16px;
  font-size: 10px;
  padding: 0 2px;
  background: var(--panel-inset-bg);
  color: var(--text-primary);
  border: 1px solid var(--win-border-dark);
}

.canvas-area {
  flex: 1;
  overflow: auto;
  padding: 8px;
  display: flex;
  align-items: flex-start;
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
