import { within, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { setAppLanguage } from '@shared/i18n'
import { hotelHandlers, server } from '@shared/test/server'
import { renderWithProviders } from '@shared/test/renderWithProviders'
import { HotelsMapPage } from './HotelsMapPage'

describe('HotelsMapPage', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    await setAppLanguage('ru')
  })

  it('renders map markers from API', async () => {
    renderWithProviders(<HotelsMapPage />, { initialEntries: ['/hotels/map'] })

    expect(await screen.findByRole('heading', { name: 'Карта отелей' })).toBeInTheDocument()
    expect(await screen.findByTestId('hotels-map')).toBeInTheDocument()
    expect(screen.getAllByText('Grand Hotel').length).toBeGreaterThan(0)
  })

  it('renders list+map split with hotel links beside the map', async () => {
    renderWithProviders(<HotelsMapPage />, { initialEntries: ['/hotels/map'] })

    expect(await screen.findByTestId('hotels-map')).toBeInTheDocument()

    const sideList = screen.getByRole('complementary', {
      hidden: true,
      name: 'Отели на карте',
    })
    expect(within(sideList).getByText('Отелей: 1')).toBeInTheDocument()
    expect(
      within(sideList).getByRole('link', { hidden: true, name: /Grand Hotel/ }),
    ).toHaveAttribute('href', '/hotels/1')
  })

  it('shows empty state when no hotels', async () => {
    server.use(hotelHandlers.mapEmpty)
    renderWithProviders(<HotelsMapPage />, { initialEntries: ['/hotels/map'] })

    expect(
      await screen.findByText('Нет отелей для отображения на карте'),
    ).toBeInTheDocument()
  })
})
