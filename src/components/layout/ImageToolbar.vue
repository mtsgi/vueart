<script setup lang="ts">
/**
 * ImageToolbar — [イメージ]ツールバー
 * 選択中オブジェクトの色・サイズ・配置などの主要プロパティをインラインで素早く変更できるツールバー。
 */
import { computed } from 'vue'
import { useDocumentStore } from '@/stores/useDocumentStore'
import { useHistory } from '@/composables/useHistory'
import type { CanvasObject, RectObject, EllipseObject, TextObject } from '@/types/objects'

const docStore = useDocumentStore()
const { commit } = useHistory()

const obj = computed(() => docStore.selectedObject)

// fill/stroke を持つ型かどうかの型ガード
function hasFillProp(o: CanvasObject): o is RectObject | EllipseObject | TextObject {
  return o.type === 'rect' || o.type === 'ellipse' || o.type === 'text'
}
function hasStrokeProp(o: CanvasObject): o is RectObject | EllipseObject {
  return o.type === 'rect' || o.type === 'ellipse'
}

const hasFill = computed(() => obj.value && hasFillProp(obj.value))
const hasStroke = computed(() => obj.value && hasStrokeProp(obj.value))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function update(key: string, value: any) {
  if (!obj.value) return
  docStore.updateObject(obj.value.id, { [key]: value })
}

const filterDefs = computed(() => docStore.activeDocument?.filterDefs ?? [])
</script>

<template>
  <div class="toolbar image-toolbar">
    <span class="toolbar__label">[イメージ]</span>

    <!-- 選択なし時のプレースホルダー -->
    <span v-if="!obj" class="toolbar__hint">オブジェクトを選択してください</span>

    <template v-else>
      <template v-if="hasFill && obj && hasFillProp(obj)">
        <label class="toolbar__field-label">塗り</label>
        <input
          type="color"
          class="toolbar__color"
          :value="obj.fill"
          :title="'塗りつぶし色'"
          @input="update('fill', ($event.target as HTMLInputElement).value)"
          @change="commit()"
        />
      </template>

      <!-- 枠線色 -->
      <template v-if="hasStroke && obj && hasStrokeProp(obj)">
        <label class="toolbar__field-label">枠</label>
        <input
          type="color"
          class="toolbar__color"
          :value="obj.stroke"
          :title="'枠線色'"
          @input="update('stroke', ($event.target as HTMLInputElement).value)"
          @change="commit()"
        />
        <input
          type="number"
          class="toolbar__number"
          min="0"
          :value="obj.strokeWidth"
          title="枠線幅"
          @change="update('strokeWidth', +($event.target as HTMLInputElement).value); commit()"
        />
        <span class="toolbar__unit">px</span>
      </template>

      <div class="toolbar__sep" />

      <!-- 透明度 -->
      <label class="toolbar__field-label">透過</label>
      <input
        type="range"
        class="toolbar__range"
        min="0"
        max="1"
        step="0.01"
        :value="obj.opacity"
        title="透明度"
        @input="update('opacity', +($event.target as HTMLInputElement).value)"
        @change="commit()"
      />

      <div class="toolbar__sep" />

      <!-- フィルタ適用 -->
      <label class="toolbar__field-label">効果</label>
      <select
        class="toolbar__select"
        :value="obj.filterId ?? ''"
        title="SVGフィルタ効果"
        @change="update('filterId', ($event.target as HTMLSelectElement).value || null); commit()"
      >
        <option value="">なし</option>
        <option v-for="f in filterDefs" :key="f.id" :value="f.id">{{ f.name }}</option>
      </select>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.image-toolbar {
  display: flex;
  align-items: center;
  height: 28px;
  background: var(--panel-bg);
  border-bottom: 2px solid var(--win-border-dark);
  padding: 2px 6px;
  gap: 4px;
  flex-shrink: 0;

  .toolbar__label {
    font-size: 10px;
    color: var(--text-secondary);
    padding-right: 6px;
    border-right: 1px solid var(--win-border-dark);
    margin-right: 2px;
    white-space: nowrap;
  }

  .toolbar__hint {
    font-size: 10px;
    color: var(--text-secondary);
    font-style: italic;
  }

  .toolbar__field-label {
    font-size: 10px;
    color: var(--text-secondary);
    white-space: nowrap;
    cursor: default;
  }

  .toolbar__color {
    width: 28px;
    height: 20px;
    padding: 0;
    border: 1px solid var(--win-border-dark);
    cursor: pointer;
  }

  .toolbar__number {
    width: 36px;
    height: 18px;
    padding: 0 2px;
    font-size: 11px;
    background: var(--panel-inset-bg);
    color: var(--text-primary);
    border: 1px solid var(--win-border-dark);
  }

  .toolbar__unit {
    font-size: 10px;
    color: var(--text-secondary);
  }

  .toolbar__range {
    width: 60px;
    height: 14px;
    accent-color: var(--accent);
  }

  .toolbar__select {
    height: 20px;
    font-size: 10px;
    padding: 0 2px;
    background: var(--panel-inset-bg);
    color: var(--text-primary);
    border: 1px solid var(--win-border-dark);
    max-width: 120px;
  }

  .toolbar__sep {
    width: 1px;
    height: 18px;
    background: var(--win-border-dark);
    margin: 0 4px;
  }
}
</style>
