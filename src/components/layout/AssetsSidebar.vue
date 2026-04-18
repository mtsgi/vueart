<script setup lang="ts">
/**
 * AssetsSidebar — [素材]タブ（左サイドバー）
 * useAssetsStore からフォルダ/アイテムを取得して表示する。
 * ドラッグ&ドロップ + クリックでキャンバスへの追加をサポートする。
 */
import { ref } from 'vue'
import { useAssetsStore } from '@/stores/useAssetsStore'
import { useDocumentStore } from '@/stores/useDocumentStore'
import { builtinFilters } from '@/utils/svgFilters'
import type { AssetDefinition } from '@/stores/useAssetsStore'

const assetsStore = useAssetsStore()
const docStore = useDocumentStore()

// 「素材」/ 「マイ素材」の2タブ
type TabId = 'builtin' | 'custom'
const activeTab = ref<TabId>('builtin')

// ドラッグ中アセットID（ハイライト用）
const draggingId = ref<string | null>(null)

/** フィルタIDからマークアップを取得（SVG プレビュー用） */
const filterMarkupMap = new Map(builtinFilters().map(f => [f.id, f.markup]))
function getFilterMarkup(filterId: string): string {
  return filterMarkupMap.get(filterId) ?? ''
}

/** アイテムをクリック → キャンバスへ追加 */
async function onItemClick(asset: AssetDefinition) {
  await assetsStore.addAssetToCanvas(asset.id, docStore)
}

/** ドラッグ開始: dataTransfer にアセットIDをセット */
function onDragStart(asset: AssetDefinition, e: DragEvent) {
  draggingId.value = asset.id
  e.dataTransfer?.setData('application/vueart-asset', asset.id)
}

function onDragEnd() {
  draggingId.value = null
}

/** 選択中オブジェクトをカスタム素材として保存 */
function saveSelectedAsCustom() {
  const sel = docStore.selectedObject
  if (!sel) return
  assetsStore.addCustomAsset({
    id: `custom-${Date.now()}`,
    label: sel.label || sel.type,
    description: `保存した素材（${sel.type}）`,
    icon: 'bookmark',
    type: sel.type === 'image' ? 'image' : 'shape',
    objectTemplate: { ...sel },
  })
}
</script>

<template>
  <div class="assets-sidebar">
    <!-- タブヘッダー -->
    <div class="assets-sidebar__header">
      <button
        class="tab-label"
        :class="{ active: activeTab === 'builtin' }"
        @click="activeTab = 'builtin'"
      >素材</button>
      <button
        class="tab-label"
        :class="{ active: activeTab === 'custom' }"
        @click="activeTab = 'custom'"
      >マイ素材</button>
    </div>

    <!-- 「素材」タブ -->
    <div v-if="activeTab === 'builtin'" class="assets-sidebar__tree">
      <div
        v-for="folder in assetsStore.builtinFolders"
        :key="folder.id"
        class="folder"
      >
        <!-- フォルダ行 -->
        <button class="folder__header" @click="assetsStore.toggleBuiltinFolder(folder.id)">
          <span class="folder__arrow">
            <font-awesome-icon :icon="folder.open ? 'chevron-down' : 'chevron-right'" />
          </span>
          <span class="folder__label">{{ folder.label }}</span>
        </button>

        <!-- アイテム一覧 -->
        <div v-if="folder.open" class="folder__items">
          <button
            v-for="item in folder.items"
            :key="item.id"
            class="asset-item"
            :class="{ dragging: draggingId === item.id }"
            :title="item.description"
            :draggable="item.type !== 'image'"
            @click="onItemClick(item)"
            @dragstart="onDragStart(item, $event)"
            @dragend="onDragEnd"
          >
            <span class="asset-item__icon">
              <font-awesome-icon :icon="item.icon" />
            </span>
            <span class="asset-item__label">{{ item.label }}</span>
            <!-- フィルタアイテムのミニプレビュー -->
            <span v-if="item.type === 'filter'" class="filter-preview">
              <svg width="18" height="14" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter :id="`prev-${item.id}`" x="-20%" y="-20%" width="140%" height="140%">
                    <!-- eslint-disable-next-line vue/no-v-html -->
                    <g v-html="item.filterId ? getFilterMarkup(item.filterId) : ''" />
                  </filter>
                </defs>
                <rect
                  x="2" y="2" width="14" height="10" rx="2"
                  fill="#4a9eff"
                  :filter="`url(#prev-${item.id})`"
                />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- 「マイ素材」タブ -->
    <div v-else class="assets-sidebar__tree">
      <!-- 選択中オブジェクトを保存ボタン -->
      <div class="custom-actions">
        <button
          class="save-btn"
          :disabled="!docStore.selectedObject"
          :title="docStore.selectedObject ? '選択中のオブジェクトをマイ素材として保存' : 'オブジェクトを選択してください'"
          @click="saveSelectedAsCustom"
        >
          <font-awesome-icon icon="plus" /> 選択中を保存
        </button>
      </div>

      <div v-if="assetsStore.customAssets.length === 0" class="empty-hint">
        保存済みの素材がありません。<br>
        オブジェクトを選択して「選択中を保存」で追加できます。
      </div>

      <div v-else class="folder__items">
        <div
          v-for="asset in assetsStore.customAssets"
          :key="asset.id"
          class="asset-item asset-item--custom"
        >
          <button
            class="asset-item__main"
            :title="asset.description"
            :draggable="true"
            @click="onItemClick(asset)"
            @dragstart="onDragStart(asset, $event)"
            @dragend="onDragEnd"
          >
            <span class="asset-item__icon">
              <font-awesome-icon :icon="asset.icon" />
            </span>
            <span class="asset-item__label">{{ asset.label }}</span>
          </button>
          <button
            class="delete-btn"
            title="削除"
            @click="assetsStore.removeCustomAsset(asset.id)"
          >
            <font-awesome-icon icon="xmark" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.assets-sidebar {
  width: 180px;
  min-width: 140px;
  max-width: 260px;
  height: 100%;
  background: var(--panel-bg);
  border-right: 2px solid var(--win-border-dark);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;

  &__header {
    display: flex;
    background: var(--win-bg);
    border-bottom: 1px solid var(--win-border-dark);
    flex-shrink: 0;

    .tab-label {
      padding: 3px 12px;
      font-size: 11px;
      font-weight: bold;
      color: var(--text-secondary);
      cursor: default;
      border: none;
      border-right: 1px solid var(--win-border-dark);
      border-bottom: 2px solid transparent;
      background: transparent;

      &.active {
        color: var(--text-primary);
        background: var(--panel-bg);
        border-bottom-color: var(--panel-bg);
      }
    }
  }

  &__tree {
    flex: 1;
    overflow-y: auto;
    padding: 4px 0;
  }
}

