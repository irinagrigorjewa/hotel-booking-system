import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { hotelHandlers, roomHandlers, server } from '../test/server'
import { renderWithProviders } from '../test/renderWithProviders'
import { HotelDetailPage } from './HotelDetailPage'

const renderDetail = (path: string) =>
  renderWithProviders(
    <Routes>
      <Route path="/hotels/:id" element={<HotelDetailPage />} />
    </Routes>,
    { initialEntries: [path] },
  )

describe('HotelDetailPage', () => {
  it('renders hotel details and rooms for an existing hotel', async () => {
    renderDetail('/hotels/1')

    expect(await screen.findByRole('heading', { name: 'Grand Hotel' })).toBeInTheDocument()
    expect(screen.getByText(/Moscow/)).toBeInTheDocument()
    expect(screen.getByText('Central hotel')).toBeInTheDocument()
    expect(await screen.findByText(/Номер 301/)).toBeInTheDocument()
  })

  it('shows empty rooms state', async () => {
    server.use(roomHandlers.listEmpty)
    renderDetail('/hotels/1')

    expect(
      await screen.findByText('Подходящие номера не найдены'),
    ).toBeInTheDocument()
  })

  it('shows a not-found state for missing hotels', async () => {
    server.use(hotelHandlers.detailNotFound)
    renderDetail('/hotels/99')

    expect(await screen.findByText('Отель не найден')).toBeInTheDocument()
  })

  it('shows a retryable error state for network failures', async () => {
    server.use(hotelHandlers.detailError)
    renderDetail('/hotels/1')

    expect(await screen.findByText('Не удалось загрузить отель')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Повторить' })).toBeInTheDocument()
  })

  it('passes date filters into Book returnUrl', async () => {
    renderDetail('/hotels/1?date_from=2026-08-10&date_to=2026-08-15')

    const bookLink = await screen.findByRole('link', { name: 'Забронировать' })
    const href = bookLink.getAttribute('href') ?? ''
    expect(href).toMatch(/^\/login\?returnUrl=/)
    const returnUrl = decodeURIComponent(href.split('returnUrl=')[1] ?? '')
    expect(returnUrl).toContain('date_from=2026-08-10')
    expect(returnUrl).toContain('date_to=2026-08-15')
    expect(returnUrl).toContain('room_id=5')
  })
})

