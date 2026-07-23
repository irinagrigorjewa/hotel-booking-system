import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { ConfirmDialog } from './ConfirmDialog'

const meta = {
  title: 'shared/ui/ConfirmDialog',
  component: ConfirmDialog,
  args: {
    open: true,
    title: 'Удалить отель?',
    description: 'Это действие нельзя отменить.',
  },
} satisfies Meta<typeof ConfirmDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {
  args: {
    onCancel: () => undefined,
    onConfirm: () => undefined,
  },
}

export const Interactive: Story = {
  args: {
    onCancel: () => undefined,
    onConfirm: () => undefined,
  },
  render: function InteractiveConfirmDialog() {
    const [open, setOpen] = useState(true)

    return (
      <ConfirmDialog
        description="Отель и связанные данные будут удалены."
        onCancel={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
        open={open}
        title="Удалить отель?"
      />
    )
  },
}

export const Confirming: Story = {
  args: {
    isConfirming: true,
    onCancel: () => undefined,
    onConfirm: () => undefined,
  },
}
