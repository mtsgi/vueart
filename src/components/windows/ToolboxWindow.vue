<script setup lang="ts">
import { useUiStore } from '@/stores/useUiStore'
import type { ToolType } from '@/types/objects'

const uiStore = useUiStore()

const tools: { type: ToolType; icon: string; title: string }[] = [
  { type: 'select',  icon: '↖',  title: 'Select (V)' },
  { type: 'rect',    icon: '▭',  title: 'Rectangle (R)' },
  { type: 'ellipse', icon: '○',  title: 'Ellipse (E)' },
  { type: 'text',    icon: 'T',  title: 'Text (T)' },
]
</script>

<template>
  <div class="toolbox">
    <button
      v-for="tool in tools"
      :key="tool.type"
      class="tool-btn"
      :class="{ active: uiStore.activeTool === tool.type }"
      :title="tool.title"
      @click="uiStore.setTool(tool.type)"
    >{{ tool.icon }}</button>
  </div>
</template>

<style lang="scss" scoped>
.toolbox {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 4px;
  background: var(--panel-bg);
  height: 100%;
}

.tool-btn {
  width: 32px;
  height: 32px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: var(--win-bg);
  color: var(--text-primary);
  border-top: 2px solid var(--win-border-light);
  border-left: 2px solid var(--win-border-light);
  border-right: 2px solid var(--win-border-dark);
  border-bottom: 2px solid var(--win-border-dark);

  &:active,
  &.active {
    background: var(--panel-inset-bg);
    border-top: 2px solid var(--win-border-dark);
    border-left: 2px solid var(--win-border-dark);
    border-right: 2px solid var(--win-border-light);
    border-bottom: 2px solid var(--win-border-light);
    color: var(--accent);
  }
}
</style>
