<script setup lang="ts">
/**
 * MdiDesktop — 中央MDIワークスペース
 * キャンバスウィンドウ（kind='canvas'）と操作ツールバー（kind='toolpalette'）を
 * フローティングウィンドウとして表示する仮想デスクトップ領域。
 */
import { computed } from 'vue'
import { useUiStore } from '@/stores/useUiStore'
import { useDocumentStore } from '@/stores/useDocumentStore'
import MdiWindow from './MdiWindow.vue'
import CanvasWindow from '@/components/windows/CanvasWindow.vue'
import ToolPaletteWindow from '@/components/windows/ToolPaletteWindow.vue'
import ToolboxWindow from '@/components/windows/ToolboxWindow.vue'
import PropertiesWindow from '@/components/windows/PropertiesWindow.vue'
import LayersWindow from '@/components/windows/LayersWindow.vue'

const uiStore = useUiStore()
const docStore = useDocumentStore()

// z-indexでソートしたウィンドウ一覧
const visibleWindows = computed(() =>
  uiStore.windows.filter(w => w.visible).sort((a, b) => a.zIndex - b.zIndex)
)

/** ウィンドウを閉じる処理 */
function onClose(id: string) {
  if (id.startsWith('canvas-')) {
    // キャンバスウィンドウの場合はドキュメントも削除
    docStore.removeCanvas(id)
  }
  uiStore.closeWindow(id)
}

/** ワークスペース上の空白クリック → 選択解除 */
function onWorkspaceClick() {
  docStore.clearSelection()
}
</script>

<template>
  <div class="mdi-workspace" @click.self="onWorkspaceClick">
    <!-- ウィンドウが1つもない場合のウェルカムメッセージ -->
    <div
      v-if="visibleWindows.filter(w => w.kind === 'canvas').length === 0"
      class="welcome-hint"
    >
      <p class="welcome-hint__title">Vue Art Designer</p>
      <p class="welcome-hint__sub">「ファイル → 新規作成」またはツールバーの 📄 でキャンバスを作成してください</p>
    </div>

    <!-- フローティングウィンドウ -->
    <MdiWindow
      v-for="win in visibleWindows"
      :key="win.id"
      :win="win"
      :active="win.kind === 'toolpalette' || win.id === uiStore.activeCanvasId"
      @close="onClose"
    >
      <!-- キャンバスウィンドウ -->
      <CanvasWindow
        v-if="win.kind === 'canvas'"
        :canvas-id="win.id"
      />
      <!-- 操作ツールバー -->
      <ToolPaletteWindow
        v-else-if="win.kind === 'toolpalette'"
      />
      <!-- ツールボックス -->
      <ToolboxWindow
        v-else-if="win.kind === 'toolbox'"
      />
      <!-- プロパティパネル -->
      <PropertiesWindow
        v-else-if="win.kind === 'properties'"
      />
      <!-- レイヤーパネル -->
      <LayersWindow
        v-else-if="win.kind === 'layers'"
      />
    </MdiWindow>
  </div>
</template>

<style lang="scss" scoped>
.mdi-workspace {
  flex: 1;
  position: relative;
  overflow: hidden;
  // チェッカーボード模様のデスクトップ背景（プロツール風）
  background-color: #1e2030;
  background-image:
    linear-gradient(45deg, #252638 25%, transparent 25%),
    linear-gradient(-45deg, #252638 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #252638 75%),
    linear-gradient(-45deg, transparent 75%, #252638 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0;
}

.welcome-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  color: rgba(255, 255, 255, 0.15);

  &__title {
    font-size: 28px;
    font-weight: bold;
    letter-spacing: 2px;
    margin-bottom: 12px;
  }

  &__sub {
    font-size: 12px;
    line-height: 1.7;
  }
}
</style>

