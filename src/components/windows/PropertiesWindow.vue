<script setup lang="ts">
import { computed } from 'vue'
import { useDocumentStore } from '@/stores/useDocumentStore'
import { useHistory } from '@/composables/useHistory'
import type { CanvasObject } from '@/types/objects'

const docStore = useDocumentStore()
const { commit } = useHistory()

const obj = computed(() => docStore.selectedObject)
const filterDefs = computed(() => docStore.activeDocument?.filterDefs ?? [])

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function update(key: string, value: any) {
  if (!obj.value) return
  docStore.updateObject(obj.value.id, { [key]: value } as Partial<CanvasObject>)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function commitUpdate(key: string, value: any) {
  update(key, value)
  commit()
}

function onDelete() {
  if (!obj.value) return
  commit()
  docStore.removeObject(obj.value.id)
}
</script>

<template>
  <div class="props-panel">
    <div v-if="!obj" class="no-selection">
      <p>オブジェクト未選択</p>
      <p class="hint">図形をクリックして選択してください</p>
    </div>

    <template v-else>
      <!-- Object info -->
      <div class="section-title">オブジェクト</div>
      <div class="prop-row">
        <label>種別</label>
        <span class="value-text">{{ obj.type }}</span>
      </div>

      <!-- Position & Size -->
      <div class="section-title">位置・サイズ</div>
      <div class="prop-row">
        <label>X</label>
        <input type="number" :value="Math.round(obj.x)" @change="commitUpdate('x', +($event.target as HTMLInputElement).value)" />
      </div>
      <div class="prop-row">
        <label>Y</label>
        <input type="number" :value="Math.round(obj.y)" @change="commitUpdate('y', +($event.target as HTMLInputElement).value)" />
      </div>
      <div class="prop-row">
        <label>W</label>
        <input type="number" :value="Math.round(obj.width)" @change="commitUpdate('width', +($event.target as HTMLInputElement).value)" />
      </div>
      <div class="prop-row">
        <label>H</label>
        <input type="number" :value="Math.round(obj.height)" @change="commitUpdate('height', +($event.target as HTMLInputElement).value)" />
      </div>
      <div class="prop-row">
        <label>回転</label>
        <input type="number" :value="obj.rotation" @change="commitUpdate('rotation', +($event.target as HTMLInputElement).value)" />
      </div>
      <div class="prop-row">
        <label>不透明度</label>
        <input type="range" min="0" max="1" step="0.01" :value="obj.opacity" @input="update('opacity', +($event.target as HTMLInputElement).value)" @change="commit()" />
      </div>

      <!-- Fill / Text color -->
      <template v-if="obj.type === 'rect' || obj.type === 'ellipse'">
        <div class="section-title">外観</div>
        <div class="prop-row">
          <label>塗り</label>
          <input type="color" :value="obj.fill" @input="update('fill', ($event.target as HTMLInputElement).value)" @change="commit()" />
        </div>
        <div class="prop-row">
          <label>線</label>
          <input type="color" :value="obj.stroke" @input="update('stroke', ($event.target as HTMLInputElement).value)" @change="commit()" />
        </div>
        <div class="prop-row">
          <label>線幅</label>
          <input type="number" min="0" :value="obj.strokeWidth" @change="commitUpdate('strokeWidth', +($event.target as HTMLInputElement).value)" />
        </div>
        <template v-if="obj.type === 'rect'">
          <div class="prop-row">
            <label>Rx</label>
            <input type="number" min="0" :value="obj.rx" @change="commitUpdate('rx', +($event.target as HTMLInputElement).value)" />
          </div>
        </template>
      </template>

      <template v-if="obj.type === 'text'">
        <div class="section-title">テキスト</div>
        <div class="prop-row">
          <label>内容</label>
          <input type="text" :value="obj.text" @change="commitUpdate('text', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="prop-row">
          <label>サイズ</label>
          <input type="number" min="4" :value="obj.fontSize" @change="commitUpdate('fontSize', +($event.target as HTMLInputElement).value)" />
        </div>
        <div class="prop-row">
          <label>色</label>
          <input type="color" :value="obj.fill" @input="update('fill', ($event.target as HTMLInputElement).value)" @change="commit()" />
        </div>
      </template>

      <!-- SVG Filter -->
      <div class="section-title">フィルタ</div>
      <div class="prop-row">
        <label>エフェクト</label>
        <select :value="obj.filterId ?? ''" @change="commitUpdate('filterId', ($event.target as HTMLSelectElement).value || null)">
          <option value="">なし</option>
          <option v-for="f in filterDefs" :key="f.id" :value="f.id">{{ f.name }}</option>
        </select>
      </div>

      <!-- Delete -->
      <div class="section-actions">
        <button class="delete-btn" @click="onDelete">削除</button>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.props-panel {
  padding: 6px;
  font-size: 11px;
  color: var(--text-primary);
  height: 100%;
  overflow-y: auto;
}

.no-selection {
  padding: 12px 6px;
  color: var(--text-secondary);
  text-align: center;

  .hint {
    margin-top: 4px;
    font-size: 10px;
  }
}

.section-title {
  font-weight: bold;
  font-size: 10px;
  text-transform: uppercase;
  color: var(--accent);
  padding: 6px 0 2px 0;
  border-bottom: 1px solid var(--win-border-dark);
  margin-bottom: 4px;
  letter-spacing: 0.5px;
}

.prop-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 3px;

  label {
    width: 44px;
    font-size: 10px;
    color: var(--text-secondary);
    text-align: right;
    flex-shrink: 0;
  }

  .value-text {
    color: var(--text-primary);
    text-transform: capitalize;
  }

  input[type='number'],
  input[type='text'] {
    flex: 1;
    height: 16px;
    padding: 0 3px;
    background: var(--panel-inset-bg);
    color: var(--text-primary);
    border: 1px solid var(--win-border-dark);
    font-size: 11px;
  }

  input[type='color'] {
    width: 32px;
    height: 18px;
    padding: 0;
    border: 1px solid var(--win-border-dark);
    cursor: pointer;
  }

  input[type='range'] {
    flex: 1;
    height: 14px;
    accent-color: var(--accent);
  }

  select {
    flex: 1;
    height: 18px;
    font-size: 10px;
    padding: 0 2px;
    border: 1px solid var(--win-border-dark);
    background: var(--panel-inset-bg);
    color: var(--text-primary);
  }
}

.section-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

.delete-btn {
  padding: 2px 10px;
  font-size: 11px;
  cursor: pointer;
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
