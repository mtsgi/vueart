<script lang="ts" setup>
  import { reactive, ref } from 'vue';

  const props = defineProps<{
    left?: number;
    top?: number;
  }>();

  const isDragging = ref(false);
  const dragElement = ref<HTMLDivElement | null>(null);

  // ドラッグ座標
  const pos = reactive({
    sx: 0, // sx, sy: ドラッグ開始座標
    sy: 0,
    dx: 0, // dx, dy: ドラッグ座標
    dy: 0,
    cx: 0, // cx, cy: 座標の移動差分
    cy: 0,
    x: props.left || 0, // x, y,: 要素の座標
    y: props.top || 0
  });

  const onMouseDown = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains('handle')) {
      pos.sx = event.clientX;
      pos.sy = event.clientY;
      pos.dx = event.clientX;
      pos.dy = event.clientY;
      isDragging.value = true;
    }
  };

  const onMouseMove = (event: MouseEvent) => {
    if (isDragging.value) {
      pos.cx = pos.dx - event.clientX;
      pos.cy = pos.dy - event.clientY;
      pos.dx = event.clientX;
      pos.dy = event.clientY;
      const isEnough =
        Math.abs(pos.sx - pos.dx) > 10 || Math.abs(pos.sy - pos.dy) > 10;
      if (dragElement.value && isEnough) {
        pos.x = dragElement.value.offsetLeft - pos.cx;
        pos.y = dragElement.value.offsetTop - pos.cy;
      }
    }
  };

  const onMouseUp = (event: MouseEvent) => {
    isDragging.value = false;
  };
</script>

<template>
  <div
    class="draggable"
    ref="dragElement"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    :style="{
      left: `${pos.x}px`,
      top: `${pos.y}px`
    }"
  >
    <slot></slot>
    <div v-show="isDragging" class="screen"></div>
  </div>
</template>

<style lang="scss" scoped>
  .draggable {
    position: absolute;
    user-select: none;
  }

  .screen {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100%;
    background: transparent;
    z-index: 0;
    cursor: grabbing;
  }
</style>
