import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@shared/test/renderWithProviders'
import { server } from '@shared/test/server'
import { AdminRoomImageGallery } from './AdminRoomImageGallery'

const roomWithImages = {
  id: 5,
  hotel_id: 1,
  room_type_id: 1,
  number: '301',
  price: '5500.00',
  capacity: 2,
  description: 'City view',
  status: 'AVAILABLE' as const,
  room_type: { id: 1, name: 'Standard' },
  hotel: { id: 1, name: 'Grand Hotel', city: 'Moscow' },
  images: [
    { id: 20, url: '/media/rooms/5/a.jpg', sort_order: 0 },
    { id: 21, url: '/media/rooms/5/b.jpg', sort_order: 1 },
  ],
}

describe('AdminRoomImageGallery', () => {
  it('renders a grid of room photo previews', async () => {
    server.use(
      http.get('*/api/v1/rooms/:roomId', () => HttpResponse.json(roomWithImages)),
    )

    renderWithProviders(<AdminRoomImageGallery roomId={5} />)

    expect(await screen.findByAltText('Номер 301 фото 0')).toBeInTheDocument()
    expect(screen.getByAltText('Номер 301 фото 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Фото номера')).toBeInTheDocument()
  })

  it('opens confirm dialog and removes photo after confirm', async () => {
    let remaining = [...roomWithImages.images]

    server.use(
      http.get('*/api/v1/rooms/:roomId', () =>
        HttpResponse.json({
          ...roomWithImages,
          images: remaining,
        }),
      ),
      http.delete('*/api/v1/images/:imageId', ({ params }) => {
        const imageId = Number(params.imageId)
        remaining = remaining.filter((image) => image.id !== imageId)
        return new HttpResponse(null, { status: 204 })
      }),
    )

    renderWithProviders(<AdminRoomImageGallery roomId={5} />)

    expect(await screen.findByAltText('Номер 301 фото 0')).toBeInTheDocument()

    const firstThumb = screen.getByAltText('Номер 301 фото 0').closest('div')
    expect(firstThumb).not.toBeNull()
    fireEvent.click(
      within(firstThumb as HTMLElement).getByRole('button', { name: 'Удалить' }),
    )

    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Подтвердить' }))

    await waitFor(() => {
      expect(screen.queryByAltText('Номер 301 фото 0')).not.toBeInTheDocument()
    })
    expect(screen.getByAltText('Номер 301 фото 1')).toBeInTheDocument()
    expect(await screen.findByRole('alert')).toHaveTextContent('Фото удалено')
  })

  it('does not delete when confirm dialog is cancelled', async () => {
    let deleteCalls = 0

    server.use(
      http.get('*/api/v1/rooms/:roomId', () => HttpResponse.json(roomWithImages)),
      http.delete('*/api/v1/images/:imageId', () => {
        deleteCalls += 1
        return new HttpResponse(null, { status: 204 })
      }),
    )

    renderWithProviders(<AdminRoomImageGallery roomId={5} />)

    expect(await screen.findByAltText('Номер 301 фото 0')).toBeInTheDocument()

    const firstThumb = screen.getByAltText('Номер 301 фото 0').closest('div')
    fireEvent.click(
      within(firstThumb as HTMLElement).getByRole('button', { name: 'Удалить' }),
    )

    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Отменить' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(deleteCalls).toBe(0)
    expect(screen.getByAltText('Номер 301 фото 0')).toBeInTheDocument()
  })

  it('shows toast on 404 delete error via notifyApiError', async () => {
    server.use(
      http.get('*/api/v1/rooms/:roomId', () => HttpResponse.json(roomWithImages)),
      http.delete('*/api/v1/images/:imageId', () =>
        HttpResponse.json({ detail: 'Image not found' }, { status: 404 }),
      ),
    )

    renderWithProviders(<AdminRoomImageGallery roomId={5} />)

    expect(await screen.findByAltText('Номер 301 фото 0')).toBeInTheDocument()

    const firstThumb = screen.getByAltText('Номер 301 фото 0').closest('div')
    fireEvent.click(
      within(firstThumb as HTMLElement).getByRole('button', { name: 'Удалить' }),
    )

    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Подтвердить' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Фото не найдено')
  })

  it('reorders photos via left/right buttons and PATCHes sort_order', async () => {
    let images = [
      { id: 20, url: '/media/rooms/5/a.jpg', sort_order: 0 },
      { id: 21, url: '/media/rooms/5/b.jpg', sort_order: 1 },
    ]
    const patches: Array<{ id: number; sort_order: number }> = []

    server.use(
      http.get('*/api/v1/rooms/:roomId', () => {
        const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order)
        return HttpResponse.json({
          ...roomWithImages,
          images: sorted,
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
          entity_type: 'ROOM',
          entity_id: 5,
        })
      }),
    )

    renderWithProviders(<AdminRoomImageGallery roomId={5} />)

    expect(await screen.findByAltText('Номер 301 фото 0')).toBeInTheDocument()

    const secondThumb = screen.getByAltText('Номер 301 фото 1').closest('div')
    expect(secondThumb).not.toBeNull()
    fireEvent.click(
      within(secondThumb as HTMLElement).getByRole('button', {
        name: 'Переместить влево',
      }),
    )

    await waitFor(() => {
      expect(patches).toEqual(
        expect.arrayContaining([
          { id: 21, sort_order: 0 },
          { id: 20, sort_order: 1 },
        ]),
      )
    })

    await waitFor(() => {
      const gallery = screen.getByLabelText('Фото номера')
      const alts = within(gallery)
        .getAllByRole('img')
        .map((img) => img.getAttribute('alt'))
      expect(alts[0]).toBe('Номер 301 фото 0')
      expect(screen.getByAltText('Номер 301 фото 0')).toHaveAttribute(
        'src',
        expect.stringContaining('b.jpg'),
      )
    })
  })
})
