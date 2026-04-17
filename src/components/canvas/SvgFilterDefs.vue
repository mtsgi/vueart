<script setup lang="ts">
/**
 * SvgFilterDefs — SVGフィルタ定義（<defs>内）
 * キャンバスIDに対応するドキュメントのフィルタ定義を<filter>要素として展開する。
 */
import { computed } from 'vue'
import { useDocumentStore } from '@/stores/useDocumentStore'

const props = defineProps<{ canvasId: string }>()

const docStore = useDocumentStore()
const filterDefs = computed(() => docStore.getOrCreateDocument(props.canvasId).filterDefs)
</script>

<template>
  <defs>
    <filter
      v-for="f in filterDefs"
      :id="f.id"
      :key="f.id"
      x="-20%"
      y="-20%"
      width="140%"
      height="140%"
      v-html="f.markup"
    />
  </defs>
</template>
