<script setup lang="ts">
  import TheHeader from './components/TheHeader.vue';
  import TheCanvas from './components/TheCanvas.vue';
  import { useCanvasStore } from './stores/canvas';

  const canvasStore = useCanvasStore();
</script>

<template>
  <TheHeader />
  <TheCanvas :canvasData="canvasStore" />
</template>

<style lang="scss">
  body {
    margin: 0;
    background: var(--neutral-fill-secondary-rest);
    accent-color: rgb(136, 201, 84);
  }
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #303030;
  }
</style>
