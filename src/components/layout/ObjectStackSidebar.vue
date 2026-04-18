<script setup lang="ts">
/**
 * ObjectStackSidebar — オブジェクトスタック（右サイドバー）
 * アクティブキャンバス上の要素一覧を重なり順で管理するパネル。
 * クリックで選択、ドラッグで順番変更（将来実装）、可視・ロック切り替えを提供する。
 */
import { computed, ref } from 'vue'
import { useDocumentStore } from '@/stores/useDocumentStore'
import { useHistory } from '@/composables/useHistory'
import type { CanvasObject, RectObject, EllipseObject, TextObject } from '@/types/objects'

const docStore = useDocumentStore()
const { commit } = useHistory()

// 型ガード関数
function isRectOrEllipse(o: CanvasObject): o is RectObject | EllipseObject {
  return o.type === 'rect' || o.type === 'ellipse'
}
function isRect(o: CanvasObject): o is RectObject {
  return o.type === 'rect'
}
function isText(o: CanvasObject): o is TextObject {
  return o.type === 'text'
}

// 上から順（描画順の逆）で表示
const objects = computed(() => {
  const doc = docStore.activeDocument
  return doc ? [...doc.objects].reverse() : []
})

// プロパティパネルの開閉状態
const propPanelOpen = ref(true)

// 選択中オブジェクト
const selectedObj = computed(() => docStore.selectedObject)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function updateProp(key: string, value: any) {
  if (!selectedObj.value) return
  docStore.updateObject(selectedObj.value.id, { [key]: value })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function commitProp(key: string, value: any) {
  updateProp(key, value)
  commit()
}

function onDelete() {
  if (!selectedObj.value) return
  commit()
  docStore.removeObject(selectedObj.value.id)
}

const filterDefs = computed(() => docStore.activeDocument?.filterDefs ?? [])

// ドラッグ並び替えの状態
const dragSrcVisualIndex = ref<number | null>(null)
const dragOverVisualIndex = ref<number | null>(null)

/**
 * 表示インデックス（上から下）→ 内部配列インデックス（下から上）の変換
 * objects は reversed() されているため逆展開になる
 */
function visualToActual(vi: number): number {
  const doc = docStore.activeDocument
  if (!doc) return vi
  return doc.objects.length - 1 - vi
}

function onDragStart(e: DragEvent, vi: number) {
  dragSrcVisualIndex.value = vi
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(vi))
  }
}

function onDragOver(e: DragEvent, vi: number) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  dragOverVisualIndex.value = vi
}

function onDragLeave() {
  dragOverVisualIndex.value = null
}

function onDrop(e: DragEvent, toVi: number) {
  e.preventDefault()
  dragOverVisualIndex.value = null
  const fromVi = dragSrcVisualIndex.value
  dragSrcVisualIndex.value = null
  if (fromVi === null || fromVi === toVi) return

  commit()
  docStore.reorderObjects(visualToActual(fromVi), visualToActual(toVi))
}

function onDragEnd() {
  dragSrcVisualIndex.value = null
  dragOverVisualIndex.value = null
}

// タイプのラベル
const typeLabels: Record<string, string> = {
  rect: '矩形',
  ellipse: '楕円',
  text: 'テキスト',
  image: '画像',
}
</script>

