import { defineStore } from 'pinia'
import { ref, computed, toRaw } from 'vue'
import type { CanvasDocument } from '@/types/document'
import type { CanvasObject } from '@/types/objects'
import type { SvgFilterDefinition } from '@/types/filters'
import { generateId } from '@/utils/idGenerator'
import { builtinFilters } from '@/utils/svgFilters'

// キャンバスウィンドウIDに紐づくデフォルトドキュメントを生成
function createDefaultDocument(name = '新規キャンバス'): CanvasDocument {
  return {
    id: generateId(),
    name,
    width: 400,
    height: 300,
    backgroundColor: 'transparent',
    objects: [],
    filterDefs: builtinFilters(),
  }
}

export const useDocumentStore = defineStore('document', () => {
  // キャンバスウィンドウID → CanvasDocument のマップ
  const documents = ref<Map<string, CanvasDocument>>(new Map())
  // キャンバスウィンドウID → 選択中オブジェクトID集合
  const selectedObjectIds = ref<Map<string, Set<string>>>(new Map())
  // 現在操作対象のキャンバスウィンドウID
  const activeCanvasId = ref<string | null>(null)

  /** アクティブなドキュメントを取得 */
  const activeDocument = computed<CanvasDocument | null>(() =>
    activeCanvasId.value ? (documents.value.get(activeCanvasId.value) ?? null) : null
  )

  /** アクティブキャンバスの選択中オブジェクトID集合 */
  const activeSelectedIds = computed<Set<string>>(() =>
    activeCanvasId.value ? (selectedObjectIds.value.get(activeCanvasId.value) ?? new Set()) : new Set()
  )

  /** アクティブキャンバスの選択中オブジェクト */
  const selectedObjects = computed<CanvasObject[]>(() => {
    const doc = activeDocument.value
    const ids = activeSelectedIds.value
    return doc ? doc.objects.filter(o => ids.has(o.id)) : []
  })

  /** 単一選択中オブジェクト */
  const selectedObject = computed<CanvasObject | null>(() =>
    selectedObjects.value.length === 1 ? selectedObjects.value[0] : null
  )

  /** キャンバスウィンドウIDでドキュメントを取得（なければ作成） */
  function getOrCreateDocument(canvasId: string, name?: string): CanvasDocument {
    if (!documents.value.has(canvasId)) {
      documents.value.set(canvasId, createDefaultDocument(name))
      selectedObjectIds.value.set(canvasId, new Set())
    }
    return documents.value.get(canvasId)!
  }

  /** アクティブキャンバスを切り替え */
  function setActiveCanvas(canvasId: string | null) {
    activeCanvasId.value = canvasId
  }

  /** キャンバスを削除 */
  function removeCanvas(canvasId: string) {
    documents.value.delete(canvasId)
    selectedObjectIds.value.delete(canvasId)
    if (activeCanvasId.value === canvasId) activeCanvasId.value = null
  }

  // ---- 以下はアクティブドキュメントに対する操作 ----

  function addObject(obj: CanvasObject) {
    const doc = activeDocument.value
    if (!doc) return
    doc.objects.push(obj)
    setSelected(new Set([obj.id]))
  }

  function updateObject(id: string, patch: Partial<CanvasObject>) {
    const doc = activeDocument.value
    if (!doc) return
    const idx = doc.objects.findIndex(o => o.id === id)
    if (idx !== -1) {
      doc.objects[idx] = { ...doc.objects[idx], ...patch } as CanvasObject
    }
  }

  function removeObject(id: string) {
    const doc = activeDocument.value
    if (!doc) return
    doc.objects = doc.objects.filter(o => o.id !== id)
    const sel = new Set(activeSelectedIds.value)
    sel.delete(id)
    setSelected(sel)
  }

  function selectObject(id: string, multi = false) {
    const cur = activeSelectedIds.value
    if (multi) {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id); else next.add(id)
      setSelected(next)
    } else {
      setSelected(new Set([id]))
    }
  }

  function clearSelection() {
    setSelected(new Set())
  }

  function setSelected(ids: Set<string>) {
    if (activeCanvasId.value) selectedObjectIds.value.set(activeCanvasId.value, ids)
  }

  function reorderObjects(fromIndex: number, toIndex: number) {
    const doc = activeDocument.value
    if (!doc) return
    const objs = [...doc.objects]
    const [moved] = objs.splice(fromIndex, 1)
    objs.splice(toIndex, 0, moved)
    doc.objects = objs
  }

  function getSnapshot(): CanvasDocument | null {
    const doc = activeDocument.value
    if (!doc) return null
    // toRaw でリアクティブProxyを解除してからJSON roundtripでディープコピー
    // structuredClone は Vue の Proxy を複製できないため使用しない
    return JSON.parse(JSON.stringify(toRaw(doc))) as CanvasDocument
  }

  function restoreSnapshot(snapshot: CanvasDocument) {
    if (!activeCanvasId.value) return
    documents.value.set(activeCanvasId.value, snapshot)
    setSelected(new Set())
  }

  function addFilterDef(filter: SvgFilterDefinition) {
    activeDocument.value?.filterDefs.push(filter)
  }

  return {
    documents,
    selectedObjectIds,
    activeCanvasId,
    activeDocument,
    activeSelectedIds,
    selectedObjects,
    selectedObject,
    getOrCreateDocument,
    setActiveCanvas,
    removeCanvas,
    addObject,
    updateObject,
    removeObject,
    selectObject,
    clearSelection,
    reorderObjects,
    getSnapshot,
    restoreSnapshot,
    addFilterDef,
  }
})

