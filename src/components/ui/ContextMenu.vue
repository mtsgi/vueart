<script setup lang="ts">
/**
 * ContextMenu — 汎用コンテキストメニュー
 * position と items を受け取り、画面内に収まる位置でポップアップ表示する。
 * 外側クリックや Escape キーで閉じる。
 */
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

export interface ContextMenuItem {
  label?: string
  action?: () => void
  disabled?: boolean
  separator?: boolean
  checked?: boolean   // チェックマーク付き項目（グリッドONなど）
}

const props = defineProps<{
  items: ContextMenuItem[]
  x: number
  y: number
}>()
const emit = defineEmits<{ close: [] }>()

const menuEl = ref<HTMLElement | null>(null)
const adjustedX = ref(props.x)
const adjustedY = ref(props.y)

// マウント後にビューポートからはみ出さないよう位置調整
onMounted(async () => {
  await nextTick()
  if (!menuEl.value) return
  const { width, height } = menuEl.value.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight
  adjustedX.value = props.x + width > vw ? Math.max(0, vw - width - 4) : props.x
  adjustedY.value = props.y + height > vh ? Math.max(0, vh - height - 4) : props.y
})

function onItemClick(item: ContextMenuItem) {
  if (item.disabled || item.separator) return
  item.action?.()
  emit('close')
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

function onOutsideClick(e: MouseEvent) {
  if (menuEl.value && !menuEl.value.contains(e.target as Node)) {
    emit('close')
  }
}

onMounted(() => {
  // 次フレームで登録（開いた直後の mousedown を無視するため）
  setTimeout(() => {
    window.addEventListener('mousedown', onOutsideClick)
    window.addEventListener('keydown', onKeyDown)
  }, 0)
})
onUnmounted(() => {
  window.removeEventListener('mousedown', onOutsideClick)
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <div
    ref="menuEl"
    class="context-menu"
    :style="{ left: `${adjustedX}px`, top: `${adjustedY}px` }"
  >
    <template v-for="(item, i) in items" :key="i">
      <div v-if="item.separator" class="context-menu__sep" />
      <button
        v-else
        class="context-menu__item"
        :class="{ disabled: item.disabled }"
        :disabled="item.disabled"
        @click="onItemClick(item)"
      >
        <span class="context-menu__check">{{ item.checked ? '✓' : '' }}</span>
        {{ item.label }}
      </button>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.context-menu {
  position: fixed;
  z-index: 99999;
  min-width: 160px;
  background: var(--win-bg);
  border: 1px solid var(--win-border-dark);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  padding: 2px;
  user-select: none;

  &__sep {
    height: 1px;
    background: var(--win-border-dark);
    margin: 2px 4px;
  }

  &__item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 3px 12px 3px 4px;
    font-size: 11px;
    text-align: left;
    background: transparent;
    color: var(--text-primary);
    border: 1px solid transparent;
    cursor: default;
    gap: 2px;

    &:hover:not(:disabled) {
      background: var(--win-titlebar-active);
      color: #fff;
      border-color: transparent;
    }

    &:disabled,
    &.disabled {
      color: var(--text-secondary);
      cursor: not-allowed;
    }
  }

  &__check {
    width: 14px;
    font-size: 10px;
    flex-shrink: 0;
    text-align: center;
  }
}
</style>
