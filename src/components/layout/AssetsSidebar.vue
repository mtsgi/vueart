<script setup lang="ts">
/**
 * AssetsSidebar — [素材]タブ（左サイドバー）
 * アセットのフォルダツリーとサムネイル一覧を表示するパネル。
 * 将来的には外部画像ファイルの取り込みや組み込みシェイプライブラリを提供する拡張ポイント。
 */
import { ref } from 'vue'

// フォルダツリーの定義（将来的にはストアや外部ファイルから取得）
interface AssetFolder {
  label: string
  open: boolean
  children?: AssetFolder[]
  items?: AssetItem[]
}
interface AssetItem {
  label: string
  icon: string
  description: string
}

const folders = ref<AssetFolder[]>([
  {
    label: '基本図形',
    open: true,
    items: [
      { label: '矩形', icon: '▭', description: '矩形（角丸対応）' },
      { label: '楕円', icon: '○', description: '楕円・円' },
      { label: 'テキスト', icon: 'T', description: 'テキストオブジェクト' },
    ],
  },
  {
    label: 'SVGフィルタ素材',
    open: false,
    items: [
      { label: 'ベベル&エンボス', icon: '◈', description: '立体ボタン風効果' },
      { label: 'ドロップシャドウ', icon: '◻', description: '影効果' },
      { label: 'インナーグロウ', icon: '◉', description: '内側発光' },
      { label: 'エンボスボタン', icon: '◆', description: '凸型ボタン' },
    ],
  },
  {
    label: '画像',
    open: false,
    items: [
      { label: '画像を読み込む…', icon: '🖼', description: 'ローカルファイルから読み込み' },
    ],
  },
])

function toggleFolder(folder: AssetFolder) {
  folder.open = !folder.open
}
</script>

<template>
  <div class="assets-sidebar">
    <!-- タブヘッダー -->
    <div class="assets-sidebar__header">
      <span class="tab-label active">素材</span>
    </div>

    <!-- フォルダツリー -->
    <div class="assets-sidebar__tree">
      <div
        v-for="folder in folders"
        :key="folder.label"
        class="folder"
      >
        <!-- フォルダ行 -->
        <button class="folder__header" @click="toggleFolder(folder)">
          <span class="folder__arrow">{{ folder.open ? '▾' : '▸' }}</span>
          <span class="folder__label">{{ folder.label }}</span>
        </button>

        <!-- アイテム一覧（サムネイルグリッド） -->
        <div v-if="folder.open" class="folder__items">
          <button
            v-for="item in folder.items"
            :key="item.label"
            class="asset-item"
            :title="item.description"
          >
            <span class="asset-item__icon">{{ item.icon }}</span>
            <span class="asset-item__label">{{ item.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.assets-sidebar {
  width: 160px;
  min-width: 120px;
  max-width: 240px;
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
      border-right: 1px solid var(--win-border-dark);
      border-bottom: 2px solid transparent;

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
    padding: 2px 4px 4px 16px;
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

  &:hover {
    background: var(--panel-inset-bg);
    border-color: var(--win-border-dark);
  }

  &:active {
    background: var(--win-titlebar-active);
    color: white;
  }

  &__icon {
    font-size: 14px;
    width: 18px;
    text-align: center;
  }

  &__label {
    font-size: 11px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
