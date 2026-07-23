import type { Meta, StoryObj } from '@storybook/react-vite'
import { Box } from '@mui/material'

import { AppHeader } from './AppHeader'

const meta = {
  title: 'widgets/header/AppHeader',
  component: AppHeader,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AppHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Box sx={{ bgcolor: 'background.default', minHeight: 160 }}>
      <AppHeader />
      <Box sx={{ p: 3 }}>Scroll content placeholder</Box>
    </Box>
  ),
}

export const StickyScroll: Story = {
  render: () => (
    <Box sx={{ bgcolor: 'background.default' }}>
      <AppHeader />
      <Box sx={{ height: 800, p: 3 }}>Long page body — header stays sticky.</Box>
    </Box>
  ),
}
