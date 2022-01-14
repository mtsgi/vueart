<script lang="ts" setup>
  import DraggableItem from './DraggableItem.vue';
  import { useCanvasStore } from '../stores/canvas';
  import { storeToRefs } from 'pinia';

  const store = useCanvasStore();
  const { width, height, background } = storeToRefs(store);

  defineEmits<{
    (e: 'close'): void;
  }>();

  // const onInput = (e: InputEvent): void => {
  //   const target = e.target as NumberField;
  //   console.log(target);
  //   return;
  // }
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

      <div class="form">
        <label>width</label>
        <input type="number" v-model="width" />
      </div>

      <div class="form">
        <label>height</label>
        <input type="number" v-model="height" />
      </div>

      <div class="form">
        <label>background</label>
        <input type="text" v-model="background" />
      </div>
    </fluent-card>
  </DraggableItem>
</template>

<style lang="scss" scoped>
  fluent-card {
    width: 320px;
    height: auto;
    padding: 8px;
    box-shadow: var(--elevation-shadow-tooltip);

    h3 {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 0 0 8px 0;
      cursor: grab;
    }

    .form {
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      > label {
        width: 120px;
      }
      > input {
        flex-grow: 1;
        padding: 4px;
      }
    }
  }
</style>
