<script setup lang="ts">
  import { ref } from 'vue';

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
      items: [{ label: 'キャンバスの設定' }, { label: 'アプリの設定' }]
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

  const menuIndex = ref<number | null>(null);
</script>

<template>
  <header>
    <a
      v-for="(menu, i) in menus"
      appearance="stealth"
      @mouseleave="menuIndex = null"
    >
      <span @click="menuIndex = i">
        {{ menu.label }}
      </span>

      <fluent-menu v-show="menuIndex === i">
        <fluent-menu-item v-for="item in menu.items" @click="item.onclick">
          {{ item.label }}
        </fluent-menu-item>
      </fluent-menu>
    </a>
  </header>
</template>

<style lang="scss" scoped>
  header {
    display: flex;
    background: var(--neutral-fill-secondary-rest);
    box-shadow: var(--elevation-shadow-card-rest);

    > a {
      cursor: pointer;
      display: grid;
      &:hover {
        background: var(--neutral-fill-secondary-hover);
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