.folder {
  &__header {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 3px 6px;
    font-size: 11px;
    color: var(--text-primary);
    background: transparent;
    border: none;
    cursor: default;
    text-align: left;
    gap: 4px;

    &:hover {
      background: var(--win-bg);
    }
  }

  &__arrow {
    font-size: 9px;
    color: var(--text-secondary);
    width: 10px;
  }

  &__label {
    font-weight: bold;
    font-size: 11px;
  }

  &__items {
    padding: 2px 4px 4px 12px;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
}

.asset-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 6px;
  font-size: 11px;
  color: var(--text-primary);
  background: transparent;
  border: 1px solid transparent;
  cursor: default;
  text-align: left;
  width: 100%;

  &:hover, &.dragging {
    background: var(--panel-inset-bg);
    border-color: var(--win-border-dark);
  }

  &:active {
    background: var(--win-titlebar-active);
    color: white;
  }

  &--custom {
    padding: 0;
    gap: 0;

    .asset-item__main {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;
      padding: 2px 6px;
      font-size: 11px;
      color: var(--text-primary);
      background: transparent;
      border: none;
      cursor: default;
      text-align: left;

      &:hover {
        background: var(--panel-inset-bg);
      }
    }
  }

  &__icon {
    font-size: 12px;
    width: 16px;
    text-align: center;
    flex-shrink: 0;
  }

  &__label {
    font-size: 11px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }
}

.filter-preview {
  margin-left: auto;
  flex-shrink: 0;
  opacity: 0.8;
}

.custom-actions {
  padding: 4px 6px;
  border-bottom: 1px solid var(--win-border-dark);
}

.save-btn {
  width: 100%;
  padding: 3px 6px;
  font-size: 10px;
  color: var(--text-primary);
  background: var(--win-bg);
  border: 1px solid var(--win-border-dark);
  cursor: default;
  text-align: center;
  gap: 4px;

  &:hover:not(:disabled) {
    background: var(--panel-inset-bg);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.delete-btn {
  padding: 2px 6px;
  font-size: 10px;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  cursor: default;
  flex-shrink: 0;

  &:hover {
    color: #ff4444;
  }
}

.empty-hint {
  padding: 12px 8px;
  font-size: 10px;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.6;
}
</style>
