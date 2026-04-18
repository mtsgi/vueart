<script setup lang="ts">
import { computed } from 'vue'
import type { TextObject } from '@/types/objects'

const props = defineProps<{ obj: TextObject; selected: boolean }>()
const emit = defineEmits<{
  select: [id: string, e: MouseEvent]
  dblclick: [id: string, e: MouseEvent]
}>()

function filterAttr(id: string | null) {
  return id ? `url(#${id})` : undefined
}

/** textAnchor に応じた SVG x 座標（横揃え基準点） */
const textX = computed(() => {
  switch (props.obj.textAnchor) {
    case 'middle': return props.obj.x + props.obj.width / 2
    case 'end':    return props.obj.x + props.obj.width
    default:       return props.obj.x
  }
})

/** verticalAlign に応じた SVG y 座標 */
const textY = computed(() => {
  switch (props.obj.verticalAlign) {
    case 'middle': return props.obj.y + props.obj.height / 2
    case 'bottom': return props.obj.y + props.obj.height
    default:       return props.obj.y + props.obj.fontSize  // 'top' または未設定
  }
})

/** SVG dominant-baseline 属性値 */
const dominantBaseline = computed(() => {
  if (props.obj.verticalAlign === 'middle') return 'central'
  return 'auto'
})
</script>

<template>
  <text
    :x="textX"
    :y="textY"
    :font-size="obj.fontSize"
    :font-family="obj.fontFamily"
    :font-weight="obj.fontWeight"
    :fill="obj.fill"
    :text-anchor="obj.textAnchor"
    :opacity="obj.opacity"
    :transform="`rotate(${obj.rotation}, ${obj.x + obj.width / 2}, ${obj.y + obj.height / 2})`"
    :filter="filterAttr(obj.filterId)"
    :dominant-baseline="dominantBaseline"
    style="cursor: move"
    @mousedown.stop="emit('select', obj.id, $event)"
    @dblclick.stop="emit('dblclick', obj.id, $event)"
  >{{ obj.text }}</text>
</template>
