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
}

export interface ImageObject extends BaseObject {
  type: 'image'
  href: string
  preserveAspectRatio: string
}

export type CanvasObject = RectObject | EllipseObject | TextObject | ImageObject
