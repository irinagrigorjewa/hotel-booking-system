import type { Meta, StoryObj } from '@storybook/react-vite'
import { Box, Button, Stack, Typography } from '@mui/material'

import { colors, fonts } from '@shared/theme/tokens'

const meta = {
  title: 'shared/theme/TokensDemo',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta

export default meta
type Story = StoryObj

const Swatch = ({ label, hex }: { label: string; hex: string }) => (
  <Box sx={{ minWidth: 120 }}>
    <Box
      sx={{
        bgcolor: hex,
        border: `1px solid ${colors.divider}`,
        borderRadius: 1,
        height: 56,
        mb: 1,
      }}
    />
    <Typography variant="body2">{label}</Typography>
    <Typography color="text.secondary" variant="caption">
      {hex}
    </Typography>
  </Box>
)

export const PaletteAndType: Story = {
  render: () => (
    <Stack spacing={3}>
      <Box>
        <Typography gutterBottom variant="h1">
          Hotel Booking
        </Typography>
        <Typography color="text.secondary" sx={{ fontFamily: fonts.body }} variant="body1">
          Outfit display + Source Sans 3 body — modern-travel tokens
        </Typography>
      </Box>

      <Stack direction="row" flexWrap="wrap" gap={2}>
        <Swatch hex={colors.primary.main} label="primary" />
        <Swatch hex={colors.primary.dark} label="primary.dark" />
        <Swatch hex={colors.primary.light} label="primary.light" />
        <Swatch hex={colors.secondary.main} label="secondary" />
        <Swatch hex={colors.cta.main} label="cta" />
        <Swatch hex={colors.success.main} label="success" />
        <Swatch hex={colors.error.main} label="error" />
        <Swatch hex={colors.rating.main} label="rating" />
      </Stack>

      <Stack direction="row" flexWrap="wrap" gap={1.5}>
        <Button variant="contained">Primary</Button>
        <Button color="secondary" variant="contained">
          Secondary
        </Button>
        <Button color="cta" variant="contained">
          Book now
        </Button>
        <Button color="error" variant="outlined">
          Cancel
        </Button>
        <Button variant="text">Text</Button>
      </Stack>
    </Stack>
  ),
}
