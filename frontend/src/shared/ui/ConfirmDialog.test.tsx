import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@shared/test/renderWithProviders'
import { ConfirmDialog } from './ConfirmDialog'

describe('ConfirmDialog', () => {
  it('renders title and action buttons when open', () => {
    renderWithProviders(
      <ConfirmDialog
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
        open
        title="Удалить отель?"
      />,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Удалить отель?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Подтвердить' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Отменить' })).toBeInTheDocument()
  })

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = vi.fn()
    const onConfirm = vi.fn()

    renderWithProviders(
      <ConfirmDialog
        onCancel={onCancel}
        onConfirm={onConfirm}
        open
        title="Удалить?"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Отменить' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('calls onConfirm when Confirm is clicked', () => {
    const onCancel = vi.fn()
    const onConfirm = vi.fn()

    renderWithProviders(
      <ConfirmDialog
        onCancel={onCancel}
        onConfirm={onConfirm}
        open
        title="Удалить?"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Подтвердить' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('does not render dialog content when closed', () => {
    renderWithProviders(
      <ConfirmDialog
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
        open={false}
        title="Удалить?"
      />,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
