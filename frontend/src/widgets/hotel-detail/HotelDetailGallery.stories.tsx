import type { Meta, StoryObj } from '@storybook/react-vite'

import { HotelDetailGallery } from './HotelDetailGallery'

const meta = {
  title: 'widgets/hotel-detail/HotelDetailGallery',
  component: HotelDetailGallery,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof HotelDetailGallery>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    hotelId: 1,
    hotelName: 'Grand Hotel',
    images: [
      {
        id: 1,
        sort_order: 0,
        url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
      },
      {
        id: 2,
        sort_order: 1,
        url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
      },
      {
        id: 3,
        sort_order: 2,
        url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
      },
    ],
    latitude: '55.75',
    longitude: '37.61',
  },
}

export const Empty: Story = {
  args: {
    hotelId: 1,
    hotelName: 'Grand Hotel',
    images: [],
    latitude: '55.75',
    longitude: '37.61',
  },
}
