<script setup lang="ts">
/**
 * App.vue — アプリケーションルートレイアウト
 *
 * ペイン構成:
 *   ┌────────────────────────────────────────┐
 *   │ AppMenuBar（メニューバー）              │
 *   ├────────────────────────────────────────┤
 *   │ StandardToolbar（[標準]ツールバー）     │
 *   ├────────────────────────────────────────┤
 *   │ ImageToolbar（[イメージ]ツールバー）    │
 *   ├──────────┬──────────────────┬──────────┤
 *   │ Assets   │ MdiDesktop       │ Object   │
 *   │ Sidebar  │（MDI ワークスペー│ Stack    │
 *   │（素材）   │  ス + フローティ │ Sidebar  │
 *   │          │  ングウィンドウ） │（スタック）│
 *   └──────────┴──────────────────┴──────────┘
 */
import AppMenuBar from '@/components/layout/AppMenuBar.vue'
import StandardToolbar from '@/components/layout/StandardToolbar.vue'
import ImageToolbar from '@/components/layout/ImageToolbar.vue'
import AssetsSidebar from '@/components/layout/AssetsSidebar.vue'
import ObjectStackSidebar from '@/components/layout/ObjectStackSidebar.vue'
import MdiDesktop from '@/components/desktop/MdiDesktop.vue'
</script>

<template>
  <div class="app-shell">
    <!-- トップ領域: メニューバー + ツールバー群 -->
    <div class="app-shell__top">
      <AppMenuBar />
      <StandardToolbar />
      <ImageToolbar />
    </div>

    <!-- メイン領域: 左サイドバー + MDIワークスペース + 右サイドバー -->
    <div class="app-shell__main">
      <AssetsSidebar />
      <MdiDesktop />
      <ObjectStackSidebar />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-shell {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--desktop-bg);

  &__top {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
  }

  &__main {
    flex: 1;
    display: flex;
    overflow: hidden;
  }
}
</style>

