<script setup lang="ts">
  import { CanvasData } from '../stores/canvas';

  defineProps<{
    canvasData: CanvasData;
  }>();
</script>

<template>
  <div
    class="canvas"
    :style="{
      width: `${canvasData.width}px`,
      height: `${canvasData.height}px`,
      background: canvasData.background
    }"
  ></div>
</template>

<style lang="scss" scoped>
  .canvas {
    box-shadow: var(--elevation-shadow-card-rest);
    margin: 32px auto;
  }
</style>
