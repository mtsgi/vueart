// ============================================================
// SVG Filter definitions
// ============================================================

export interface SvgFilterDefinition {
  id: string
  name: string
  // Raw SVG markup for the <filter> element content (children only)
  markup: string
}
