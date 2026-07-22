import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { User } from '../types/auth'
import { favoriteHandlers, server } from '@shared/test/server'
import { renderWithProviders } from '@shared/test/renderWithProviders'
import { FavoritesPage } from './FavoritesPage'

vi.mock('../context/AuthContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../context/AuthContext')>()
  const user: User = {
    id: 2,
    name: 'Client User',
    email: 'client@example.com',
    phone: null,
    role: 'CLIENT',
    created_at: '2026-07-17T00:00:00Z',
  }

  return {
    ...actual,
    useAuth: () => ({
      user,
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

describe('FavoritesPage', () => {
  it('lists favorite hotels', async () => {
    renderWithProviders(<FavoritesPage />, { initialEntries: ['/favorites'] })

    expect(await screen.findByRole('heading', { name: 'Избранное' })).toBeInTheDocument()
    expect(await screen.findByText('Grand Hotel')).toBeInTheDocument()
  })

  it('shows empty state', async () => {
    server.use(favoriteHandlers.listEmpty)
    renderWithProviders(<FavoritesPage />, { initialEntries: ['/favorites'] })

    expect(await screen.findByText('В избранном пока пусто')).toBeInTheDocument()
  })
})
