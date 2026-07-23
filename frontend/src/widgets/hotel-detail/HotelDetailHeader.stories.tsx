import type { Meta, StoryObj } from '@storybook/react-vite'

import { createHotelDetail } from '@shared/test/hotelFixtures'
import { HotelDetailHeader } from './HotelDetailHeader'

const meta = {
  title: 'widgets/hotel-detail/HotelDetailHeader',
  component: HotelDetailHeader,
} satisfies Meta<typeof HotelDetailHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    hotel: createHotelDetail({
      avg_rating: 4.7,
      description: 'Central hotel near Red Square with modern rooms.',
      reviews_count: 86,
    }),
  },
}

export const LongText: Story = {
  args: {
    hotel: createHotelDetail({
      address: 'Очень длинный адрес курортной улицы с корпусом и этажом',
      avg_rating: 4.1,
      description:
        'Подробное описание отеля на несколько предложений: бассейн, спа, ресторан с видом на море, семейные номера и конференц-зал. Идеально для длинных выходных и деловых поездок.',
      name: 'Курортный комплекс с очень длинным названием у побережья',
      reviews_count: 12,
    }),
  },
}

export const Minimal: Story = {
  args: {
    hotel: createHotelDetail({
      avg_rating: null,
      description: null,
      reviews_count: 0,
    }),
  },
}
