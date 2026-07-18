import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { hotelHandlers, server } from '../test/server'
import { renderWithProviders } from '../test/renderWithProviders'
import { HomePage } from './HomePage'

describe('HomePage', () => {
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
