import type { Meta, StoryObj } from '@storybook/react-vite'

import { createHotelListItem } from '@shared/test/hotelFixtures'
import { HotelCatalogState } from './HotelCatalogState'

const meta = {
  title: 'shared/ui/HotelCatalogState',
  component: HotelCatalogState,
  args: {
    onRetry: () => undefined,
  },
} satisfies Meta<typeof HotelCatalogState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    isError: false,
    isLoading: false,
    items: [
      createHotelListItem({
        avg_rating: 4.5,
        cover_image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        id: 1,
        min_price: '4500',
        name: 'Grand Hotel',
        reviews_count: 20,
      }),
      createHotelListItem({
        city: 'Kazan',
        cover_image: null,
        id: 2,
        min_price: '2800',
        name: 'River Inn',
        stars: 3,
      }),
      createHotelListItem({
        city: 'Sochi',
        cover_image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
        id: 3,
        min_price: '6200',
        name: 'Sea View Resort',
        stars: 4,
      }),
    ],
  },
}

export const Loading: Story = {
  args: {
    isError: false,
    isLoading: true,
    items: [],
  },
}

export const Empty: Story = {
  args: {
    isError: false,
    isLoading: false,
    items: [],
  },
}

export const Error: Story = {
  args: {
    isError: true,
    isLoading: false,
    items: [],
  },
}
