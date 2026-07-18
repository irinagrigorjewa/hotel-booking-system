import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { hotelHandlers, server } from '../test/server'
import { renderWithProviders } from '../test/renderWithProviders'
import { HotelsPage } from './HotelsPage'

describe('HotelsPage', () => {
  it('renders hotels and links cards to detail pages', async () => {
    renderWithProviders(<HotelsPage />, { initialEntries: ['/hotels'] })

    const title = await screen.findByRole('heading', { name: 'Grand Hotel' })
    expect(title).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Grand Hotel/i })).toHaveAttribute(
      'href',
      '/hotels/1',
    )
  })

  it('updates the city filter and resets the page in the URL', async () => {
    renderWithProviders(<HotelsPage />, {
      initialEntries: ['/hotels?page=2&city=Moscow'],
    })

    expect(await screen.findByDisplayValue('Moscow')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Город'), {
      target: { value: 'Kazan' },
    })

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Kazan Hotel' })).toBeInTheDocument()
    })
  })

  it('shows loading error retry for catalog failures', async () => {
    server.use(hotelHandlers.listError)
    renderWithProviders(<HotelsPage />, { initialEntries: ['/hotels'] })

    expect(await screen.findByText('Не удалось загрузить отели')).toBeInTheDocument()
  })
})
