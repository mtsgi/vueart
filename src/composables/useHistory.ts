import { onMounted, onUnmounted } from 'vue'
import { useDocumentStore } from '@/stores/useDocumentStore'
import { useHistoryStore } from '@/stores/useHistoryStore'

export function useHistory() {
  const docStore = useDocumentStore()
  const historyStore = useHistoryStore()

  function commit() {
    const snap = docStore.getSnapshot()
    if (snap) historyStore.push(snap)
  }

  function undo() {
    const snapshot = historyStore.undo()
    if (snapshot) docStore.restoreSnapshot(snapshot)
  }

  function redo() {
    const snap = docStore.getSnapshot()
    if (!snap) return
    const snapshot = historyStore.redo(snap)
    if (snapshot) docStore.restoreSnapshot(snapshot)
  }

  function onKeyDown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
      e.preventDefault(); undo()
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
      e.preventDefault(); redo()
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      // テキスト入力中は無視
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return
      e.preventDefault()
      Array.from(docStore.activeSelectedIds).forEach((id: string) => docStore.removeObject(id))
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeyDown))
  onUnmounted(() => window.removeEventListener('keydown', onKeyDown))

  return { commit, undo, redo }
}
