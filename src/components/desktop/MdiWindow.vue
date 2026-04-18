<script setup lang="ts">
/**
 * MdiWindow — MDIワークスペース上のフローティングウィンドウ枠
 * タイトルバーのドラッグで移動、最小化/クローズボタンを持つ。
 * コンテンツは <slot> で注入する。
 */
import { computed } from 'vue'
import type { WindowState } from '@/types/ui'
import { useUiStore } from '@/stores/useUiStore'
import { useDraggable } from '@/composables/useDraggable'

const props = defineProps<{ win: WindowState; active?: boolean }>()
const emit = defineEmits<{ close: [id: string] }>()

const uiStore = useUiStore()

// タイトルバードラッグでウィンドウ移動
const { startDrag } = useDraggable(
  (x, y) => uiStore.moveWindow(props.win.id, x, y),
  () => uiStore.focusWindow(props.win.id)
)

function onTitlebarMousedown(e: MouseEvent) {
  startDrag(e, props.win.x, props.win.y)
}

/**
 * ウィンドウリサイズ開始
 * direction: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' の組み合わせ
 */
function startResize(direction: string, e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  uiStore.focusWindow(props.win.id)

  const startX = e.clientX
  const startY = e.clientY
  const origX = props.win.x
  const origY = props.win.y
  const origW = props.win.width
  const origH = props.win.height

  function onMove(ev: MouseEvent) {
    const dx = ev.clientX - startX
    const dy = ev.clientY - startY
    let x = origX, y = origY, w = origW, h = origH
    if (direction.includes('e')) w = Math.max(80, origW + dx)
    if (direction.includes('s')) h = Math.max(40, origH + dy)
    if (direction.includes('w')) { w = Math.max(80, origW - dx); x = origX + origW - w }
    if (direction.includes('n')) { h = Math.max(40, origH - dy); y = origY + origH - h }
    uiStore.setWindowGeometry(props.win.id, x, y, w, h)
  }
  function onUp() {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

// ウィンドウの位置・サイズをスタイルに変換
const style = computed(() => ({
  left: `${props.win.x}px`,
  top: `${props.win.y}px`,
  width: `${props.win.width}px`,
  zIndex: props.win.zIndex,
}))
</script>

<template>
  <div
    class="mdi-window"
    :class="{ minimized: win.minimized }"
    :style="style"
    @mousedown="uiStore.focusWindow(win.id)"
  >
    <!-- タイトルバー -->
    <div
      class="titlebar"
      :class="{ active: active }"
      @mousedown.stop="onTitlebarMousedown"
    >
      <span class="titlebar__text">{{ win.title }}</span>
      <div class="titlebar__buttons">
        <button class="tb-btn tb-btn--min" title="最小化" @mousedown.stop @click.stop="uiStore.toggleMinimize(win.id)">_</button>
        <button class="tb-btn tb-btn--close" title="閉じる" @mousedown.stop @click.stop="emit('close', win.id)">✕</button>
      </div>
    </div>

    <!-- コンテンツ領域（最小化時は非表示） -->
    <div v-if="!win.minimized" class="window-body" :style="{ height: `${win.height}px` }">
      <slot />
    </div>

    <!-- リサイズハンドル（8方向） -->
    <div class="resize-handle resize-handle--n"  @mousedown.stop="startResize('n', $event)" />
    <div class="resize-handle resize-handle--s"  @mousedown.stop="startResize('s', $event)" />
    <div class="resize-handle resize-handle--e"  @mousedown.stop="startResize('e', $event)" />
    <div class="resize-handle resize-handle--w"  @mousedown.stop="startResize('w', $event)" />
    <div class="resize-handle resize-handle--nw" @mousedown.stop="startResize('nw', $event)" />
    <div class="resize-handle resize-handle--ne" @mousedown.stop="startResize('ne', $event)" />
    <div class="resize-handle resize-handle--sw" @mousedown.stop="startResize('sw', $event)" />
    <div class="resize-handle resize-handle--se" @mousedown.stop="startResize('se', $event)" />
  </div>
</template>

<style lang="scss" scoped>
.mdi-window {
  position: absolute;
  background: var(--win-bg);
  border-top: 2px solid var(--win-border-light);
  border-left: 2px solid var(--win-border-light);
  border-right: 2px solid var(--win-border-dark);
  border-bottom: 2px solid var(--win-border-dark);
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.6);
  min-width: 80px;
}

.titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 4px;
  background: var(--win-titlebar-inactive);
  cursor: default;
  height: 20px;
  gap: 4px;

  // アクティブ状態は :active クラスで制御
  &.active {
    background: var(--win-titlebar-active);
  }

  &__text {
    color: var(--win-titlebar-text);
    font-size: 11px;
    font-weight: bold;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    pointer-events: none;
  }

  &__buttons {
    display: flex;
    gap: 2px;
  }
}

.tb-btn {
  width: 16px;
  height: 14px;
  font-size: 8px;
  line-height: 1;
  border: none;
  cursor: default;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: var(--panel-bg);
  color: var(--text-primary);
  border-top: 1px solid var(--win-border-light);
  border-left: 1px solid var(--win-border-light);
  border-right: 1px solid var(--win-border-dark);
  border-bottom: 1px solid var(--win-border-dark);

  &:active {
    border-top: 1px solid var(--win-border-dark);
    border-left: 1px solid var(--win-border-dark);
    border-right: 1px solid var(--win-border-light);
    border-bottom: 1px solid var(--win-border-light);
  }

  &--close:hover {
    background: var(--danger);
    color: white;
  }
}

.window-body {
  overflow: auto;
  position: relative;
}

// リサイズハンドル（ウィンドウの各エッジ・コーナーに透明なヒット領域を配置）
$rh: 5px; // ハンドルの厚み
$rc: 8px; // コーナーハンドルの辺長

.resize-handle {
  position: absolute;
  z-index: 10;
  // エッジ
  &--n  { top: -$rh; left: $rc; right: $rc; height: $rh * 2; cursor: n-resize; }
  &--s  { bottom: -$rh; left: $rc; right: $rc; height: $rh * 2; cursor: s-resize; }
  &--e  { right: -$rh; top: $rc; bottom: $rc; width: $rh * 2; cursor: e-resize; }
  &--w  { left: -$rh; top: $rc; bottom: $rc; width: $rh * 2; cursor: w-resize; }
  // コーナー
  &--nw { top: -$rh; left: -$rh; width: $rc + $rh; height: $rc + $rh; cursor: nw-resize; }
  &--ne { top: -$rh; right: -$rh; width: $rc + $rh; height: $rc + $rh; cursor: ne-resize; }
  &--sw { bottom: -$rh; left: -$rh; width: $rc + $rh; height: $rc + $rh; cursor: sw-resize; }
  &--se { bottom: -$rh; right: -$rh; width: $rc + $rh; height: $rc + $rh; cursor: se-resize; }
}
</style>