<template>
  <div class="object-stack">
    <!-- ヘッダー -->
    <div class="object-stack__header">
      <span class="panel-title">オブジェクトスタック</span>
      <span class="obj-count">{{ objects.length }}件</span>
    </div>

    <!-- オブジェクト一覧 -->
    <div class="object-stack__list">
      <div
        v-for="(obj, vi) in objects"
        :key="obj.id"
        class="obj-row"
        :class="{
          selected: docStore.activeSelectedIds.has(obj.id),
          'drag-over': dragOverVisualIndex === vi,
        }"
        draggable="true"
        @click="docStore.selectObject(obj.id, $event.shiftKey)"
        @dragstart="onDragStart($event, vi)"
        @dragover="onDragOver($event, vi)"
        @dragleave="onDragLeave"
        @drop="onDrop($event, vi)"
        @dragend="onDragEnd"
      >
        <!-- ドラッグハンドルアイコン -->
        <span class="obj-row__drag-handle" title="ドラッグで並び替え">≡</span>

        <!-- タイプアイコン -->
        <span class="obj-row__type-badge">{{ obj.type[0].toUpperCase() }}</span>

        <!-- ラベル/タイプ名 -->
        <span class="obj-row__label" :title="obj.id">
          {{ obj.label || typeLabels[obj.type] || obj.type }}
        </span>

        <!-- コントロールボタン群 -->
        <div class="obj-row__controls">
          <button
            class="ctrl-btn"
            :title="obj.visible ? '非表示にする' : '表示する'"
            @click.stop="docStore.updateObject(obj.id, { visible: !obj.visible })"
          >{{ obj.visible ? '👁' : '🚫' }}</button>
          <button
            class="ctrl-btn"
            :title="obj.locked ? 'ロック解除' : 'ロックする'"
            @click.stop="docStore.updateObject(obj.id, { locked: !obj.locked })"
          >{{ obj.locked ? '🔒' : '🔓' }}</button>
        </div>
      </div>

      <div v-if="objects.length === 0" class="empty-state">
        <p>キャンバスにオブジェクトがありません。</p>
        <p class="hint">描画ツールを使って図形を追加してください。</p>
      </div>
    </div>

    <!-- プロパティパネル（折りたたみ） -->
    <div class="prop-panel">
      <button class="prop-panel__toggle" @click="propPanelOpen = !propPanelOpen">
        <span>{{ propPanelOpen ? '▾' : '▸' }}</span>
        プロパティ
        <span v-if="selectedObj" class="prop-panel__type">（{{ typeLabels[selectedObj.type] ?? selectedObj.type }}）</span>
      </button>

      <div v-if="propPanelOpen" class="prop-panel__body">
        <div v-if="!selectedObj" class="prop-panel__empty">
          オブジェクトを選択してください
        </div>

        <template v-else>
          <!-- 位置・サイズ -->
          <div class="prop-section">位置・サイズ</div>
          <div class="prop-grid">
            <label>X</label>
            <input type="number" :value="Math.round(selectedObj.x)" @change="commitProp('x', +($event.target as HTMLInputElement).value)" />
            <label>Y</label>
            <input type="number" :value="Math.round(selectedObj.y)" @change="commitProp('y', +($event.target as HTMLInputElement).value)" />
            <label>幅</label>
            <input type="number" :value="Math.round(selectedObj.width)" @change="commitProp('width', +($event.target as HTMLInputElement).value)" />
            <label>高さ</label>
            <input type="number" :value="Math.round(selectedObj.height)" @change="commitProp('height', +($event.target as HTMLInputElement).value)" />
            <label>回転</label>
            <input type="number" :value="selectedObj.rotation" @change="commitProp('rotation', +($event.target as HTMLInputElement).value)" />
          </div>

          <!-- 色（矩形・楕円） -->
          <template v-if="isRectOrEllipse(selectedObj)">
            <div class="prop-section">色・枠線</div>
            <div class="prop-grid">
              <label>塗り</label>
              <input type="color" :value="selectedObj.fill" @input="updateProp('fill', ($event.target as HTMLInputElement).value)" @change="commit()" />
              <label>枠色</label>
              <input type="color" :value="selectedObj.stroke" @input="updateProp('stroke', ($event.target as HTMLInputElement).value)" @change="commit()" />
              <label>枠幅</label>
              <input type="number" min="0" :value="selectedObj.strokeWidth" @change="commitProp('strokeWidth', +($event.target as HTMLInputElement).value)" />
            </div>
            <template v-if="isRect(selectedObj)">
              <div class="prop-grid">
                <label>角丸Rx</label>
                <input type="number" min="0" :value="selectedObj.rx" @change="commitProp('rx', +($event.target as HTMLInputElement).value)" />
              </div>
            </template>
          </template>

          <!-- テキスト -->
          <template v-if="isText(selectedObj)">
            <div class="prop-section">テキスト</div>
            <div class="prop-row-full">
              <label>内容</label>
              <input type="text" :value="selectedObj.text" @change="commitProp('text', ($event.target as HTMLInputElement).value)" />
            </div>
            <div class="prop-grid">
              <label>サイズ</label>
              <input type="number" min="4" :value="selectedObj.fontSize" @change="commitProp('fontSize', +($event.target as HTMLInputElement).value)" />
              <label>色</label>
              <input type="color" :value="selectedObj.fill" @input="updateProp('fill', ($event.target as HTMLInputElement).value)" @change="commit()" />
            </div>
          </template>

          <!-- SVGフィルタ -->
          <div class="prop-section">フィルタ効果</div>
          <div class="prop-row-full">
            <label>効果</label>
            <select :value="selectedObj.filterId ?? ''" @change="commitProp('filterId', ($event.target as HTMLSelectElement).value || null)">
              <option value="">なし</option>
              <option v-for="f in filterDefs" :key="f.id" :value="f.id">{{ f.name }}</option>
            </select>
          </div>

          <!-- 削除ボタン -->
          <div class="prop-actions">
            <button class="btn-delete" @click="onDelete">選択を削除</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.object-stack {
  width: 200px;
  min-width: 160px;
  height: 100%;
  background: var(--panel-bg);
  border-left: 2px solid var(--win-border-dark);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 8px;
    background: var(--win-bg);
    border-bottom: 1px solid var(--win-border-dark);
    flex-shrink: 0;

    .panel-title {
      font-size: 11px;
      font-weight: bold;
      color: var(--text-primary);
    }

    .obj-count {
      font-size: 10px;
      color: var(--text-secondary);
    }
  }

  &__list {
    flex: 1;
    overflow-y: auto;
    min-height: 80px;
    max-height: 40%;
  }
}

