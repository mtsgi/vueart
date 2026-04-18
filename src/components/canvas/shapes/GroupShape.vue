<script setup lang="ts">
/**
 * GroupShape — グループオブジェクト（GroupObject）の SVG 描画コンポーネント
 *
 * 循環参照回避のため ShapeRenderer を import せず、
 * 各 Shape コンポーネントを直接 import する。
 * 自分自身（ネストされたグループ）は defineAsyncComponent で遅延 import する。
 */
import { defineAsyncComponent, computed } from 'vue'
import type { GroupObject } from '@/types/objects'
import RectShape from './RectShape.vue'
import EllipseShape from './EllipseShape.vue'
import TextShape from './TextShape.vue'
import ImageShape from './ImageShape.vue'

// ネストされたグループの再帰レンダリング用（循環参照を遅延 import で解消）
const NestedGroupShape = defineAsyncComponent(() => import('./GroupShape.vue'))

const props = defineProps<{
  obj: GroupObject
  selected: boolean
  /** グループ編集モード中のグループID（このグループが editingGroupId と一致する場合は子を直接操作可能） */
  editingGroupId?: string | null
  isChild?: boolean
}>()
const emit = defineEmits<{
  /** グループ全体（または編集モード中の子）の mousedown */
  objectMousedown: [id: string, e: MouseEvent]
  /** テキストダブルクリック（上位へ中継） */
  objectDblclick: [id: string, e: MouseEvent]
}>()

/** このグループが現在グループ編集モードかどうか */
const isEditingThisGroup = computed(() => props.editingGroupId === props.obj.id)

function onChildSelect(id: string, e: MouseEvent) {
  if (isEditingThisGroup.value) {
    // 編集モード中: 子オブジェクトの ID をそのまま上位に伝達
    emit('objectMousedown', id, e)
  } else {
    // 通常: グループ全体の ID に置き換えて伝達
    emit('objectMousedown', props.obj.id, e)
  }
}

function onChildDblclick(id: string, e: MouseEvent) {
  if (isEditingThisGroup.value) {
    emit('objectDblclick', id, e)
  } else {
    // 編集モード外でのダブルクリック → グループ編集モード開始イベントとして伝達
    emit('objectDblclick', props.obj.id, e)
  }
}

function onNestedGroupMousedown(id: string, e: MouseEvent) {
  if (isEditingThisGroup.value) {
    emit('objectMousedown', id, e)
  } else {
    emit('objectMousedown', props.obj.id, e)
  }
}
</script>

<template>
  <!--
    グループ全体を <g> でラップし、origin を translate で移動させる。
    子オブジェクトの座標はグループ origin 相対で保持されているため、
    この transform だけで正しく描画される。
  -->
  <g
    :transform="`translate(${obj.x}, ${obj.y}) rotate(${obj.rotation}, ${obj.width / 2}, ${obj.height / 2})`"
    :opacity="obj.opacity"
  >
    <!--
      グループ全体の透明ヒット領域
      編集モード外のみ表示し、クリックをグループ全体として処理する。
      編集モード中は非表示にして子オブジェクトが直接クリックを受け取れるようにする。
    -->
    <rect
      v-if="!isEditingThisGroup"
      :x="0"
      :y="0"
      :width="obj.width"
      :height="obj.height"
      fill="transparent"
      stroke="none"
      pointer-events="fill"
      style="cursor: move"
      @mousedown.stop="emit('objectMousedown', obj.id, $event)"
    />

    <template v-for="child in obj.children" :key="child.id">
      <RectShape
        v-if="child.type === 'rect'"
        :obj="child"
        :selected="false"
        @select="onChildSelect"
      />
      <EllipseShape
        v-else-if="child.type === 'ellipse'"
        :obj="child"
        :selected="false"
        @select="onChildSelect"
      />
      <TextShape
        v-else-if="child.type === 'text'"
        :obj="child"
        :selected="false"
        @select="onChildSelect"
        @dblclick="onChildDblclick"
      />
      <ImageShape
        v-else-if="child.type === 'image'"
        :obj="child"
        :selected="false"
        @select="onChildSelect"
      />
      <!-- ネストされたグループ（再帰） -->
      <NestedGroupShape
        v-else-if="child.type === 'group'"
        :obj="(child as GroupObject)"
        :selected="false"
        :editing-group-id="editingGroupId"
        :is-child="true"
        @object-mousedown="onNestedGroupMousedown"
        @object-dblclick="onChildDblclick"
      />
    </template>
  </g>
</template>
