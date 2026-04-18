<script setup lang="ts">
/**
 * AboutDialog — 「Vue Art Designer について」ダイアログ
 * モーダルオーバーレイとして表示する。
 */
defineEmits<{ close: [] }>()
</script>

<template>
  <!-- オーバーレイ背景 -->
  <div class="about-overlay" @click.self="$emit('close')">
    <div class="about-dialog" role="dialog" aria-modal="true" aria-label="Vue Art Designer について">

      <!-- タイトルバー -->
      <div class="about-dialog__titlebar">
        <span class="about-dialog__title">Vue Art Designer について</span>
        <button class="about-dialog__close" @click="$emit('close')" title="閉じる">✕</button>
      </div>

      <!-- コンテンツ -->
      <div class="about-dialog__body">
        <!-- ロゴエリア -->
        <div class="about-dialog__logo-area">
          <div class="about-dialog__logo-text">
            <div class="about-dialog__app-name">Vue Art Designer</div>
            <div class="about-dialog__version">バージョン 0.1.0</div>
          </div>
        </div>

        <!-- 説明文 -->
        <div class="about-dialog__desc">
          <p>
            懐かしい画像編集ソフトの<br>
            UIと操作感をリスペクトしたWebベースの<br>
            SVGベクター画像エディタです。
          </p>
        </div>

        <!-- 技術情報 -->
        <table class="about-dialog__info">
          <tr>
            <th>フレームワーク</th>
            <td>Vue 3 + TypeScript</td>
          </tr>
          <tr>
            <th>状態管理</th>
            <td>Pinia</td>
          </tr>
          <tr>
            <th>ビルドツール</th>
            <td>Vite</td>
          </tr>
        </table>

        <!-- フッター -->
        <div class="about-dialog__footer">
          <a
            href="https://github.com/mtsgi/vueart"
            target="_blank"
            rel="noopener noreferrer"
            class="about-dialog__link"
          >GitHub リポジトリ</a>
        </div>
      </div>

      <!-- ボタン -->
      <div class="about-dialog__buttons">
        <button class="about-dialog__btn" @click="$emit('close')">OK</button>
      </div>

    </div>
  </div>
</template>

<style lang="scss" scoped>
.about-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
}

.about-dialog {
  width: 340px;
  background: var(--win-bg);
  border-top: 2px solid var(--win-border-light);
  border-left: 2px solid var(--win-border-light);
  border-right: 2px solid var(--win-border-dark);
  border-bottom: 2px solid var(--win-border-dark);
  display: flex;
  flex-direction: column;

  &__titlebar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 20px;
    padding: 0 4px 0 6px;
    background: var(--win-titlebar-active);
    flex-shrink: 0;
  }

  &__title {
    font-size: 11px;
    font-weight: bold;
    color: #fff;
  }

  &__close {
    width: 16px;
    height: 14px;
    font-size: 9px;
    line-height: 1;
    background: var(--win-bg);
    color: var(--text-primary);
    border-top: 2px solid var(--win-border-light);
    border-left: 2px solid var(--win-border-light);
    border-right: 2px solid var(--win-border-dark);
    border-bottom: 2px solid var(--win-border-dark);
    cursor: default;

    &:active {
      border-color: var(--win-border-dark);
      border-right-color: var(--win-border-light);
      border-bottom-color: var(--win-border-light);
    }
  }

  &__body {
    padding: 20px 20px 12px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__logo-area {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  &__logo-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__app-name {
    font-size: 16px;
    font-weight: bold;
    color: var(--accent);
  }

  &__version {
    font-size: 11px;
    color: var(--text-secondary);
  }

  &__desc {
    font-size: 11px;
    color: var(--text-primary);
    line-height: 1.7;
    border-top: 1px solid var(--win-border-dark);
    border-bottom: 1px solid var(--win-border-dark);
    padding: 10px 0;

    p { margin: 0; }
  }

  &__info {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;

    tr + tr td,
    tr + tr th {
      padding-top: 4px;
    }

    th {
      width: 100px;
      text-align: left;
      color: var(--text-secondary);
      font-weight: normal;
      padding-right: 8px;
    }

    td {
      color: var(--text-primary);
    }
  }

  &__footer {
    text-align: center;
  }

  &__link {
    font-size: 11px;
    color: var(--accent);
    text-decoration: underline;
    cursor: pointer;
  }

  &__buttons {
    padding: 8px 12px;
    display: flex;
    justify-content: center;
    border-top: 1px solid var(--win-border-dark);
    background: var(--panel-bg);
  }

  &__btn {
    width: 80px;
    height: 22px;
    font-size: 11px;
    background: var(--win-bg);
    color: var(--text-primary);
    border-top: 2px solid var(--win-border-light);
    border-left: 2px solid var(--win-border-light);
    border-right: 2px solid var(--win-border-dark);
    border-bottom: 2px solid var(--win-border-dark);
    cursor: default;

    &:active {
      border-color: var(--win-border-dark);
      border-right-color: var(--win-border-light);
      border-bottom-color: var(--win-border-light);
    }
  }
}
</style>
