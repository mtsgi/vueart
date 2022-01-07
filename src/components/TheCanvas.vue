<script setup lang="ts">
  import { CanvasData } from '../App.vue';

  defineProps<{
    canvasData: CanvasData;
  }>();
</script>

<template>
  <div class="canvas" :style="{
    width: `${canvasData.width}px`,
    height: `${canvasData.height}px`,
    background: canvasData.background
  }">
    Width: <input type="number" v-model="canvasData.width" />
    <br />
    Height: <input type="number" v-model="canvasData.height" />
    <br />
    Bg: <input type="text" v-model="canvasData.background" />
  </div>
</template>

<style lang="scss" scoped>
  .canvas {
    box-shadow: var(--elevation-shadow-card-rest);
    margin: 32px auto;
  }
</style>
