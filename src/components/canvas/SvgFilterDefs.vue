<script setup lang="ts">
/**
 * SvgFilterDefs — SVGフィルタ定義（<defs>内）
 * キャンバスIDに対応するドキュメントのフィルタ定義を<filter>要素として展開する。
 *
 * セキュリティ注意:
 * DOMPurify は HTML パーサーを使うためフィルタプリミティブ名（feGaussianBlur等）が
 * 小文字化され、SVG で認識されなくなる問題がある。
 * そのため DOMParser で SVG/XML としてパースし、プリミティブ名の大文字小文字を
 * 保持したまま不正な要素・属性を除去する方式に変更。
 */
import { computed } from 'vue'
import { useDocumentStore } from '@/stores/useDocumentStore'

const props = defineProps<{ canvasId: string }>()

const docStore = useDocumentStore()
const filterDefs = computed(() => docStore.getOrCreateDocument(props.canvasId).filterDefs)

// SVGフィルタで許可する要素名セット（case-sensitive）
const ALLOWED_ELEMENTS = new Set([
  'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite',
  'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDropShadow',
  'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur',
  'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset',
  'feDistantLight', 'fePointLight', 'feSpecularLighting', 'feSpotLight',
  'feTile', 'feTurbulence',
])

// SVGフィルタで許可する属性名セット
const ALLOWED_ATTRS = new Set([
  'in', 'in2', 'result', 'x', 'y', 'width', 'height', 'dx', 'dy',
  'stdDeviation', 'operator', 'mode', 'type', 'values', 'tableValues',
  'slope', 'intercept', 'amplitude', 'exponent', 'offset', 'scale',
  'xChannelSelector', 'yChannelSelector', 'radius', 'baseFrequency',
  'numOctaves', 'seed', 'stitchTiles', 'surfaceScale', 'specularConstant',
  'specularExponent', 'lighting-color', 'kernelMatrix', 'divisor', 'bias',
  'targetX', 'targetY', 'edgeMode', 'kernelUnitLength', 'preserveAlpha',
  'order', 'k1', 'k2', 'k3', 'k4', 'azimuth', 'elevation',
  'pointsAtX', 'pointsAtY', 'pointsAtZ', 'limitingConeAngle', 'z',
  'flood-color', 'flood-opacity', 'color-interpolation-filters',
  'id', 'class',
])

/**
 * SVGフィルタマークアップを DOMParser で SVG/XML としてパースし、
 * 許可リストに含まれない要素・属性を除去して安全な innerHTML を返す。
 * DOMPurify は HTML パーサーを使うのでキャメルケースが失われる問題があるため使わない。
 */
function sanitizeMarkup(markup: string): string {
  try {
    const wrapped = `<svg xmlns="http://www.w3.org/2000/svg"><filter>${markup}</filter></svg>`
    const parsed = new DOMParser().parseFromString(wrapped, 'image/svg+xml')
    // パースエラーチェック
    if (parsed.querySelector('parsererror')) return ''
    const filterEl = parsed.querySelector('filter')
    if (!filterEl) return ''
    // 許可リスト外の要素・属性を再帰的に除去
    sanitizeNode(filterEl)
    return filterEl.innerHTML
  } catch {
    return ''
  }
}

/** ノードを再帰的に走査して不正な要素・属性を削除する */
function sanitizeNode(node: Element) {
  for (const child of Array.from(node.children)) {
    const tagName = child.localName // SVG パース済みなので localName は正しいケース
    if (!ALLOWED_ELEMENTS.has(tagName)) {
      child.remove()
      continue
    }
    // 許可外の属性を削除
    for (const attr of Array.from(child.attributes)) {
      if (!ALLOWED_ATTRS.has(attr.name)) {
        child.removeAttribute(attr.name)
      }
    }
    sanitizeNode(child)
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
