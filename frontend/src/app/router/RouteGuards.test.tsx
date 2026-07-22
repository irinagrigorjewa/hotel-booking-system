import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { User } from '../../types/auth'
import { AppRoutes } from './AppRoutes'
import { GuestOnly } from './GuestOnly'
import { RequireAdmin } from './RequireAdmin'
import { RequireAuth } from './RequireAuth'

const auth = vi.hoisted(() => ({
  loading: false,
  user: null as User | null,
}))

vi.mock('@features/auth/ui/AuthContext', () => ({
  useAuth: () => auth,
}))

const client: User = {
  id: 1,
  name: 'Client User',
  email: 'client@example.com',
  phone: null,
  role: 'CLIENT',
  created_at: '2026-07-17T00:00:00Z',
}

const admin: User = {
  ...client,
  id: 2,
  email: 'admin@example.com',
  role: 'ADMIN',
}

const LocationDisplay = () => {
  const location = useLocation()

  return <p data-testid="location">{`${location.pathname}${location.search}`}</p>
}

afterEach(() => {
  auth.loading = false
  auth.user = null
})

describe('route guards', () => {
  it('redirects unauthenticated users to login with the requested URL', () => {
    render(
      <MemoryRouter initialEntries={['/profile?tab=bookings']}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/profile" element={<p>Profile</p>} />
          </Route>
          <Route path="/login" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/login?returnUrl=%2Fprofile%3Ftab%3Dbookings',
    )
    expect(screen.queryByText('Profile')).not.toBeInTheDocument()
  })

  it('allows authenticated users to open protected routes', () => {
    auth.user = client

    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/profile" element={<p>Profile</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Profile')).toBeInTheDocument()
  })

  it('redirects authenticated users away from guest-only routes', () => {
    auth.user = client

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<GuestOnly />}>
            <Route path="/login" element={<p>Login</p>} />
          </Route>
          <Route path="/" element={<p>Home</p>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.queryByText('Login')).not.toBeInTheDocument()
  })

  it('redirects a client from an admin route to home', () => {
    auth.user = client

    render(
      <MemoryRouter initialEntries={['/admin/users']}>
        <Routes>
          <Route element={<RequireAdmin />}>
            <Route path="/admin/users" element={<p>Admin users</p>} />
          </Route>
          <Route path="/" element={<p>Home</p>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.queryByText('Admin users')).not.toBeInTheDocument()
  })

  it('allows an admin to open admin routes', () => {
    auth.user = admin

    render(
      <MemoryRouter initialEntries={['/admin/users']}>
        <Routes>
          <Route element={<RequireAdmin />}>
            <Route path="/admin/users" element={<p>Admin users</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Admin users')).toBeInTheDocument()
  })

  it('applies the auth guard to profile routes', () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Вход' })).toBeInTheDocument()
  })
})
