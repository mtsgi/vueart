<script setup lang="ts">
import type { EllipseObject } from '@/types/objects'

const props = defineProps<{ obj: EllipseObject; selected: boolean }>()
const emit = defineEmits<{ select: [id: string, e: MouseEvent] }>()

const cx = (obj: EllipseObject) => obj.x + obj.width / 2
const cy = (obj: EllipseObject) => obj.y + obj.height / 2

function filterAttr(id: string | null) {
  return id ? `url(#${id})` : undefined
}
</script>

<template>
  <ellipse
    :cx="cx(obj)"
    :cy="cy(obj)"
    :rx="obj.width / 2"
    :ry="obj.height / 2"
    :fill="obj.fill"
    :stroke="obj.stroke"
    :stroke-width="obj.strokeWidth"
    :opacity="obj.opacity"
    :transform="`rotate(${obj.rotation}, ${cx(obj)}, ${cy(obj)})`"
    :filter="filterAttr(obj.filterId)"
    style="cursor: move"
    @mousedown.stop="emit('select', obj.id, $event)"
  />
</template>
