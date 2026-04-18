<script setup lang="ts">
/**
 * ShapeRenderer — オブジェクトタイプに応じた各shapeコンポーネントへのディスパッチ
 * shape コンポーネントの select イベント（mousedown由来）を
 * objectMousedown(id, e) としてまとめて上位に伝える。
 */
import type { CanvasObject } from '@/types/objects'
import RectShape from './shapes/RectShape.vue'
import EllipseShape from './shapes/EllipseShape.vue'
import TextShape from './shapes/TextShape.vue'
import ImageShape from './shapes/ImageShape.vue'

defineProps<{ obj: CanvasObject; selected: boolean }>()
const emit = defineEmits<{
  // id: 対象オブジェクトID、e: 元の MouseEvent（shiftKey等を使用）
  objectMousedown: [id: string, e: MouseEvent]
}>()

function onSelect(id: string, e: MouseEvent) {
  emit('objectMousedown', id, e)
}
</script>

<template>
  <RectShape
    v-if="obj.type === 'rect'"
    :obj="obj"
    :selected="selected"
    @select="onSelect"
  />
  <EllipseShape
    v-else-if="obj.type === 'ellipse'"
    :obj="obj"
    :selected="selected"
    @select="onSelect"
  />
  <TextShape
    v-else-if="obj.type === 'text'"
    :obj="obj"
    :selected="selected"
    @select="onSelect"
  />
  <ImageShape
    v-else-if="obj.type === 'image'"
    :obj="obj"
    :selected="selected"
    @select="onSelect"
  />
</template>

