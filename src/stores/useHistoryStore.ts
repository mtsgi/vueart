import { defineStore } from 'pinia'
import { ref, toRaw } from 'vue'
import type { CanvasDocument } from '@/types/document'

const MAX_HISTORY = 50

/**
 * リアクティブ配列内のアイテムは Vue Proxy でラップされているため
 * toRaw() でProxy解除してから structuredClone でディープコピーする。
 */
function deepClone(doc: CanvasDocument): CanvasDocument {
  return structuredClone(toRaw(doc))
}

export const useHistoryStore = defineStore('history', () => {
  const undoStack = ref<CanvasDocument[]>([])
  const redoStack = ref<CanvasDocument[]>([])

  function push(snapshot: CanvasDocument) {
    undoStack.value.push(snapshot)
    if (undoStack.value.length > MAX_HISTORY) undoStack.value.shift()
    redoStack.value = []
  }

  function undo(): CanvasDocument | null {
    if (undoStack.value.length === 0) return null
    const snapshot = undoStack.value.pop()!
    redoStack.value.push(snapshot)
    return undoStack.value.length > 0
      ? deepClone(undoStack.value[undoStack.value.length - 1])
      : deepClone(snapshot)
  }

  function redo(currentSnapshot: CanvasDocument): CanvasDocument | null {
    if (redoStack.value.length === 0) return null
    const snapshot = redoStack.value.pop()!
    undoStack.value.push(currentSnapshot)
    return deepClone(snapshot)
  }

  const canUndo = () => undoStack.value.length > 0
  const canRedo = () => redoStack.value.length > 0

  return { undoStack, redoStack, push, undo, redo, canUndo, canRedo }
})
