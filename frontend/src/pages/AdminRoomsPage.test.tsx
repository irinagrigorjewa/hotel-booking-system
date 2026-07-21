import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { roomHandlers, server } from '../test/server'
import { renderWithProviders } from '../test/renderWithProviders'
import { AdminRoomsPage } from './AdminRoomsPage'

describe('AdminRoomsPage', () => {
  it('lists rooms and creates a new room', async () => {
    renderWithProviders(<AdminRoomsPage />, {
      initialEntries: ['/admin/rooms'],
    })

    expect(await screen.findByText('301')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Номер'), {
      target: { value: '401' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Создать' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Номер')).toHaveValue('')
    })

    expect(await screen.findByRole('alert')).toHaveTextContent('Номер сохранён')
  })

  it('shows a conflict error for duplicate room numbers', async () => {
    server.use(roomHandlers.createConflict)
    renderWithProviders(<AdminRoomsPage />, {
      initialEntries: ['/admin/rooms'],
    })

    await screen.findByText('301')

    fireEvent.change(screen.getByLabelText('Номер'), {
      target: { value: '301' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Создать' }))

    expect(
      await screen.findByText('Номер комнаты уже существует в этом отеле'),
    ).toBeInTheDocument()
  })
})
