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

// 選択オブジェクトのリサイズハンドル方向
// nw/n/ne/e/se/s/sw/w = 8方向（コーナー4 + エッジ4）
export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
