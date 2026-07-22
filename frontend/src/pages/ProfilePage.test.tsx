import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as cancelBookingRequest from '@entities/booking/api/requests/cancelBooking'
import * as patchMeRequest from '@entities/user/api/requests/patchMe'
import type { User } from '@entities/user/model/types'
import { renderWithProviders } from '@shared/test/renderWithProviders'
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
    const cancelSpy = vi.spyOn(cancelBookingRequest, 'cancelBooking')

    renderWithProviders(<ProfilePage />, {
      initialEntries: ['/profile?tab=bookings'],
    })

    expect(await screen.findByText('Grand Hotel')).toBeInTheDocument()
    expect(screen.getByText('Подтверждено')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Отменить' }))

    await waitFor(() => {
      expect(cancelSpy).toHaveBeenCalledWith(100)
    })

    expect(await screen.findByRole('alert')).toHaveTextContent('Бронирование отменено')
  })

  it('saves profile and shows success notification', async () => {
    const patchSpy = vi.spyOn(patchMeRequest, 'patchMe')

    renderWithProviders(<ProfilePage />, {
      initialEntries: ['/profile?tab=account'],
    })

    fireEvent.change(screen.getByLabelText('Имя'), {
      target: { value: 'Updated Client' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }))

    await waitFor(() => {
      expect(patchSpy).toHaveBeenCalledWith({
        name: 'Updated Client',
        phone: null,
      })
    })

    expect(await screen.findByRole('alert')).toHaveTextContent('Профиль сохранён')
  })
})
