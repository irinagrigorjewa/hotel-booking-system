/** Design tokens — single source for MUI theme (Design Brief modern-travel). */

export const colors = {
  primary: {
    main: '#0C4A6E',
    dark: '#082F46',
    light: '#E0F2FE',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#0F766E',
    dark: '#0D5F59',
    light: '#CCFBF1',
    contrastText: '#FFFFFF',
  },
  cta: {
    main: '#C45C26',
    dark: '#9A4A1E',
    light: '#F3D5C4',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#F4F7FA',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#0F172A',
    secondary: '#64748B',
  },
  divider: '#E2E8F0',
  success: {
    main: '#15803D',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#B91C1C',
    contrastText: '#FFFFFF',
  },
  rating: {
    main: '#CA8A04',
    dark: '#A16207',
    light: '#FEF08A',
    contrastText: '#0F172A',
  },
} as const

export const fonts = {
  display: '"Outfit", "Source Sans 3", sans-serif',
  body: '"Source Sans 3", "Segoe UI", sans-serif',
} as const

export const typographyScale = {
  h1: { fontSize: '2.5rem', lineHeight: 1.2, fontWeight: 700 },
  h2: { fontSize: '1.75rem', lineHeight: 1.25, fontWeight: 700 },
  h3: { fontSize: '1.375rem', lineHeight: 1.3, fontWeight: 600 },
  h4: { fontSize: '1.25rem', lineHeight: 1.35, fontWeight: 600 },
  body1: { fontSize: '1rem', lineHeight: 1.55, fontWeight: 400 },
  body2: { fontSize: '0.875rem', lineHeight: 1.5, fontWeight: 400 },
  button: { fontSize: '0.9375rem', lineHeight: 1.4, fontWeight: 600 },
} as const

/** 4px base scale (MUI spacing unit remains 8). */
export const spacingScale = [4, 8, 12, 16, 24, 32, 48, 64] as const

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
} as const

/** Soft slate-tinted shadows — no neon / multi-layer glow. */
export const elevation = {
  0: 'none',
  1: '0px 1px 3px rgba(15, 23, 42, 0.08)',
  2: '0px 2px 8px rgba(15, 23, 42, 0.08)',
  3: '0px 8px 24px rgba(15, 23, 42, 0.10)',
} as const

export const breakpoints = {
  mobile: 375,
  tablet: 768,
  desktop: 1280,
} as const

export const tokens = {
  colors,
  fonts,
  typographyScale,
  spacingScale,
  radius,
  elevation,
  breakpoints,
} as const
