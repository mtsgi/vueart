<script setup lang="ts">
/**
 * ObjectLayerList — オブジェクトレイヤーリスト（共通コンポーネント）
 * LayersWindow と ObjectStackSidebar の両方から利用される共通実装。
 * グループのツリー表示・展開折りたたみ・表示/ロック切り替え・ドラッグ並び替えを提供する。
 */
import { computed, ref } from 'vue'
import { useDocumentStore } from '@/stores/useDocumentStore'
import { useHistory } from '@/composables/useHistory'
import type { CanvasObject } from '@/types/objects'

const docStore = useDocumentStore()
const { commit } = useHistory()

// 表示順（上から下）のトップレベルオブジェクト
const topObjects = computed(() => [...(docStore.activeDocument?.objects ?? [])].reverse())

// 展開中グループID集合
const openGroups = ref<Set<string>>(new Set())

function toggleGroup(id: string) {
  if (openGroups.value.has(id)) {
    openGroups.value.delete(id)
  } else {
    openGroups.value.add(id)
  }
}

interface LayerEntry {
  obj: CanvasObject
  depth: number
  /** トップレベルでの表示インデックス（ドラッグ並び替え用、子要素は null） */
  sortableIndex: number | null
}

/** ツリーを深さ情報付きフラットリストに展開 */
function flattenTree(list: CanvasObject[], depth = 0): LayerEntry[] {
  return list.flatMap((obj, i) => {
    const sortableIndex = depth === 0 ? i : null
    const entry: LayerEntry = { obj, depth, sortableIndex }
    if (obj.type === 'group' && openGroups.value.has(obj.id)) {
      return [entry, ...flattenTree([...obj.children].reverse(), depth + 1)]
    }
    return [entry]
  })
}

const flatEntries = computed(() => flattenTree(topObjects.value))

const objectCount = computed(() => docStore.activeDocument?.objects.length ?? 0)

function typeIcon(type: string): string {
  switch (type) {
    case 'rect':    return 'R'
    case 'ellipse': return 'E'
    case 'text':    return 'T'
    case 'image':   return 'I'
    case 'group':   return 'G'
    default:        return '?'
  }
}

// ---- ドラッグ並び替え（トップレベルのみ） ----
const dragSrcIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

/** 表示インデックス（反転済み）→ doc.objects 内の実際のインデックスに変換 */
function visualToActual(vi: number): number {
  const doc = docStore.activeDocument
  if (!doc) return vi
  return doc.objects.length - 1 - vi
}

function onDragStart(e: DragEvent, entry: LayerEntry) {
  if (entry.sortableIndex === null) { e.preventDefault(); return }
  dragSrcIndex.value = entry.sortableIndex
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(entry.sortableIndex))
  }
}

function onDragOver(e: DragEvent, entry: LayerEntry) {
  if (entry.sortableIndex === null) return
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  dragOverIndex.value = entry.sortableIndex
}

function onDragLeave() {
  dragOverIndex.value = null
}

function onDrop(e: DragEvent, entry: LayerEntry) {
  e.preventDefault()
  dragOverIndex.value = null
  const fromVi = dragSrcIndex.value
  dragSrcIndex.value = null
  if (entry.sortableIndex === null || fromVi === null || fromVi === entry.sortableIndex) return
  commit()
  docStore.reorderObjects(visualToActual(fromVi), visualToActual(entry.sortableIndex))
}

function onDragEnd() {
  dragSrcIndex.value = null
  dragOverIndex.value = null
}
</script>

