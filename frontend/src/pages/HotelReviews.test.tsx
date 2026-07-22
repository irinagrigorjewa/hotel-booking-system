import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as createReviewRequest from '@entities/review/api/requests/createReview'
import type { User } from '@entities/user/model/types'
import { renderWithProviders } from '@shared/test/renderWithProviders'
import { HotelReviews } from '../components/hotels/HotelReviews'

const auth = vi.hoisted(() => ({
  user: {
    id: 2,
    name: 'Client User',
    email: 'client@example.com',
    phone: null,
    role: 'CLIENT',
    created_at: '2026-07-17T00:00:00Z',
  } as User | null,
}))

vi.mock('../context/AuthContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../context/AuthContext')>()

  return {
    ...actual,
    useAuth: () => ({
      user: auth.user,
      tokens: null,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      restoreSession: vi.fn(),
    }),
  }
})

describe('HotelReviews', () => {
  beforeEach(() => {
    auth.user = {
      id: 2,
      name: 'Client User',
      email: 'client@example.com',
      phone: null,
      role: 'CLIENT',
      created_at: '2026-07-17T00:00:00Z',
    }
  })

  it('lists reviews and creates a new one', async () => {
    const createSpy = vi.spyOn(createReviewRequest, 'createReview')

    renderWithProviders(<HotelReviews hotelId={1} />)

    expect(await screen.findByText('Отличный отель, чисто и тихо.')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Комментарий'), {
      target: { value: 'Очень понравилось проживание здесь.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Отправить' }))

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith(1, {
        rating: 5,
        comment: 'Очень понравилось проживание здесь.',
      })
    })
  })

  it('prompts guests to log in', async () => {
    auth.user = null
    renderWithProviders(<HotelReviews hotelId={1} />)

    expect(await screen.findByText(/чтобы оставить отзыв/)).toBeInTheDocument()
  })
})
