import { within, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { setAppLanguage } from '@shared/i18n'
import { hotelHandlers, server } from '@shared/test/server'
import { renderWithProviders } from '@shared/test/renderWithProviders'
import { HomePage } from './HomePage'

describe('HomePage', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    await setAppLanguage('ru')
  })

  it('renders hero brand, headline, search CTA, and catalog CTAs', () => {
    renderWithProviders(<HomePage />)

    const hero = screen.getByRole('region', { name: 'Поиск на главной' })
    expect(within(hero).getByText('Hotel Booking System')).toBeInTheDocument()
    expect(
      within(hero).getByRole('heading', { name: 'Подберите проживание' }),
    ).toBeInTheDocument()
    expect(
      within(hero).getByText('Ищите по городу и бронируйте номера под вашу поездку.'),
    ).toBeInTheDocument()
    expect(within(hero).getByRole('button', { name: 'Найти' })).toBeInTheDocument()
    expect(within(hero).getByLabelText('Город')).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Все отели' })).toHaveAttribute('href', '/hotels')
    expect(screen.getByRole('link', { name: 'Открыть карту' })).toHaveAttribute(
      'href',
      '/hotels/map',
    )
  })

  it('navigates to hotels catalog with city from hero search', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/hotels" element={<p>Hotels catalog</p>} />
      </Routes>,
    )

    const hero = screen.getByRole('region', { name: 'Поиск на главной' })
    await user.type(within(hero).getByLabelText('Город'), 'Moscow')
    await user.click(within(hero).getByRole('button', { name: 'Найти' }))

    expect(await screen.findByText('Hotels catalog')).toBeInTheDocument()
  })

  it('loads preview hotels from GET /hotels', async () => {
    renderWithProviders(<HomePage />)

    expect(await screen.findByRole('heading', { name: 'Grand Hotel' })).toBeInTheDocument()
    expect(screen.getByText('Moscow')).toBeInTheDocument()
  })

  it('shows an empty state when no hotels are returned', async () => {
    server.use(hotelHandlers.listEmpty)
    renderWithProviders(<HomePage />)

    expect(await screen.findByText('Отели не найдены')).toBeInTheDocument()
  })

  it('shows an error with retry when the request fails', async () => {
    server.use(hotelHandlers.listError)
    renderWithProviders(<HomePage />)

    expect(await screen.findByText('Не удалось загрузить отели')).toBeInTheDocument()
    server.use(hotelHandlers.listSuccess)
    screen.getByRole('button', { name: 'Повторить' }).click()

    await waitFor(async () => {
      expect(await screen.findByRole('heading', { name: 'Grand Hotel' })).toBeInTheDocument()
    })
  })
})
