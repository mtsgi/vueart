<script setup lang="ts">
/**
 * StandardToolbar — [標準]ツールバー
 * 新規作成・開く・保存・Undo/Redo などの基本操作ボタンを横並びで配置。
 */
import { useUiStore } from '@/stores/useUiStore'
import { useDocumentStore } from '@/stores/useDocumentStore'
import { useHistoryStore } from '@/stores/useHistoryStore'

const uiStore = useUiStore()
const docStore = useDocumentStore()
const historyStore = useHistoryStore()

function onNewCanvas() {
  const canvasId = uiStore.addCanvas('新規キャンバス')
  docStore.getOrCreateDocument(canvasId, '新規キャンバス')
  docStore.setActiveCanvas(canvasId)
}

function onUndo() {
  const snap = historyStore.undo()
  if (snap) docStore.restoreSnapshot(snap)
}
function onRedo() {
  const cur = docStore.getSnapshot()
  if (!cur) return
  const snap = historyStore.redo(cur)
  if (snap) docStore.restoreSnapshot(snap)
}

// ツールバーボタン定義
const buttons = [
  { icon: '📄', title: '新規作成(N)', action: onNewCanvas },
  { icon: '📂', title: 'ファイルを開く(O)', action: () => {} },
  { icon: '💾', title: '保存(S)', action: () => {} },
  null, // セパレータ
  { icon: '↩', title: '元に戻す(Z)  Ctrl+Z', action: onUndo },
  { icon: '↪', title: 'やり直し(Y)  Ctrl+Y', action: onRedo },
  null,
  { icon: '✂', title: '切り取り', action: () => {} },
  { icon: '📋', title: 'コピー', action: () => {} },
  { icon: '📌', title: '貼り付け', action: () => {} },
]
</script>

<template>
  <div class="toolbar standard-toolbar">
    <span class="toolbar__label">[標準]</span>
    <template v-for="(btn, i) in buttons" :key="i">
      <div v-if="btn === null" class="toolbar__sep" />
      <button v-else class="toolbar__btn" :title="btn.title" @click="btn.action">
        {{ btn.icon }}
      </button>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  align-items: center;
  height: 28px;
  background: var(--panel-bg);
  border-bottom: 1px solid var(--win-border-dark);
  padding: 2px 4px;
  gap: 2px;
  flex-shrink: 0;

  &__label {
    font-size: 10px;
    color: var(--text-secondary);
    padding-right: 4px;
    border-right: 1px solid var(--win-border-dark);
    margin-right: 2px;
    white-space: nowrap;
  }

  &__sep {
    width: 1px;
    height: 18px;
    background: var(--win-border-dark);
    margin: 0 3px;
  }

  &__btn {
    width: 24px;
    height: 22px;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default;
    background: var(--win-bg);
    color: var(--text-primary);
    border: 1px solid transparent;
    padding: 0;

    &:hover {
      border-top-color: var(--win-border-light);
      border-left-color: var(--win-border-light);
      border-right-color: var(--win-border-dark);
      border-bottom-color: var(--win-border-dark);
    }

    &:active {
      border-top-color: var(--win-border-dark);
      border-left-color: var(--win-border-dark);
      border-right-color: var(--win-border-light);
      border-bottom-color: var(--win-border-light);
    }
  }
}
</style>
