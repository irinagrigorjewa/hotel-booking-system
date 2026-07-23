import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { createHotelDetail } from '@shared/test/hotelFixtures'
import { renderWithProviders } from '@shared/test/renderWithProviders'
import { server } from '@shared/test/server'
import { AdminHotelsPage } from './AdminHotelsPage'

describe('AdminHotelsPage', () => {
  it('lists hotels and validates latitude before submit', async () => {
    renderWithProviders(<AdminHotelsPage />, {
      initialEntries: ['/admin/hotels'],
    })

    expect(await screen.findByText('Grand Hotel')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Название'), {
      target: { value: 'Aurora' },
    })
    fireEvent.change(screen.getByLabelText('Город'), {
      target: { value: 'Sochi' },
    })
    fireEvent.change(screen.getByLabelText('Адрес'), {
      target: { value: 'Beach 1' },
    })
    fireEvent.change(screen.getByLabelText('Широта'), {
      target: { value: '120' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Создать' }))

    expect(await screen.findByText('Широта от −90 до 90')).toBeInTheDocument()
  })

  it('creates a hotel through the API on valid submit', async () => {
    renderWithProviders(<AdminHotelsPage />, {
      initialEntries: ['/admin/hotels'],
    })

    await screen.findByText('Grand Hotel')

    fireEvent.change(screen.getByLabelText('Название'), {
      target: { value: 'Aurora' },
    })
    fireEvent.change(screen.getByLabelText('Город'), {
      target: { value: 'Sochi' },
    })
    fireEvent.change(screen.getByLabelText('Адрес'), {
      target: { value: 'Beach 1' },
    })
    fireEvent.change(screen.getByLabelText('Широта'), {
      target: { value: '43.6' },
    })
    fireEvent.change(screen.getByLabelText('Долгота'), {
      target: { value: '39.7' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Создать' }))

    await waitFor(() => {
      expect(screen.queryByDisplayValue('Aurora')).not.toBeInTheDocument()
    })

    expect(await screen.findByRole('alert')).toHaveTextContent('Отель сохранён')
  })

  it('opens confirm dialog on delete and does not delete on cancel', async () => {
    let deleteCalls = 0
    server.use(
      http.delete('*/api/v1/hotels/:hotelId', () => {
        deleteCalls += 1
        return new HttpResponse(null, { status: 204 })
      }),
    )

    renderWithProviders(<AdminHotelsPage />, {
      initialEntries: ['/admin/hotels'],
    })

    await screen.findByText('Grand Hotel')
    fireEvent.click(screen.getByRole('button', { name: 'Удалить' }))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Отменить' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(deleteCalls).toBe(0)
    expect(screen.getByText('Grand Hotel')).toBeInTheDocument()
  })

  it('deletes hotel after confirm in dialog', async () => {
    renderWithProviders(<AdminHotelsPage />, {
      initialEntries: ['/admin/hotels'],
    })

    await screen.findByText('Grand Hotel')
    fireEvent.click(screen.getByRole('button', { name: 'Удалить' }))

    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Подтвердить' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Отель удалён')
  })

  it('shows gallery and upload in edit section, not in table row', async () => {
    server.use(
      http.get('*/api/v1/hotels/:hotelId', () =>
        HttpResponse.json(
          createHotelDetail({
            id: 1,
            name: 'Grand Hotel',
            images: [
              { id: 10, url: '/media/hotels/1/a.jpg', sort_order: 0 },
            ],
          }),
        ),
      ),
    )

    renderWithProviders(<AdminHotelsPage />, {
      initialEntries: ['/admin/hotels'],
    })

    await screen.findByText('Grand Hotel')

    expect(screen.queryByAltText('Grand Hotel фото 0')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Загрузить фото' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Изменить' }))

    expect(await screen.findByAltText('Grand Hotel фото 0')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Загрузить фото' })).toBeInTheDocument()
  })
})
