import { fireEvent, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { AdminHotelImageGallery } from '@features/admin-hotel/ui/AdminHotelImageGallery'
import { createHotelDetail } from '@shared/test/hotelFixtures'
import { renderWithProviders } from '@shared/test/renderWithProviders'
import { server } from '@shared/test/server'
import { HotelImageUpload } from './HotelImageUpload'

const selectFile = (file: File): void => {
  const input = document.querySelector('input[type="file"]')
  expect(input).not.toBeNull()
  fireEvent.change(input as HTMLInputElement, { target: { files: [file] } })
}

describe('HotelImageUpload', () => {
  it('rejects non-image file with toast and does not call upload API', async () => {
    let uploadCalls = 0

    server.use(
      http.post('*/api/v1/hotels/:hotelId/images', () => {
        uploadCalls += 1
        return HttpResponse.json({ detail: 'unexpected' }, { status: 500 })
      }),
    )

    renderWithProviders(<HotelImageUpload hotelId={1} imagesCount={0} />)

    selectFile(new File(['hello'], 'notes.txt', { type: 'text/plain' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Допустимы только JPEG, PNG или WebP',
    )
    expect(uploadCalls).toBe(0)
  })

  it('rejects file larger than 5MB with toast and does not call upload API', async () => {
    let uploadCalls = 0

    server.use(
      http.post('*/api/v1/hotels/:hotelId/images', () => {
        uploadCalls += 1
        return HttpResponse.json({ detail: 'unexpected' }, { status: 500 })
      }),
    )

    renderWithProviders(<HotelImageUpload hotelId={1} imagesCount={0} />)

    const oversized = new File(
      [new Uint8Array(5 * 1024 * 1024 + 1)],
      'big.jpg',
      { type: 'image/jpeg' },
    )
    selectFile(oversized)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Размер файла не должен превышать 5 МБ',
    )
    expect(uploadCalls).toBe(0)
  })

  it('disables upload when imagesCount is 10 and shows limit message', () => {
    renderWithProviders(<HotelImageUpload hotelId={1} imagesCount={10} />)

    expect(screen.getByRole('button', { name: 'Загрузить фото' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    expect(
      screen.getByText('Можно загрузить не более 10 фото'),
    ).toBeInTheDocument()
  })

  it('uploads valid image, shows success toast, and refreshes gallery preview', async () => {
    const hotel = createHotelDetail({
      id: 1,
      name: 'Grand Hotel',
      images: [],
      cover_image: null,
    })
    let images = [...hotel.images]

    server.use(
      http.get('*/api/v1/hotels/:hotelId', () =>
        HttpResponse.json({
          ...hotel,
          images,
          cover_image: images[0]?.url ?? null,
        }),
      ),
      http.post('*/api/v1/hotels/:hotelId/images', async () => {
        const uploaded = {
          id: 42,
          url: '/media/hotels/1/new.jpg',
          sort_order: 0,
          entity_type: 'HOTEL',
          entity_id: 1,
        }
        images = [
          { id: uploaded.id, url: uploaded.url, sort_order: uploaded.sort_order },
        ]
        return HttpResponse.json(uploaded, { status: 201 })
      }),
    )

    renderWithProviders(
      <>
        <AdminHotelImageGallery hotelId={1} />
        <HotelImageUpload hotelId={1} imagesCount={images.length} />
      </>,
    )

    expect(await screen.findByText('Фотографии ещё не загружены')).toBeInTheDocument()

    selectFile(
      new File([new Uint8Array([1, 2, 3])], 'photo.jpg', { type: 'image/jpeg' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent('Фото загружено')
    expect(await screen.findByAltText('Grand Hotel фото 0')).toBeInTheDocument()
  })

  it('shows i18n toast for 409 image limit from API', async () => {
    server.use(
      http.post('*/api/v1/hotels/:hotelId/images', () =>
        HttpResponse.json(
          { detail: 'Maximum number of images reached' },
          { status: 409 },
        ),
      ),
    )

    renderWithProviders(<HotelImageUpload hotelId={1} imagesCount={9} />)

    selectFile(
      new File([new Uint8Array([1, 2, 3])], 'photo.jpg', { type: 'image/jpeg' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Достигнут лимит в 10 фото',
    )
  })

  it('shows i18n toast for 413 file too large from API', async () => {
    server.use(
      http.post('*/api/v1/hotels/:hotelId/images', () =>
        HttpResponse.json({ detail: 'File too large' }, { status: 413 }),
      ),
    )

    renderWithProviders(<HotelImageUpload hotelId={1} imagesCount={0} />)

    selectFile(
      new File([new Uint8Array([1, 2, 3])], 'photo.jpg', { type: 'image/jpeg' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Файл слишком большой',
    )
  })

  it('shows i18n toast for 415 unsupported media type from API', async () => {
    server.use(
      http.post('*/api/v1/hotels/:hotelId/images', () =>
        HttpResponse.json(
          { detail: 'Unsupported media type' },
          { status: 415 },
        ),
      ),
    )

    renderWithProviders(<HotelImageUpload hotelId={1} imagesCount={0} />)

    selectFile(
      new File([new Uint8Array([1, 2, 3])], 'photo.jpg', { type: 'image/jpeg' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Неподдерживаемый тип файла',
    )
  })

  it('shows loading label while upload is in progress', async () => {
    let resolveUpload: ((value: Response) => void) | undefined

    server.use(
      http.post('*/api/v1/hotels/:hotelId/images', async () => {
        await new Promise<Response>((resolve) => {
          resolveUpload = resolve
        })
        return HttpResponse.json(
          {
            id: 1,
            url: '/media/hotels/1/a.jpg',
            sort_order: 0,
            entity_type: 'HOTEL',
            entity_id: 1,
          },
          { status: 201 },
        )
      }),
    )

    renderWithProviders(<HotelImageUpload hotelId={1} imagesCount={0} />)

    selectFile(
      new File([new Uint8Array([1, 2, 3])], 'photo.jpg', { type: 'image/jpeg' }),
    )

    const loadingButton = await screen.findByRole('button', { name: 'Загрузка…' })
    expect(loadingButton).toHaveAttribute('aria-disabled', 'true')

    resolveUpload?.(new Response())
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Загрузить фото' }),
      ).not.toHaveAttribute('aria-disabled', 'true')
    })
  })
})
