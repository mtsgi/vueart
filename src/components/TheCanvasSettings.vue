<script lang="ts" setup>
  import DraggableItem from './DraggableItem.vue';

  defineEmits<{
    (e: 'close'): void;
  }>();
</script>

<template>
  <DraggableItem :left="10" :top="72">
    <fluent-card>
      <h3 class="handle">
        キャンバスの設定
        <fluent-button appearance="stealth" @click="$emit('close')">
          ×
        </fluent-button>
      </h3>
      設定内容
    </fluent-card>
  </DraggableItem>
</template>

<style lang="scss" scoped>
  fluent-card {
    width: 320px;
    height: auto;
    padding: 8px;

    h3 {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 0 0 8px 0;
      cursor: grab;
    }
  }
</style>
