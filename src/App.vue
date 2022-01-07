<script setup lang="ts">
  import { reactive } from 'vue';
  import TheHeader from './components/TheHeader.vue';
  import TheCanvas from './components/TheCanvas.vue';

  export interface CanvasData {
    width: number;
    height: number;
    background: string;
    objects: CanvasObject[];
  }

  export interface CanvasObject {
    type: "text" | "box" | "image"
  }

  const canvasData = reactive<CanvasData>({
    width: 720,
    height: 480,
    background: '#ffffff',
    objects: []
  });
</script>

<template>
  <TheHeader />
  <TheCanvas :canvasData="canvasData" />
</template>

<style lang="scss">
  body {
    margin: 0;
    background: var(--neutral-fill-secondary-rest);
  }
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #303030;
  }
</style>
