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
</template>
