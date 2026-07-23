import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { setAppLanguage } from '@shared/i18n'
import { createHotelListItem } from '@shared/test/hotelFixtures'
import { renderWithProviders } from '@shared/test/renderWithProviders'
import { HotelCard } from './HotelCard'

describe('HotelCard', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    await setAppLanguage('ru')
  })

  it('shows a no-photo placeholder when cover_image is missing', () => {
    renderWithProviders(<HotelCard hotel={createHotelListItem({ cover_image: null })} />)

    expect(screen.getByLabelText('Нет фото')).toBeInTheDocument()
    expect(screen.getByText('Нет фото')).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: 'Grand Hotel' })).not.toBeInTheDocument()
  })

  it('renders cover image via mediaUrl when cover_image is set', () => {
    renderWithProviders(
      <HotelCard hotel={createHotelListItem({ cover_image: '/media/hotels/cover.jpg' })} />,
    )

    expect(screen.getByRole('img', { name: 'Grand Hotel' })).toHaveAttribute(
      'src',
      '/media/hotels/cover.jpg',
    )
    expect(screen.queryByText('Нет фото')).not.toBeInTheDocument()
  })

  it('surfaces min_price first and omits address clutter', () => {
    renderWithProviders(
      <HotelCard
        hotel={createHotelListItem({
          address: 'Tverskaya 1',
          description: 'Central hotel with a long description that should not appear',
          min_price: '4500',
        })}
      />,
    )

    expect(screen.getByText('от 4500 ₽')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Grand Hotel' })).toBeInTheDocument()
    expect(screen.getByText('Moscow')).toBeInTheDocument()
    expect(screen.queryByText('Tverskaya 1')).not.toBeInTheDocument()
    expect(screen.queryByText(/Central hotel/)).not.toBeInTheDocument()
  })

  it('hides price row when min_price is null', () => {
    renderWithProviders(<HotelCard hotel={createHotelListItem({ min_price: null })} />)

    expect(screen.queryByText(/от /)).not.toBeInTheDocument()
  })
})
