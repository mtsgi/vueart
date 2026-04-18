import { defineStore } from 'pinia'
import { ref, computed, toRaw } from 'vue'
import type { CanvasDocument } from '@/types/document'
import type { CanvasObject, GroupObject } from '@/types/objects'
import type { SvgFilterDefinition } from '@/types/filters'
import { generateId } from '@/utils/idGenerator'
import { builtinFilters } from '@/utils/svgFilters'
import { useHistoryStore } from './useHistoryStore'

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

  /** アクティブキャンバスの選択中オブジェクト（グループ子要素も再帰検索） */
  const selectedObjects = computed<CanvasObject[]>(() => {
    const doc = activeDocument.value
    const ids = activeSelectedIds.value
    if (!doc) return []
    return [...ids].map(id => findObjectById(id, doc.objects)).filter((o): o is CanvasObject => o !== null)
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

  // ---- 再帰ユーティリティ ----

  /** オブジェクトツリーから id に一致するオブジェクトを再帰検索 */
  function findObjectById(id: string, objects?: CanvasObject[]): CanvasObject | null {
    const list = objects ?? activeDocument.value?.objects ?? []
    for (const obj of list) {
      if (obj.id === id) return obj
      if (obj.type === 'group') {
        const found = findObjectById(id, obj.children)
        if (found) return found
      }
    }
    return null
  }

  /** オブジェクトリストから id に一致するオブジェクトを再帰削除（イミュータブル） */
  function removeFromList(id: string, list: CanvasObject[]): CanvasObject[] {
    return list
      .filter(o => o.id !== id)
      .map(o => {
        if (o.type === 'group') {
          return { ...o, children: removeFromList(id, o.children) }
        }
        return o
      })
  }

  /** オブジェクトリストから id に一致するオブジェクトを再帰更新（イミュータブル） */
  function patchInList(id: string, patch: Partial<CanvasObject>, list: CanvasObject[]): CanvasObject[] {
    return list.map(o => {
      if (o.id === id) return { ...o, ...patch } as CanvasObject
      if (o.type === 'group') {
        return { ...o, children: patchInList(id, patch, o.children) }
      }
      return o
    })
  }

  // ---- 基本 CRUD（再帰対応版） ----

  function addObject(obj: CanvasObject) {
    const doc = activeDocument.value
    if (!doc) return
    doc.objects.push(obj)
    setSelected(new Set([obj.id]))
  }

  function updateObject(id: string, patch: Partial<CanvasObject>) {
    const doc = activeDocument.value
    if (!doc) return
    doc.objects = patchInList(id, patch, doc.objects)
  }

  function removeObject(id: string) {
    const doc = activeDocument.value
    if (!doc) return
    doc.objects = removeFromList(id, doc.objects)
    const sel = new Set(activeSelectedIds.value)
    sel.delete(id)
    setSelected(sel)
  }

  // ---- グループ操作 ----

  /**
   * 指定 ID リストのオブジェクトをグループ化する。
   * 対象オブジェクトのバウンディングボックスを計算し、
   * 子座標をグループ origin 相対に変換した GroupObject を生成する。
   */
  function groupObjects(ids: string[]) {
    const doc = activeDocument.value
    if (!doc || ids.length < 2) return
    const historyStore = useHistoryStore()
    historyStore.push(getSnapshot()!)

    const targets = ids
      .map(id => doc.objects.find(o => o.id === id))
      .filter((o): o is CanvasObject => o !== undefined)
    if (targets.length < 2) return

    // バウンディングボックスを計算
    const left   = Math.min(...targets.map(o => o.x))
    const top    = Math.min(...targets.map(o => o.y))
    const right  = Math.max(...targets.map(o => o.x + o.width))
    const bottom = Math.max(...targets.map(o => o.y + o.height))

    // 子座標をグループ origin 相対に変換
    const children: CanvasObject[] = targets.map(o => ({ ...o, x: o.x - left, y: o.y - top }))

    const group: GroupObject = {
      id: generateId(),
      type: 'group',
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      filterId: null,
      label: 'グループ',
      children,
    }

    // top-level から対象を除去してグループを追加
    doc.objects = doc.objects.filter(o => !ids.includes(o.id))
    doc.objects.push(group)
    setSelected(new Set([group.id]))
  }

  /**
   * 指定 ID のグループを解除し、子オブジェクトを top-level に展開する。
   */
  function ungroupObject(id: string) {
    const doc = activeDocument.value
    if (!doc) return
    const group = doc.objects.find(o => o.id === id)
    if (!group || group.type !== 'group') return

    const historyStore = useHistoryStore()
    historyStore.push(getSnapshot()!)

    // 子座標をグループ origin 分だけオフセットして絶対座標に復元
    const restored: CanvasObject[] = group.children.map(child => ({
      ...child,
      x: child.x + group.x,
      y: child.y + group.y,
    }))

    doc.objects = doc.objects.filter(o => o.id !== id)
    doc.objects.push(...restored)
    setSelected(new Set(restored.map(o => o.id)))
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

  /** キャンバスドキュメントのサイズを更新（キャンバスリサイズ操作用） */
  function updateCanvasSize(canvasId: string, width: number, height: number) {
    const doc = documents.value.get(canvasId)
    if (!doc) return
    doc.width = Math.max(10, Math.round(width))
    doc.height = Math.max(10, Math.round(height))
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
    findObjectById,
    selectObject,
    clearSelection,
    reorderObjects,
    groupObjects,
    ungroupObject,
    getSnapshot,
    restoreSnapshot,
    addFilterDef,
    updateCanvasSize,
  }
})