.obj-row {
  display: flex;
  align-items: center;
  padding: 2px 6px;
  gap: 5px;
  cursor: default;
  border-bottom: 1px solid var(--win-border-dark);
  font-size: 11px;

  &:hover { background: var(--win-bg); }
  &.selected {
    background: var(--win-titlebar-active);
    color: white;
    .obj-row__type-badge { background: rgba(255,255,255,0.2); }
  }

  &.drag-over {
    border-top: 2px solid var(--accent);
  }

  &__drag-handle {
    color: var(--text-secondary);
    font-size: 12px;
    cursor: grab;
    user-select: none;
    flex-shrink: 0;
    padding: 0 2px;
    &:active { cursor: grabbing; }
  }

  &__type-badge {
    width: 14px;
    height: 14px;
    font-size: 9px;
    font-weight: bold;
    background: var(--panel-inset-bg);
    color: var(--accent);
    border: 1px solid var(--win-border-dark);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-primary);
    .selected & { color: white; }
  }

  &__controls {
    display: flex;
    gap: 1px;
    flex-shrink: 0;
  }
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
}

.empty-state {
  padding: 16px 10px;
  font-size: 10px;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.7;

  .hint { margin-top: 4px; }
}

// ---- プロパティパネル ----
.prop-panel {
  flex-shrink: 0;
  border-top: 2px solid var(--win-border-light);
  overflow-y: auto;
  max-height: 62%;

  &__toggle {
    display: flex;
    align-items: center;
    gap: 4px;
    width: 100%;
    padding: 4px 8px;
    font-size: 11px;
    font-weight: bold;
    background: var(--win-bg);
    color: var(--text-primary);
    border: none;
    border-bottom: 1px solid var(--win-border-dark);
    cursor: default;
    text-align: left;

    &:hover { background: var(--panel-inset-bg); }
  }

  &__type {
    font-weight: normal;
    font-size: 10px;
    color: var(--accent);
  }

  &__empty {
    padding: 8px;
    font-size: 10px;
    color: var(--text-secondary);
    text-align: center;
  }

  &__body {
    padding: 4px 6px;
  }
}

.prop-section {
  font-size: 10px;
  font-weight: bold;
  color: var(--accent);
  text-transform: none;
  padding: 5px 0 2px;
  border-bottom: 1px solid var(--win-border-dark);
  margin-bottom: 3px;
  letter-spacing: 0.3px;
}

.prop-grid {
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 2px 4px;
  margin-bottom: 3px;

  label {
    font-size: 10px;
    color: var(--text-secondary);
    text-align: right;
    align-self: center;
    white-space: nowrap;
  }

  input[type='number'],
  input[type='text'],
  input[type='color'] {
    height: 16px;
    padding: 0 2px;
    font-size: 11px;
    background: var(--panel-inset-bg);
    color: var(--text-primary);
    border: 1px solid var(--win-border-dark);
  }

  input[type='color'] {
    padding: 0;
    width: 100%;
    cursor: pointer;
  }
}

.prop-row-full {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 3px;

  label {
    font-size: 10px;
    color: var(--text-secondary);
    white-space: nowrap;
    width: 36px;
    text-align: right;
  }

  input, select {
    flex: 1;
    height: 16px;
    padding: 0 2px;
    font-size: 11px;
    background: var(--panel-inset-bg);
    color: var(--text-primary);
    border: 1px solid var(--win-border-dark);
  }
}

.prop-actions {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
  padding-bottom: 4px;
}

.btn-delete {
  padding: 2px 10px;
  font-size: 11px;
  cursor: default;
  background: var(--danger);
  color: white;
  border-top: 1px solid #ff6666;
  border-left: 1px solid #ff6666;
  border-right: 1px solid #880000;
  border-bottom: 1px solid #880000;

  &:active {
    border-color: #880000 #ff6666 #ff6666 #880000;
  }
}
</style>
