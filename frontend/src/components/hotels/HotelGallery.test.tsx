import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { setAppLanguage } from '@shared/i18n'
import { renderWithProviders } from '@shared/test/renderWithProviders'
import type { HotelImage } from '../../types/hotel'
import { HotelGallery } from './HotelGallery'

const images: HotelImage[] = [
  {
    id: 1,
    url: '/media/hotels/1.jpg',
    sort_order: 0,
  },
]

describe('HotelGallery', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    await setAppLanguage('ru')
  })

  it('uses Russian aria-label and alt by default', () => {
    renderWithProviders(<HotelGallery hotelName="Grand Hotel" images={images} />)

    expect(screen.getByLabelText('Галерея отеля')).toBeInTheDocument()
    expect(screen.getByAltText('Grand Hotel фото 0')).toBeInTheDocument()
  })

  it('uses English aria-label and alt when locale is en', async () => {
    await setAppLanguage('en')

    renderWithProviders(<HotelGallery hotelName="Grand Hotel" images={images} />)

    await waitFor(() => {
      expect(screen.getByLabelText('Hotel gallery')).toBeInTheDocument()
    })
    expect(screen.getByAltText('Grand Hotel photo 0')).toBeInTheDocument()
  })
})
