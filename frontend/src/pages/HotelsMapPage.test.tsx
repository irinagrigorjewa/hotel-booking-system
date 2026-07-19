import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { hotelHandlers, server } from '../test/server'
import { renderWithProviders } from '../test/renderWithProviders'
import { HotelsMapPage } from './HotelsMapPage'

describe('HotelsMapPage', () => {
  it('renders map markers from API', async () => {
    renderWithProviders(<HotelsMapPage />, { initialEntries: ['/hotels/map'] })

    expect(await screen.findByRole('heading', { name: 'Карта отелей' })).toBeInTheDocument()
    expect(await screen.findByTestId('hotels-map')).toBeInTheDocument()
    expect(await screen.findByText('Grand Hotel')).toBeInTheDocument()
  })

  it('shows empty state when no hotels', async () => {
    server.use(hotelHandlers.mapEmpty)
    renderWithProviders(<HotelsMapPage />, { initialEntries: ['/hotels/map'] })

    expect(
      await screen.findByText('Нет отелей для отображения на карте'),
    ).toBeInTheDocument()
  })
})
