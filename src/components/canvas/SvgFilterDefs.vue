<script setup lang="ts">
/**
 * SvgFilterDefs — SVGフィルタ定義（<defs>内）
 * キャンバスIDに対応するドキュメントのフィルタ定義を<filter>要素として展開する。
 * v-html で挿入するマークアップは DOMPurify でサニタイズし、
 * SVGフィルタ系の要素・属性のみを許可する。
 */
import { computed } from 'vue'
import DOMPurify from 'dompurify'
import { useDocumentStore } from '@/stores/useDocumentStore'

const props = defineProps<{ canvasId: string }>()

const docStore = useDocumentStore()
const filterDefs = computed(() => docStore.getOrCreateDocument(props.canvasId).filterDefs)

// DOMPurify のサニタイズ設定（SVGフィルタ関連の要素・属性のみ許可）
const ALLOWED_FILTER_TAGS = [
  'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite',
  'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDropShadow',
  'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur',
  'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset',
  'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence',
  'animate', 'animateTransform', 'set',
]

const ALLOWED_FILTER_ATTRS = [
  'in', 'in2', 'result', 'x', 'y', 'width', 'height', 'dx', 'dy',
  'stdDeviation', 'operator', 'mode', 'type', 'values', 'tableValues',
  'slope', 'intercept', 'amplitude', 'exponent', 'offset', 'scale',
  'xChannelSelector', 'yChannelSelector', 'radius', 'baseFrequency',
  'numOctaves', 'seed', 'stitchTiles', 'surfaceScale', 'specularConstant',
  'specularExponent', 'lighting-color', 'kernelMatrix', 'divisor', 'bias',
  'targetX', 'targetY', 'edgeMode', 'kernelUnitLength', 'preserveAlpha',
  'order', 'k1', 'k2', 'k3', 'k4', 'azimuth', 'elevation',
  'pointsAtX', 'pointsAtY', 'pointsAtZ', 'limitingConeAngle', 'z',
  'transform', 'href', 'preserveAspectRatio', 'crossorigin', 'id', 'class',
  'begin', 'dur', 'end', 'repeatCount', 'repeatDur', 'fill', 'calcMode',
  'keyTimes', 'keySplines', 'from', 'to', 'by',
  'attributeName', 'attributeType', 'additive', 'accumulate',
]

/** フィルタ内部のマークアップをサニタイズして安全な文字列を返す */
function sanitizeMarkup(markup: string): string {
  try {
    return DOMPurify.sanitize(markup, {
      USE_PROFILES: { svg: true, svgFilters: true },
      ALLOWED_TAGS: ALLOWED_FILTER_TAGS,
      ALLOWED_ATTR: ALLOWED_FILTER_ATTRS,
    })
  } catch {
    // サニタイズ失敗時は空文字列を返して安全に無効化する
    return ''
  }
}
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
      v-html="sanitizeMarkup(f.markup)"
    />
  </defs>
</template>
