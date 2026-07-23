import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { HotelFilters, type HotelFiltersValue } from './HotelFilters'

const defaultValue: HotelFiltersValue = {
  city: '',
  sort: 'created_at',
  stars: '',
}

const meta = {
  title: 'features/hotel-filters/HotelFilters',
  component: HotelFilters,
} satisfies Meta<typeof HotelFilters>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onChange: () => undefined,
    value: defaultValue,
  },
}

export const Filled: Story = {
  args: {
    onChange: () => undefined,
    value: {
      city: 'Moscow',
      sort: 'avg_rating',
      stars: 4,
    },
  },
}

export const WithoutSort: Story = {
  args: {
    onChange: () => undefined,
    showSort: false,
    value: defaultValue,
  },
}

export const Interactive: Story = {
  args: {
    onChange: () => undefined,
    value: defaultValue,
  },
  render: function InteractiveFilters() {
    const [value, setValue] = useState<HotelFiltersValue>(defaultValue)

    return <HotelFilters onChange={setValue} value={value} />
  },
}
