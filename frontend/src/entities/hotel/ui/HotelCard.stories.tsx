import type { Meta, StoryObj } from '@storybook/react-vite'
import { Box } from '@mui/material'

import { createHotelListItem } from '@shared/test/hotelFixtures'
import { HotelCard } from './HotelCard'

const meta = {
  title: 'entities/hotel/HotelCard',
  component: HotelCard,
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 360 }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof HotelCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    hotel: createHotelListItem({
      avg_rating: 4.6,
      cover_image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      min_price: '4500',
      reviews_count: 128,
    }),
  },
}

export const NoPhoto: Story = {
  args: {
    hotel: createHotelListItem({
      cover_image: null,
      min_price: '3200',
    }),
  },
}

export const NoPrice: Story = {
  args: {
    hotel: createHotelListItem({
      cover_image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      min_price: null,
    }),
  },
}

export const LongText: Story = {
  args: {
    hotel: createHotelListItem({
      avg_rating: 4.2,
      city: 'Санкт-Петербург',
      cover_image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      min_price: '12500',
      name: 'Очень длинное название курортного отеля у моря с панорамным видом и спа',
      reviews_count: 42,
    }),
  },
}
