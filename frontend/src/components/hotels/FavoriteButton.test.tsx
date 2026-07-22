import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as addFavoriteRequest from '@entities/favorite/api/requests/addFavorite'
import type { User } from '@entities/user/model/types'
import { renderWithProviders } from '@shared/test/renderWithProviders'
import { FavoriteButton } from './FavoriteButton'

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

vi.mock('../../context/AuthContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../context/AuthContext')>()

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
      applyUser: vi.fn(),
    }),
  }
})

describe('FavoriteButton', () => {
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

  it('shows success notification when adding a favorite', async () => {
    const addSpy = vi.spyOn(addFavoriteRequest, 'addFavorite')

    renderWithProviders(<FavoriteButton hotelId={1} isFavorite={false} />)

    fireEvent.click(screen.getByRole('button', { name: 'В избранное' }))

    await waitFor(() => {
      expect(addSpy).toHaveBeenCalledWith(1)
    })

    expect(await screen.findByRole('alert')).toHaveTextContent('Добавлено в избранное')
  })

  it('shows error notification when toggle fails', async () => {
    vi.spyOn(addFavoriteRequest, 'addFavorite').mockRejectedValueOnce({
      response: { data: {} },
    })

    renderWithProviders(<FavoriteButton hotelId={1} isFavorite={false} />)

    fireEvent.click(screen.getByRole('button', { name: 'В избранное' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось обновить избранное')
  })
})
