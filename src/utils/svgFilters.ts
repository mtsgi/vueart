import type { SvgFilterDefinition } from '@/types/filters'

export function builtinFilters(): SvgFilterDefinition[] {
  return [
    {
      id: 'filter-bevel-emboss',
      name: 'Bevel & Emboss',
      markup: `
        <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/>
        <feSpecularLighting in="blur" surfaceScale="6" specularConstant="1" specularExponent="20"
            lighting-color="white" result="specOut">
          <fePointLight x="50" y="-100" z="200"/>
        </feSpecularLighting>
        <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specClip"/>
        <feBlend in="SourceGraphic" in2="specClip" mode="screen" result="blend"/>
        <feComposite in="blend" in2="SourceAlpha" operator="in"/>
      `,
    },
    {
      id: 'filter-drop-shadow',
      name: 'Drop Shadow',
      markup: `
        <feDropShadow dx="4" dy="4" stdDeviation="3" flood-color="rgba(0,0,0,0.6)"/>
      `,
    },
    {
      id: 'filter-inner-glow',
      name: 'Inner Glow',
      markup: `
        <feFlood flood-color="#4a9eff" flood-opacity="0.7" result="color"/>
        <feComposite in="color" in2="SourceAlpha" operator="in" result="glow"/>
        <feGaussianBlur in="glow" stdDeviation="4" result="blurGlow"/>
        <feMerge>
          <feMergeNode in="SourceGraphic"/>
          <feMergeNode in="blurGlow"/>
        </feMerge>
      `,
    },
    {
      id: 'filter-emboss-button',
      name: 'Emboss Button',
      markup: `
        <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
        <feOffset in="blur" dx="-2" dy="-2" result="offsetBlur"/>
        <feSpecularLighting in="offsetBlur" surfaceScale="5" specularConstant="0.75"
            specularExponent="40" lighting-color="#ffffff" result="specOut">
          <feDistantLight azimuth="225" elevation="45"/>
        </feSpecularLighting>
        <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specClip"/>
        <feBlend in="SourceGraphic" in2="specClip" mode="screen"/>
      `,
    },
  ]
}
