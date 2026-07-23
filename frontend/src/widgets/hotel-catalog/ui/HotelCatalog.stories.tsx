import type { Meta, StoryObj } from '@storybook/react-vite'

import { createHotelListItem } from '@shared/test/hotelFixtures'
import { HotelCatalog } from './HotelCatalog'

const meta = {
  title: 'widgets/hotel-catalog/HotelCatalog',
  component: HotelCatalog,
  args: {
    onFiltersChange: () => undefined,
    onRetry: () => undefined,
  },
} satisfies Meta<typeof HotelCatalog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    filters: { city: '', sort: 'created_at', stars: '' },
    isError: false,
    isLoading: false,
    items: [
      createHotelListItem({
        cover_image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        min_price: '4500',
      }),
    ],
    mapHref: '/hotels/map',
    mapLabel: 'На карте',
    pagination: { count: 3, onChange: () => undefined, page: 1 },
  },
}

export const Loading: Story = {
  args: {
    filters: { city: '', sort: 'created_at', stars: '' },
    isError: false,
    isLoading: true,
    items: [],
  },
}

export const Empty: Story = {
  args: {
    filters: { city: 'Nowhere', sort: 'created_at', stars: '' },
    isError: false,
    isLoading: false,
    items: [],
  },
}

export const Error: Story = {
  args: {
    filters: { city: '', sort: 'created_at', stars: '' },
    isError: true,
    isLoading: false,
    items: [],
  },
}
