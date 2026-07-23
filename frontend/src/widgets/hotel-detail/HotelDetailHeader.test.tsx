import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { setAppLanguage } from '@shared/i18n'
import { createHotelDetail } from '@shared/test/hotelFixtures'
import { renderWithProviders } from '@shared/test/renderWithProviders'
import { HotelDetailHeader } from './HotelDetailHeader'

describe('HotelDetailHeader', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    await setAppLanguage('ru')
  })

  it('renders hotel title, location and rating summary', () => {
    renderWithProviders(
      <HotelDetailHeader
        hotel={createHotelDetail({
          avg_rating: 4.5,
          city: 'Moscow',
          name: 'Grand Hotel',
          reviews_count: 10,
        })}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Grand Hotel' })).toBeInTheDocument()
    expect(screen.getByText(/Moscow/)).toBeInTheDocument()
    expect(screen.getByText(/отзывы 4\.5 \(10\)/)).toBeInTheDocument()
  })
})
