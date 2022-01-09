<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import TheAppSettings from './TheAppSettings.vue';
import TheCanvasSettings from './TheCanvasSettings.vue';

  interface HeaderMenu {
    label: string;
    items: HeaderMenuItem[];
  }

  interface HeaderMenuItem {
    label: string;
    onclick?: () => void;
  }

  const menus: HeaderMenu[] = [
    {
      label: '設定',
      items: [
        {
          label: 'キャンバスの設定',
          onclick: () => (modals.canvasSettings = true)
        },
        {
          label: 'アプリの設定',
          onclick: () => (modals.appSettings = true)
        }
      ]
    },
    {
      label: '追加',
      items: [
        { label: 'TextObject' },
        { label: 'BoxObject' },
        { label: 'ImageObject' }
      ]
    }
  ];

  // 選択メニューのindex
  const menuIndex = ref<number | null>(null);

  // MenuItem選択時のイベント
  const onItem = (item: HeaderMenuItem) => {
    if (item.onclick) {
      item.onclick.apply(this);
    }
    menuIndex.value = null;
  };

  // モーダル表示状態管理
  const modals = reactive({
    appSettings: false,
    canvasSettings: false
  });
</script>

<template>
  <header>
    <strong>Vueart</strong>

    <a
      v-for="(menu, i) in menus"
      appearance="stealth"
      @mouseleave="menuIndex = null"
    >
      <span @click="menuIndex = i">
        {{ menu.label }}
      </span>

      <fluent-menu v-show="menuIndex === i">
        <fluent-menu-item v-for="item in menu.items" @click="onItem(item)">
          {{ item.label }}
        </fluent-menu-item>
      </fluent-menu>
    </a>
  </header>

  <TheAppSettings
    v-show="modals.appSettings"
    @close="modals.appSettings = false"
  />

  <TheCanvasSettings
    v-show="modals.canvasSettings"
    @close="modals.canvasSettings = false"
  />
</template>

<style lang="scss" scoped>
  header {
    display: flex;
    align-items: center;
    background: var(--neutral-fill-secondary-rest);
    box-shadow: var(--elevation-shadow-card-rest);

    > strong {
      font-size: 24px;
      margin: 0 8px;
    }

    > a {
      cursor: pointer;
      display: grid;
      &:hover {
        background: var(--neutral-fill-stealth-rest);
      }

      > span {
        padding: 8px;
      }
    }

    fluent-menu {
      position: fixed;
      margin-top: 36px;
      z-index: 1;
    }
  }
</style>
