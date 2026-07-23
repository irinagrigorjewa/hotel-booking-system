import { createTheme, type Shadows } from '@mui/material/styles'

import {
  colors,
  elevation,
  fonts,
  radius,
  typographyScale,
} from './tokens'

declare module '@mui/material/styles' {
  interface Palette {
    cta: Palette['primary']
    rating: Palette['primary']
  }

  interface PaletteOptions {
    cta?: PaletteOptions['primary']
    rating?: PaletteOptions['primary']
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    cta: true
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    cta: true
  }
}

const softShadows = [
  elevation[0],
  elevation[1],
  elevation[2],
  elevation[3],
  ...Array.from({ length: 21 }, () => elevation[3]),
] as Shadows

export const theme = createTheme({
  palette: {
    primary: { ...colors.primary },
    secondary: { ...colors.secondary },
    cta: { ...colors.cta },
    rating: { ...colors.rating },
    background: { ...colors.background },
    text: { ...colors.text },
    divider: colors.divider,
    success: { ...colors.success },
    error: { ...colors.error },
  },
  typography: {
    fontFamily: fonts.body,
    h1: {
      fontFamily: fonts.display,
      ...typographyScale.h1,
    },
    h2: {
      fontFamily: fonts.display,
      ...typographyScale.h2,
    },
    h3: {
      fontFamily: fonts.display,
      ...typographyScale.h3,
    },
    h4: {
      fontFamily: fonts.display,
      ...typographyScale.h4,
    },
    h5: {
      fontFamily: fonts.display,
      fontWeight: 600,
    },
    h6: {
      fontFamily: fonts.display,
      fontWeight: 600,
    },
    body1: { ...typographyScale.body1 },
    body2: { ...typographyScale.body2 },
    button: {
      ...typographyScale.button,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: radius.md,
  },
  shadows: softShadows,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: typographyScale.button.fontWeight,
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: elevation[1],
        },
        elevation2: {
          boxShadow: elevation[2],
        },
        elevation3: {
          boxShadow: elevation[3],
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          border: `1px solid ${colors.divider}`,
        },
      },
    },
  },
})

export { tokens } from './tokens'
