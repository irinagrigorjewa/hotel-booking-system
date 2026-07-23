import type { Meta, StoryObj } from '@storybook/react-vite'

import { AdminErrorAlert } from './AdminErrorAlert'

const meta = {
  title: 'shared/ui/AdminErrorAlert',
  component: AdminErrorAlert,
} satisfies Meta<typeof AdminErrorAlert>

export default meta
type Story = StoryObj<typeof meta>

export const MessageOnly: Story = {
  args: {
    message: 'Не удалось загрузить список отелей.',
  },
}

export const WithRetry: Story = {
  args: {
    message: 'Не удалось загрузить список отелей.',
    onRetry: () => undefined,
    retryLabel: 'Повторить',
  },
}
