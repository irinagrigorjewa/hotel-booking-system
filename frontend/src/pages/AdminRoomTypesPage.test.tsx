import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { roomTypeHandlers, server } from '../test/server'
import { renderWithProviders } from '../test/renderWithProviders'
import { AdminRoomTypesPage } from './AdminRoomTypesPage'

describe('AdminRoomTypesPage', () => {
  it('lists room types and creates a new one', async () => {
    renderWithProviders(<AdminRoomTypesPage />, {
      initialEntries: ['/admin/room-types'],
    })

    expect(await screen.findByText('Standard')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Название типа'), {
      target: { value: 'Suite' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Создать' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Название типа')).toHaveValue('')
    })
  })

  it('shows a field error for duplicate room type names', async () => {
    server.use(roomTypeHandlers.createConflict)
    renderWithProviders(<AdminRoomTypesPage />, {
      initialEntries: ['/admin/room-types'],
    })

    await screen.findByText('Standard')

    fireEvent.change(screen.getByLabelText('Название типа'), {
      target: { value: 'Standard' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Создать' }))

    expect(
      await screen.findByText('Тип номера с таким названием уже существует'),
    ).toBeInTheDocument()
  })

  it('shows empty state when no room types exist', async () => {
    server.use(roomTypeHandlers.listEmpty)
    renderWithProviders(<AdminRoomTypesPage />, {
      initialEntries: ['/admin/room-types'],
    })

    expect(
      await screen.findByText('Типы номеров ещё не созданы'),
    ).toBeInTheDocument()
  })
})
