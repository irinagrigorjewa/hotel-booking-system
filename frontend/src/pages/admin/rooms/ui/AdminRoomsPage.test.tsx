import { fireEvent, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { roomHandlers, server } from '@shared/test/server'
import { renderWithProviders } from '@shared/test/renderWithProviders'
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

  it('shows gallery and upload in edit section, not in table row', async () => {
    server.use(
      http.get('*/api/v1/rooms/:roomId', () =>
        HttpResponse.json({
          id: 5,
          hotel_id: 1,
          room_type_id: 1,
          number: '301',
          price: '5500.00',
          capacity: 2,
          description: 'City view',
          status: 'AVAILABLE',
          room_type: { id: 1, name: 'Standard' },
          hotel: { id: 1, name: 'Grand Hotel', city: 'Moscow' },
          images: [
            { id: 20, url: '/media/rooms/5/a.jpg', sort_order: 0 },
          ],
        }),
      ),
    )

    renderWithProviders(<AdminRoomsPage />, {
      initialEntries: ['/admin/rooms'],
    })

    await screen.findByText('301')

    expect(screen.queryByAltText('Номер 301 фото 0')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Загрузить фото' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Изменить' }))

    expect(await screen.findByAltText('Номер 301 фото 0')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Загрузить фото' })).toBeInTheDocument()
    expect(screen.getByText('Фото номера')).toBeInTheDocument()
  })
})
