<script setup lang="ts">
import type { RectObject } from '@/types/objects'

const props = defineProps<{ obj: RectObject; selected: boolean }>()
const emit = defineEmits<{ select: [id: string, e: MouseEvent] }>()

function filterAttr(id: string | null) {
  return id ? `url(#${id})` : undefined
}
</script>

<template>
  <rect
    :x="obj.x"
    :y="obj.y"
    :width="obj.width"
    :height="obj.height"
    :rx="obj.rx"
    :ry="obj.ry"
    :fill="obj.fill"
    :stroke="obj.stroke"
    :stroke-width="obj.strokeWidth"
    :opacity="obj.opacity"
    :transform="`rotate(${obj.rotation}, ${obj.x + obj.width / 2}, ${obj.y + obj.height / 2})`"
    :filter="filterAttr(obj.filterId)"
    :class="{ selected }"
    style="cursor: move"
    @mousedown.stop="emit('select', obj.id, $event)"
  />
  <!-- Selection handles -->
  <rect
    v-if="selected"
    :x="obj.x - 1"
    :y="obj.y - 1"
    :width="obj.width + 2"
    :height="obj.height + 2"
    fill="none"
    stroke="#4a9eff"
    stroke-width="1"
    stroke-dasharray="4 2"
    pointer-events="none"
    :transform="`rotate(${obj.rotation}, ${obj.x + obj.width / 2}, ${obj.y + obj.height / 2})`"
  />
</template>
