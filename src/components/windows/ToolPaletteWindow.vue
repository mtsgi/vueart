<script setup lang="ts">
/**
 * ToolPaletteWindow — [操作]ツールバー（フローティングウィンドウ内）
 * 描画ツール（選択・矩形・楕円・テキスト）の切り替えパレット。
 * MdiWindow内に配置され、ワークスペース上をドラッグ移動可能。
 */
import { useUiStore } from '@/stores/useUiStore'
import type { ToolType } from '@/types/objects'

const uiStore = useUiStore()

// ツール定義
const tools: { type: ToolType; icon: string; label: string; key: string }[] = [
  { type: 'select',  icon: '↖',  label: '選択',  key: 'V' },
  { type: 'rect',    icon: '▭',  label: '矩形',  key: 'R' },
  { type: 'ellipse', icon: '○',  label: '楕円',  key: 'E' },
  { type: 'text',    icon: 'Ａ', label: 'テキスト', key: 'T' },
]
</script>

<template>
  <div class="tool-palette">
    <!-- ツールボタン（縦2列グリッド） -->
    <div class="tool-palette__grid">
      <button
        v-for="tool in tools"
        :key="tool.type"
        class="tool-btn"
        :class="{ active: uiStore.activeTool === tool.type }"
        :title="`${tool.label}（${tool.key}）`"
        @click="uiStore.setTool(tool.type)"
      >
        <span class="tool-btn__icon">{{ tool.icon }}</span>
        <span class="tool-btn__label">{{ tool.label }}</span>
      </button>
    </div>

    <!-- アクティブツール表示 -->
    <div class="tool-palette__active">
      <span>{{ tools.find(t => t.type === uiStore.activeTool)?.label }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tool-palette {
  display: flex;
  flex-direction: column;
  padding: 4px;
  background: var(--panel-bg);
  height: 100%;
  gap: 4px;

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3px;
  }

  &__active {
    text-align: center;
    font-size: 10px;
    color: var(--accent);
    border-top: 1px solid var(--win-border-dark);
    padding-top: 3px;
    margin-top: auto;
  }
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 100%;
  aspect-ratio: 1;
  padding: 4px 2px;
  cursor: default;
  background: var(--win-bg);
  color: var(--text-primary);
  border-top: 2px solid var(--win-border-light);
  border-left: 2px solid var(--win-border-light);
  border-right: 2px solid var(--win-border-dark);
  border-bottom: 2px solid var(--win-border-dark);

  &:active,
  &.active {
    background: var(--panel-inset-bg);
    border-top-color: var(--win-border-dark);
    border-left-color: var(--win-border-dark);
    border-right-color: var(--win-border-light);
    border-bottom-color: var(--win-border-light);
    color: var(--accent);
  }

  &__icon {
    font-size: 14px;
    line-height: 1;
  }

  &__label {
    font-size: 8px;
    line-height: 1;
    white-space: nowrap;
  }
}
</style>
