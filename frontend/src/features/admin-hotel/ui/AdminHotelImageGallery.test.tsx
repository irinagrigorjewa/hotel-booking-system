import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { createHotelDetail } from '@shared/test/hotelFixtures'
import { renderWithProviders } from '@shared/test/renderWithProviders'
import { server } from '@shared/test/server'
import { AdminHotelImageGallery } from './AdminHotelImageGallery'

const hotelWithImages = createHotelDetail({
  id: 1,
  name: 'Grand Hotel',
  images: [
    { id: 10, url: '/media/hotels/1/a.jpg', sort_order: 0 },
    { id: 11, url: '/media/hotels/1/b.jpg', sort_order: 1 },
  ],
  cover_image: '/media/hotels/1/a.jpg',
})

describe('AdminHotelImageGallery', () => {
  it('renders a grid of hotel photo previews', async () => {
    server.use(
      http.get('*/api/v1/hotels/:hotelId', () =>
        HttpResponse.json(hotelWithImages),
      ),
    )

    renderWithProviders(<AdminHotelImageGallery hotelId={1} />)

    expect(await screen.findByAltText('Grand Hotel фото 0')).toBeInTheDocument()
    expect(screen.getByAltText('Grand Hotel фото 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Фото отеля')).toBeInTheDocument()
  })

  it('opens confirm dialog and removes photo after confirm', async () => {
    let remaining = [...hotelWithImages.images]

    server.use(
      http.get('*/api/v1/hotels/:hotelId', () =>
        HttpResponse.json({
          ...hotelWithImages,
          images: remaining,
          cover_image: remaining[0]?.url ?? null,
        }),
      ),
      http.delete('*/api/v1/images/:imageId', ({ params }) => {
        const imageId = Number(params.imageId)
        remaining = remaining.filter((image) => image.id !== imageId)
        return new HttpResponse(null, { status: 204 })
      }),
    )

    renderWithProviders(<AdminHotelImageGallery hotelId={1} />)

    expect(await screen.findByAltText('Grand Hotel фото 0')).toBeInTheDocument()

    const firstThumb = screen.getByAltText('Grand Hotel фото 0').closest('div')
    expect(firstThumb).not.toBeNull()
    fireEvent.click(
      within(firstThumb as HTMLElement).getByRole('button', { name: 'Удалить' }),
    )

    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Подтвердить' }))

    await waitFor(() => {
      expect(screen.queryByAltText('Grand Hotel фото 0')).not.toBeInTheDocument()
    })
    expect(screen.getByAltText('Grand Hotel фото 1')).toBeInTheDocument()
    expect(await screen.findByRole('alert')).toHaveTextContent('Фото удалено')
  })

  it('does not delete when confirm dialog is cancelled', async () => {
    let deleteCalls = 0

    server.use(
      http.get('*/api/v1/hotels/:hotelId', () =>
        HttpResponse.json(hotelWithImages),
      ),
      http.delete('*/api/v1/images/:imageId', () => {
        deleteCalls += 1
        return new HttpResponse(null, { status: 204 })
      }),
    )

    renderWithProviders(<AdminHotelImageGallery hotelId={1} />)

    expect(await screen.findByAltText('Grand Hotel фото 0')).toBeInTheDocument()

    const firstThumb = screen.getByAltText('Grand Hotel фото 0').closest('div')
    fireEvent.click(
      within(firstThumb as HTMLElement).getByRole('button', { name: 'Удалить' }),
    )

    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Отменить' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(deleteCalls).toBe(0)
    expect(screen.getByAltText('Grand Hotel фото 0')).toBeInTheDocument()
  })

  it('shows toast on 404 delete error via notifyApiError', async () => {
    server.use(
      http.get('*/api/v1/hotels/:hotelId', () =>
        HttpResponse.json(hotelWithImages),
      ),
      http.delete('*/api/v1/images/:imageId', () =>
        HttpResponse.json({ detail: 'Image not found' }, { status: 404 }),
      ),
    )

    renderWithProviders(<AdminHotelImageGallery hotelId={1} />)

    expect(await screen.findByAltText('Grand Hotel фото 0')).toBeInTheDocument()

    const firstThumb = screen.getByAltText('Grand Hotel фото 0').closest('div')
    fireEvent.click(
      within(firstThumb as HTMLElement).getByRole('button', { name: 'Удалить' }),
    )

    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Подтвердить' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Фото не найдено')
  })

  it('reorders photos via left/right buttons and PATCHes sort_order', async () => {
    let images = [
      { id: 10, url: '/media/hotels/1/a.jpg', sort_order: 0 },
      { id: 11, url: '/media/hotels/1/b.jpg', sort_order: 1 },
    ]
    const patches: Array<{ id: number; sort_order: number }> = []

    server.use(
      http.get('*/api/v1/hotels/:hotelId', () => {
        const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order)
        return HttpResponse.json({
          ...hotelWithImages,
          images: sorted,
          cover_image: sorted[0]?.url ?? null,
        })
      }),
      http.patch('*/api/v1/images/:imageId', async ({ params, request }) => {
        const imageId = Number(params.imageId)
        const body = (await request.json()) as { sort_order: number }
        patches.push({ id: imageId, sort_order: body.sort_order })
        images = images.map((image) =>
          image.id === imageId ? { ...image, sort_order: body.sort_order } : image,
        )
        const updated = images.find((image) => image.id === imageId)
        return HttpResponse.json({
          id: imageId,
          url: updated?.url ?? '',
          sort_order: body.sort_order,
          entity_type: 'HOTEL',
          entity_id: 1,
        })
      }),
    )

    renderWithProviders(<AdminHotelImageGallery hotelId={1} />)

    expect(await screen.findByAltText('Grand Hotel фото 0')).toBeInTheDocument()
    expect(screen.getByText('Первое фото — обложка')).toBeInTheDocument()

    const secondThumb = screen.getByAltText('Grand Hotel фото 1').closest('div')
    expect(secondThumb).not.toBeNull()
    fireEvent.click(
      within(secondThumb as HTMLElement).getByRole('button', {
        name: 'Переместить влево',
      }),
    )

    await waitFor(() => {
      expect(patches).toEqual(
        expect.arrayContaining([
          { id: 11, sort_order: 0 },
          { id: 10, sort_order: 1 },
        ]),
      )
    })

    await waitFor(() => {
      const gallery = screen.getByLabelText('Фото отеля')
      const alts = within(gallery)
        .getAllByRole('img')
        .map((img) => img.getAttribute('alt'))
      expect(alts[0]).toBe('Grand Hotel фото 0')
      expect(screen.getByAltText('Grand Hotel фото 0')).toHaveAttribute(
        'src',
        expect.stringContaining('b.jpg'),
      )
    })
  })
})
