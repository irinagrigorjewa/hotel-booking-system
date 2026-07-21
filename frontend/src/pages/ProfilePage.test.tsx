import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { bookingsApi } from '../api/bookings'
import type { User } from '../types/auth'
import { renderWithProviders } from '../test/renderWithProviders'
import { ProfilePage } from './ProfilePage'

const auth = vi.hoisted(() => ({
  user: {
    id: 2,
    name: 'Client User',
    email: 'client@example.com',
    phone: null,
    role: 'CLIENT',
    created_at: '2026-07-17T00:00:00Z',
  } as User,
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
      applyUser: vi.fn(),
    }),
  }
})

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  it('lists bookings and cancels a confirmed one', async () => {
    const cancelSpy = vi.spyOn(bookingsApi, 'cancel')

    renderWithProviders(<ProfilePage />, {
      initialEntries: ['/profile?tab=bookings'],
    })

    expect(await screen.findByText('Grand Hotel')).toBeInTheDocument()
    expect(screen.getByText('Подтверждено')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Отменить' }))

    await waitFor(() => {
      expect(cancelSpy).toHaveBeenCalledWith(100)
    })
  })
})
