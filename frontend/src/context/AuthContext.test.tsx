import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { tokenStorage } from '../auth/tokenStorage'
import type { TokenPair, User } from '../types/auth'
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
  getCurrentUser: vi.fn<() => Promise<User>>(),
}))

vi.mock('../api/auth', () => ({
  getCurrentUser: authApi.getCurrentUser,
  login: vi.fn(),
  logout: vi.fn(),
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
  authApi.getCurrentUser.mockReset()
  window.localStorage.clear()
})

describe('AuthContext', () => {
  it('restores the user from saved tokens', async () => {
    tokenStorage.save(tokens)
    authApi.getCurrentUser.mockResolvedValue(user)

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
