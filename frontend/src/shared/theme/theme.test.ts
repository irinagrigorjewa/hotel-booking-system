import { describe, expect, it } from 'vitest'

import { theme } from './theme'
import { colors, fonts, radius } from './tokens'

describe('design tokens / theme', () => {
  it('uses Brief primary palette and removes indigo', () => {
    expect(colors.primary.main).toBe('#0C4A6E')
    expect(theme.palette.primary.main).toBe('#0C4A6E')
    expect(theme.palette.primary.main.toLowerCase()).not.toBe('#3949ab')
    expect(JSON.stringify(theme.palette)).not.toContain('3949ab')
  })

  it('exposes CTA and rating custom palette colors', () => {
    expect(theme.palette.cta.main).toBe('#C45C26')
    expect(theme.palette.rating.main).toBe('#CA8A04')
    expect(theme.palette.secondary.main).toBe('#0F766E')
  })

  it('applies Outfit display and Source Sans 3 body fonts', () => {
    expect(theme.typography.fontFamily).toContain('Source Sans 3')
    expect(theme.typography.h1?.fontFamily).toContain('Outfit')
    expect(fonts.display).toContain('Outfit')
  })

  it('uses soft radius and no text-transform on buttons', () => {
    expect(theme.shape.borderRadius).toBe(radius.md)
    expect(theme.components?.MuiButton?.defaultProps?.disableElevation).toBe(true)
  })
})
