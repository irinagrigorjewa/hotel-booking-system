import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { TokenPair } from '@entities/user/model/auth-types'
import type { User } from '@entities/user/model/types'
import { tokenStorage } from '@shared/auth/tokenStorage'
import { AuthProvider, useAuth } from './AuthContext'

const user: User = {
  id: 1,
  name: 'Ivan Ivanov',
  email: 'ivan@example.com',
  phone: null,
  role: 'CLIENT',
  created_at: '2026-07-17T00:00:00Z',
}

const tokens: TokenPair = {
  access_token: 'access-token',
  refresh_token: 'refresh-token',
  token_type: 'bearer',
}

const authApi = vi.hoisted(() => ({
  getMe: vi.fn<() => Promise<User>>(),
}))

vi.mock('@entities/user/api/requests/getMe', () => ({
  getMe: authApi.getMe,
}))
vi.mock('@entities/user/api/requests/login', () => ({
  login: vi.fn(),
}))
vi.mock('@entities/user/api/requests/logout', () => ({
  logout: vi.fn(),
}))
vi.mock('@entities/user/api/requests/register', () => ({
  register: vi.fn(),
}))

const AuthState = () => {
  const { loading, user: currentUser } = useAuth()

  if (loading) {
    return <p>Loading session</p>
  }

  return <p>{currentUser?.email ?? 'No session'}</p>
}

afterEach(() => {
  authApi.getMe.mockReset()
  window.localStorage.clear()
})

describe('AuthContext', () => {
  it('restores the user from saved tokens', async () => {
    tokenStorage.save(tokens)
    authApi.getMe.mockResolvedValue(user)

    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText(user.email)).toBeInTheDocument()
    })
  })
})
