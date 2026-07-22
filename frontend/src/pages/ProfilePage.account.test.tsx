import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

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
  applyUser: vi.fn(),
}))

vi.mock('@features/auth/ui/AuthContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@features/auth/ui/AuthContext')>()

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
      applyUser: auth.applyUser,
    }),
  }
})

describe('ProfilePage account', () => {
  it('saves name and phone via PATCH /users/me', async () => {
    const patchSpy = vi.spyOn(patchMeRequest, 'patchMe')

    renderWithProviders(<ProfilePage />, {
      initialEntries: ['/profile?tab=account'],
    })

    fireEvent.change(screen.getByLabelText('Имя'), {
      target: { value: 'Updated Client' },
    })
    fireEvent.change(screen.getByLabelText('Телефон'), {
      target: { value: '+79001112233' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }))

    await waitFor(() => {
      expect(patchSpy).toHaveBeenCalledWith({
        name: 'Updated Client',
        phone: '+79001112233',
      })
    })
    expect(auth.applyUser).toHaveBeenCalled()
  })
})
