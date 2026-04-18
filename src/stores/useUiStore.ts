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

// ツールボックスの初期位置
const TOOLBOX_INITIAL: WindowState = {
  id: 'toolbox',
  kind: 'toolbox',
  title: 'ツール',
  x: 20,
  y: 60,
  width: 44,
  height: 180,
  zIndex: 6,
  minimized: false,
  visible: false,
}

// プロパティパネルの初期位置
const PROPERTIES_INITIAL: WindowState = {
  id: 'properties',
  kind: 'properties',
  title: 'プロパティ',
  x: 600,
  y: 60,
  width: 180,
  height: 360,
  zIndex: 7,
  minimized: false,
  visible: false,
}

// レイヤーパネルの初期位置
const LAYERS_INITIAL: WindowState = {
  id: 'layers',
  kind: 'layers',
  title: 'レイヤー',
  x: 600,
  y: 440,
  width: 180,
  height: 200,
  zIndex: 8,
  minimized: false,
  visible: false,
}

export const useUiStore = defineStore('ui', () => {
  // MDIワークスペース上のフローティングウィンドウ一覧
  const windows = ref<WindowState[]>([
    { ...TOOLPALETTE_INITIAL },
    { ...TOOLBOX_INITIAL },
    { ...PROPERTIES_INITIAL },
    { ...LAYERS_INITIAL },
  ])
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

  /** ウィンドウの位置・サイズを一括更新（リサイズ操作用） */
  function setWindowGeometry(id: string, x: number, y: number, width: number, height: number) {
    const win = windows.value.find(w => w.id === id)
    if (win) {
      win.x = x
      win.y = y
      win.width = Math.max(80, width)
      win.height = Math.max(40, height)
    }
  }

  /** アクティブツールを変更 */
  function setTool(tool: ToolType) {
    activeTool.value = tool
  }

  /** ウィンドウの表示/非表示を切り替え（visibleだけ切り替え，非表示時は前面に出す） */
  function toggleWindow(id: string) {
    const win = windows.value.find(w => w.id === id)
    if (!win) return
    win.visible = !win.visible
    if (win.visible) {
      win.zIndex = ++nextZIndex.value
      win.minimized = false
    }
  }

  return {
    windows, activeTool, nextZIndex, activeCanvasId, gridEnabled, gridSize,
    addCanvas, focusWindow, moveWindow, resizeWindow, setWindowGeometry, toggleMinimize, closeWindow, setTool, toggleWindow,
  }
})