<template>
  <div class="layer-list">
    <div class="layer-list__header">
      <span>{{ objectCount }} 個のオブジェクト</span>
    </div>

    <div
      v-for="entry in flatEntries"
      :key="entry.obj.id"
      class="layer-item"
      :class="{
        selected: docStore.activeSelectedIds.has(entry.obj.id),
        'drag-over': entry.sortableIndex !== null && dragOverIndex === entry.sortableIndex,
      }"
      :style="{ paddingLeft: `${6 + entry.depth * 12}px` }"
      :draggable="entry.sortableIndex !== null"
      @click="docStore.selectObject(entry.obj.id, $event.shiftKey)"
      @dragstart="onDragStart($event, entry)"
      @dragover="onDragOver($event, entry)"
      @dragleave="onDragLeave"
      @drop="onDrop($event, entry)"
      @dragend="onDragEnd"
    >
      <!-- ドラッグハンドル（トップレベルのみ、子要素はスペーサー） -->
      <span v-if="entry.sortableIndex !== null" class="drag-handle" title="ドラッグで並び替え">
        <font-awesome-icon icon="grip-lines" />
      </span>
      <span v-else class="drag-placeholder" />

      <!-- グループ折りたたみボタン / スペーサー -->
      <button
        v-if="entry.obj.type === 'group'"
        class="expand-btn"
        @click.stop="toggleGroup(entry.obj.id)"
      >
        <font-awesome-icon :icon="openGroups.has(entry.obj.id) ? 'chevron-down' : 'chevron-right'" />
      </button>
      <span v-else class="expand-placeholder" />

      <!-- タイプバッジ -->
      <span class="layer-type">{{ typeIcon(entry.obj.type) }}</span>

      <!-- ラベル -->
      <span class="layer-label" :title="entry.obj.id">
        {{ entry.obj.label || entry.obj.type }}
      </span>

      <!-- 表示・ロック切り替えボタン -->
      <div class="layer-controls">
        <button
          class="ctrl-btn"
          :title="entry.obj.visible ? '非表示にする' : '表示する'"
          @click.stop="docStore.updateObject(entry.obj.id, { visible: !entry.obj.visible })"
        ><font-awesome-icon :icon="entry.obj.visible ? 'eye' : 'eye-slash'" /></button>
        <button
          class="ctrl-btn"
          :title="entry.obj.locked ? 'ロック解除' : 'ロックする'"
          @click.stop="docStore.updateObject(entry.obj.id, { locked: !entry.obj.locked })"
        ><font-awesome-icon :icon="entry.obj.locked ? 'lock' : 'lock-open'" /></button>
      </div>
    </div>

    <div v-if="flatEntries.length === 0" class="empty-hint">
      オブジェクトがありません。<br>描画ツールで図形を追加してください。
    </div>
  </div>
</template>

<style lang="scss" scoped>
.layer-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--panel-bg);
  overflow: hidden;

  &__header {
    padding: 4px 6px;
    font-size: 10px;
    color: var(--text-secondary);
    border-bottom: 1px solid var(--win-border-dark);
    flex-shrink: 0;
  }
}

.layer-item {
  display: flex;
  align-items: center;
  padding: 2px 6px;
  gap: 3px;
  cursor: default;
  font-size: 11px;
  color: var(--text-primary);
  border-bottom: 1px solid var(--win-border-dark);

  &:hover { background: var(--win-bg); }

  &.selected {
    background: var(--win-titlebar-active);
    color: white;

    .layer-type {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }
  }

  &.drag-over {
    border-top: 2px solid var(--accent);
  }
}

.drag-handle {
  color: var(--text-secondary);
  font-size: 10px;
  cursor: grab;
  user-select: none;
  flex-shrink: 0;
  &:active { cursor: grabbing; }
}

.drag-placeholder,
.expand-placeholder {
  width: 10px;
  flex-shrink: 0;
}

.expand-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 8px;
  padding: 0;
  width: 10px;
  flex-shrink: 0;
  color: var(--text-secondary);
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
}

.layer-controls {
  display: flex;
  gap: 1px;
  flex-shrink: 0;
}

.ctrl-btn {
  background: transparent;
  border: none;
  cursor: default;
  font-size: 10px;
  padding: 0;
  line-height: 1;
  width: 14px;
  text-align: center;
  color: var(--text-secondary);

  &:hover { color: var(--text-primary); }
}

.empty-hint {
  padding: 12px 8px;
  font-size: 10px;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.6;
}
</style>
