// MDIワークスペース上のフローティングウィンドウ種別
// 'canvas' = キャンバスウィンドウ（複数開ける）
// 'toolpalette' = [操作]ツールバー（フローティング）
export type WindowId = 'canvas' | 'toolpalette'

export interface WindowState {
  id: string          // canvas は "canvas-{uuid}"、toolpalette は "toolpalette"
  kind: WindowId
  title: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  minimized: boolean
  visible: boolean
}
