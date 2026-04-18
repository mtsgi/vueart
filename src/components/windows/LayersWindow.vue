<script setup lang="ts">
import { computed } from 'vue'
import { useDocumentStore } from '@/stores/useDocumentStore'

const docStore = useDocumentStore()
const objects = computed(() => [...(docStore.activeDocument?.objects ?? [])].reverse()) // top-first
</script>

<template>
  <div class="layers-panel">
    <div class="layers-header">
      <span>{{ objects.length }} object{{ objects.length !== 1 ? 's' : '' }}</span>
    </div>
    <div
      v-for="obj in objects"
      :key="obj.id"
      class="layer-item"
      :class="{ selected: docStore.activeSelectedIds.has(obj.id) }"
      @click="docStore.selectObject(obj.id, $event.shiftKey)"
    >
      <span class="layer-type">{{ obj.type[0].toUpperCase() }}</span>
      <span class="layer-label">{{ obj.label || obj.type }}</span>
      <div class="layer-actions">
        <button
          class="vis-btn"
          :title="obj.visible ? 'Hide' : 'Show'"
          @click.stop="docStore.updateObject(obj.id, { visible: !obj.visible })"
        >{{ obj.visible ? '👁' : '🚫' }}</button>
      </div>
    </div>
    <div v-if="objects.length === 0" class="empty-hint">
      No objects yet.<br>Use a drawing tool to add shapes.
    </div>
  </div>
</template>

<style lang="scss" scoped>
.layers-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--panel-bg);
}

.layers-header {
  padding: 4px 6px;
  font-size: 10px;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--win-border-dark);
  flex-shrink: 0;
}

.layer-item {
  display: flex;
  align-items: center;
  padding: 3px 6px;
  gap: 6px;
  cursor: pointer;
  font-size: 11px;
  color: var(--text-primary);
  border-bottom: 1px solid var(--win-border-dark);

  &:hover {
    background: var(--win-bg);
  }

  &.selected {
    background: var(--win-titlebar-active);
    color: white;
  }

  .layer-type {
    width: 14px;
    height: 14px;
    background: var(--panel-inset-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    font-weight: bold;
    color: var(--accent);
    border: 1px solid var(--win-border-dark);
    flex-shrink: 0;
  }

  .layer-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 11px;
  }

  .layer-actions {
    display: flex;
    gap: 2px;
  }
}

.vis-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 10px;
  padding: 0;
  line-height: 1;
}

.empty-hint {
  padding: 12px 8px;
  font-size: 10px;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.6;
}
</style>
