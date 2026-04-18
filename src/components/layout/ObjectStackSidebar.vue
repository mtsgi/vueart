<script setup lang="ts">
/**
 * ObjectStackSidebar — オブジェクトスタック（右サイドバー）
 * アクティブキャンバス上の要素一覧と選択オブジェクトのプロパティを表示する。
 * レイヤーリストと各種プロパティは ObjectLayerList / PropertiesWindow と共通実装。
 */
import { computed, ref } from 'vue'
import { useDocumentStore } from '@/stores/useDocumentStore'
import ObjectLayerList from '@/components/ObjectLayerList.vue'
import PropertiesWindow from '@/components/windows/PropertiesWindow.vue'

const docStore = useDocumentStore()

// プロパティパネルの開閉状態
const propPanelOpen = ref(true)

const typeLabels: Record<string, string> = {
  rect: '矩形', ellipse: '楕円', text: 'テキスト', image: '画像', group: 'グループ',
}
const selectedTypeLabel = computed(() => {
  const obj = docStore.selectedObject
  return obj ? (typeLabels[obj.type] ?? obj.type) : null
})
</script>

<template>
  <div class="object-stack">
    <!-- ヘッダー -->
    <div class="object-stack__header">
      <span class="panel-title">オブジェクトスタック</span>
    </div>

    <!-- レイヤーリスト（共通コンポーネント） -->
    <div class="object-stack__list">
      <ObjectLayerList />
    </div>

    <!-- プロパティパネル（折りたたみ） -->
    <div class="prop-panel">
      <button class="prop-panel__toggle" @click="propPanelOpen = !propPanelOpen">
        <font-awesome-icon :icon="propPanelOpen ? 'chevron-down' : 'chevron-right'" />
        プロパティ
        <span v-if="selectedTypeLabel" class="prop-panel__type">（{{ selectedTypeLabel }}）</span>
      </button>

      <div v-if="propPanelOpen" class="prop-panel__body">
        <PropertiesWindow />
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
    padding: 4px 8px;
    background: var(--win-bg);
    border-bottom: 1px solid var(--win-border-dark);
    flex-shrink: 0;

    .panel-title {
      font-size: 11px;
      font-weight: bold;
      color: var(--text-primary);
    }
  }

  &__list {
    flex: 1;
    overflow-y: auto;
    min-height: 80px;
    max-height: 40%;
  }
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

  &__body {
    padding: 0;
  }
}
</style>
