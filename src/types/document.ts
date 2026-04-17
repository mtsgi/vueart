import type { CanvasObject } from './objects'
import type { SvgFilterDefinition } from './filters'

export interface CanvasDocument {
  id: string
  name: string
  width: number
  height: number
  backgroundColor: string
  objects: CanvasObject[]
  filterDefs: SvgFilterDefinition[]
}
