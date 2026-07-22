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
})
