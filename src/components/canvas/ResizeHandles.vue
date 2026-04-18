<script setup lang="ts">
/**
 * ResizeHandles — 選択オブジェクトのリサイズハンドルオーバーレイ
 * バウンディングボックスの破線アウトラインと8方向ハンドル（コーナー4 + エッジ4）を
 * SVG要素として描画する。
 * ハンドル mousedown 時に resize-start イベントを emit し、
 * SvgCanvas 側でリサイズ処理を行う。
 */
import { computed } from 'vue'
import type { ResizeHandle } from '@/types/ui'

const props = defineProps<{
  x: number
  y: number
  width: number
  height: number
}>()

const emit = defineEmits<{
  resizeStart: [handle: ResizeHandle, e: MouseEvent]
}>()

// ハンドル正方形の一辺（px）
const HS = 6

// 8方向ハンドルの位置とカーソル定義（リアクティブに計算）
const handles = computed<{ id: ResizeHandle; hx: number; hy: number; cursor: string }[]>(() => [
  { id: 'nw', hx: props.x,                    hy: props.y,                     cursor: 'nw-resize' },
  { id: 'n',  hx: props.x + props.width / 2,  hy: props.y,                     cursor: 'n-resize'  },
  { id: 'ne', hx: props.x + props.width,       hy: props.y,                     cursor: 'ne-resize' },
  { id: 'e',  hx: props.x + props.width,       hy: props.y + props.height / 2, cursor: 'e-resize'  },
  { id: 'se', hx: props.x + props.width,       hy: props.y + props.height,     cursor: 'se-resize' },
  { id: 's',  hx: props.x + props.width / 2,  hy: props.y + props.height,     cursor: 's-resize'  },
  { id: 'sw', hx: props.x,                     hy: props.y + props.height,     cursor: 'sw-resize' },
  { id: 'w',  hx: props.x,                     hy: props.y + props.height / 2, cursor: 'w-resize'  },
])
</script>

<template>
  <g class="resize-handles">
    <!-- 選択バウンディングボックス（破線アウトライン） -->
    <rect
      :x="x - 1"
      :y="y - 1"
      :width="width + 2"
      :height="height + 2"
      fill="none"
      stroke="#4a9eff"
      stroke-width="1"
      stroke-dasharray="4 2"
      pointer-events="none"
    />

    <!-- 8方向リサイズハンドル -->
    <rect
      v-for="h in handles"
      :key="h.id"
      :x="h.hx - HS / 2"
      :y="h.hy - HS / 2"
      :width="HS"
      :height="HS"
      fill="white"
      stroke="#4a9eff"
      stroke-width="1"
      :style="{ cursor: h.cursor }"
      @mousedown.stop="emit('resizeStart', h.id, $event)"
    />
  </g>
</template>
