import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { WindowState } from '@/types/ui'
import type { ToolType } from '@/types/objects'
import { generateId } from '@/utils/idGenerator'

// [操作]ツールバーの初期位置
const TOOLPALETTE_INITIAL: WindowState = {
  id: 'toolpalette',
  kind: 'toolpalette',
  title: '[操作]ツールバー',
  x: 20,
  y: 60,
  width: 44,
  height: 280,
  zIndex: 5,
  minimized: false,
  visible: true,
}

export const useUiStore = defineStore('ui', () => {
  // MDIワークスペース上のフローティングウィンドウ一覧
  const windows = ref<WindowState[]>([{ ...TOOLPALETTE_INITIAL }])
  // アクティブなツール
  const activeTool = ref<ToolType>('select')
  // z-indexカウンター
  const nextZIndex = ref<number>(10)
  // アクティブキャンバスID
  const activeCanvasId = ref<string | null>(null)
  // グリッドスナップ
  const gridEnabled = ref(false)
  const gridSize = ref(10)

  /** 新しいキャンバスウィンドウをMDI上に追加 */
  function addCanvas(title = '新規キャンバス') {
    const id = `canvas-${generateId()}`
    const z = ++nextZIndex.value
    const win: WindowState = {
      id,
      kind: 'canvas',
      title,
      x: 80 + (windows.value.filter(w => w.kind === 'canvas').length * 20),
      y: 20 + (windows.value.filter(w => w.kind === 'canvas').length * 20),
      width: 460,
      height: 360,
      zIndex: z,
      minimized: false,
      visible: true,
    }
    windows.value.push(win)
    activeCanvasId.value = id
    return id
  }

  /** ウィンドウをフォーカス（最前面に） */
  function focusWindow(id: string) {
    const win = windows.value.find(w => w.id === id)
    if (win) {
      win.zIndex = ++nextZIndex.value
      if (win.kind === 'canvas') activeCanvasId.value = id
    }
  }

  /** ウィンドウを移動 */
  function moveWindow(id: string, x: number, y: number) {
    const win = windows.value.find(w => w.id === id)
    if (win) { win.x = x; win.y = y }
  }

  /** ウィンドウをリサイズ */
  function resizeWindow(id: string, width: number, height: number) {
    const win = windows.value.find(w => w.id === id)
    if (win) { win.width = Math.max(80, width); win.height = Math.max(60, height) }
  }

  /** ウィンドウを最小化/復元 */
  function toggleMinimize(id: string) {
    const win = windows.value.find(w => w.id === id)
    if (win) win.minimized = !win.minimized
  }

  /** ウィンドウを閉じる */
  function closeWindow(id: string) {
    windows.value = windows.value.filter(w => w.id !== id)
    if (activeCanvasId.value === id) {
      const remaining = windows.value.filter(w => w.kind === 'canvas')
      activeCanvasId.value = remaining.length > 0 ? remaining[remaining.length - 1].id : null
    }
  }

  /** アクティブツールを変更 */
  function setTool(tool: ToolType) {
    activeTool.value = tool
  }

  return {
    windows, activeTool, nextZIndex, activeCanvasId, gridEnabled, gridSize,
    addCanvas, focusWindow, moveWindow, resizeWindow, toggleMinimize, closeWindow, setTool,
  }
})

