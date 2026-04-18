import { ref, toRaw, onMounted, onUnmounted } from 'vue'
import type { CanvasObject } from '@/types/objects'
import { useDocumentStore } from '@/stores/useDocumentStore'
import { useHistoryStore } from '@/stores/useHistoryStore'
import { generateId } from '@/utils/idGenerator'

/**
 * すべてのキャンバスで共有するモジュールレベルのクリップボード。
 * コンポーネントをまたいでコピーした内容を保持する。
 */
const _clipboard = ref<CanvasObject[]>([])

/**
 * コピー・ペースト機能を提供するコンポーザブル。
 * registerShortcuts: true を渡した場合のみ Ctrl+C/V のキーボードショートカットを登録する。
 * アプリ全体で1箇所のみ true にすること（重複登録防止）。
 */
export function useClipboard({ registerShortcuts = false }: { registerShortcuts?: boolean } = {}) {
  const docStore = useDocumentStore()
  const historyStore = useHistoryStore()

  /** 選択中のオブジェクトをクリップボードにコピー */
  function copySelected() {
    const selected = docStore.selectedObjects
    if (selected.length === 0) return
    // toRaw で Vue Proxy を解除してからディープコピー
    _clipboard.value = JSON.parse(JSON.stringify(selected.map(o => toRaw(o)))) as CanvasObject[]
  }

  /** クリップボードの内容をアクティブドキュメントにペースト（10px 下右オフセット） */
  function pasteClipboard() {
    if (_clipboard.value.length === 0) return

    // ペースト前にスナップショットを履歴に積む（Undo可能にする）
    const snap = docStore.getSnapshot()
    if (snap) historyStore.push(snap)

    // 新しいIDを付与して10pxオフセット
    const pasted = (_clipboard.value as CanvasObject[]).map(obj => ({
      ...(JSON.parse(JSON.stringify(obj)) as CanvasObject),
      id: generateId(),
      x: obj.x + 10,
      y: obj.y + 10,
    }))

    // ペーストしたオブジェクトを選択状態にする（addObject が自動選択する）
    docStore.clearSelection()
    pasted.forEach(obj => docStore.addObject(obj as CanvasObject))
  }

  function onKeyDown(e: KeyboardEvent) {
    const tag = (e.target as HTMLElement).tagName
    // テキスト入力中は無視
    if (tag === 'INPUT' || tag === 'TEXTAREA') return

    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      e.preventDefault()
      copySelected()
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      e.preventDefault()
      pasteClipboard()
    }
  }

  // Vue のルールに従い onMounted/onUnmounted は常に呼び出す（条件はリスナー登録のみ）
  onMounted(() => { if (registerShortcuts) window.addEventListener('keydown', onKeyDown) })
  onUnmounted(() => { if (registerShortcuts) window.removeEventListener('keydown', onKeyDown) })

  return { clipboard: _clipboard, copySelected, pasteClipboard }
}
