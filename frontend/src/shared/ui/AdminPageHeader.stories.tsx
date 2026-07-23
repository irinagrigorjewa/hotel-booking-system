import type { Meta, StoryObj } from '@storybook/react-vite'

import { AdminPageHeader } from './AdminPageHeader'

const meta = {
  title: 'shared/ui/AdminPageHeader',
  component: AdminPageHeader,
} satisfies Meta<typeof AdminPageHeader>

export default meta
type Story = StoryObj<typeof meta>

export const TitleOnly: Story = {
  args: {
    title: 'Отели',
  },
}

export const WithLinks: Story = {
  args: {
    title: 'Отели',
    links: [
      { label: 'Создать', to: '/admin/hotels/new' },
      { label: 'К админке', to: '/admin' },
    ],
  },
}
