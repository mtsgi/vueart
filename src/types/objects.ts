// ============================================================
// CanvasObject type definitions
// ============================================================

export type ToolType = 'select' | 'rect' | 'ellipse' | 'text' | 'image'

export interface BaseObject {
  id: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  visible: boolean
  locked: boolean
  filterId: string | null
  label: string
}

export interface RectObject extends BaseObject {
  type: 'rect'
  fill: string
  stroke: string
  strokeWidth: number
  rx: number
  ry: number
}

export interface EllipseObject extends BaseObject {
  type: 'ellipse'
  fill: string
  stroke: string
  strokeWidth: number
}

export interface TextObject extends BaseObject {
  type: 'text'
  text: string
  fontSize: number
  fontFamily: string
  fontWeight: string
  fill: string
  textAnchor: 'start' | 'middle' | 'end'
  /** 縦揃え。未設定時は 'top' と同じ挙動（後方互換） */
  verticalAlign?: 'top' | 'middle' | 'bottom'
}

export interface ImageObject extends BaseObject {
  type: 'image'
  href: string
  preserveAspectRatio: string
}

export interface GroupObject extends BaseObject {
  type: 'group'
  /** 子オブジェクト — 座標はグループ origin 相対 */
  children: CanvasObject[]
}

export type CanvasObject = RectObject | EllipseObject | TextObject | ImageObject | GroupObject
