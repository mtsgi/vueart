<script setup lang="ts">
import type { TextObject } from '@/types/objects'

const props = defineProps<{ obj: TextObject; selected: boolean }>()
const emit = defineEmits<{ select: [id: string, e: MouseEvent] }>()

function filterAttr(id: string | null) {
  return id ? `url(#${id})` : undefined
}
</script>

<template>
  <text
    :x="obj.x"
    :y="obj.y + obj.fontSize"
    :font-size="obj.fontSize"
    :font-family="obj.fontFamily"
    :font-weight="obj.fontWeight"
    :fill="obj.fill"
    :text-anchor="obj.textAnchor"
    :opacity="obj.opacity"
    :transform="`rotate(${obj.rotation}, ${obj.x + obj.width / 2}, ${obj.y + obj.height / 2})`"
    :filter="filterAttr(obj.filterId)"
    dominant-baseline="auto"
    style="cursor: move"
    @mousedown.stop="emit('select', obj.id, $event)"
  >{{ obj.text }}</text>
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
  />
</template>
