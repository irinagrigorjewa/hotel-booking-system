import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { LoginRequest, RegisterRequest } from '../types/auth'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { LoginPage } from './LoginPage'

const auth = vi.hoisted(() => ({
  login: vi.fn<(credentials: LoginRequest) => Promise<void>>(),
  register: vi.fn<(credentials: RegisterRequest) => Promise<void>>(),
}))
const navigate = vi.hoisted(() => vi.fn())

vi.mock('@features/auth/ui/AuthContext', () => ({
  useAuth: () => auth,
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const router = await importOriginal<typeof import('react-router-dom')>()

  return {
    ...router,
    useNavigate: () => navigate,
  }
})

afterEach(() => {
  auth.login.mockReset()
  navigate.mockReset()
})

describe('LoginPage', () => {
  it('shows validation errors for an invalid email', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'invalid-email' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Войти' }))

    expect(await screen.findByText('Введите корректный email')).toBeInTheDocument()
    expect(auth.login).not.toHaveBeenCalled()
  })

  it('logs in and navigates to the return URL', async () => {
    auth.login.mockResolvedValue(undefined)

    render(
      <MemoryRouter initialEntries={['/login?returnUrl=%2Fprofile']}>
        <LoginPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'guest@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Пароль'), {
      target: { value: 'Secret123!' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Войти' }))

    await waitFor(() => {
      expect(auth.login).toHaveBeenCalledWith({
        email: 'guest@example.com',
        password: 'Secret123!',
      })
    })

    expect(navigate).toHaveBeenCalledWith('/profile', { replace: true })
  })

  it('shows an authentication error returned by the context', async () => {
    auth.login.mockRejectedValue(new Error('Invalid credentials'))

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'guest@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Пароль'), {
      target: { value: 'Secret123!' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Войти' }))

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument()
  })

  it('links back to the home page and to register', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'На главную' })).toHaveAttribute(
      'href',
      '/',
    )
    expect(screen.getByRole('link', { name: 'Регистрация' })).toHaveAttribute(
      'href',
      '/register',
    )
  })
})
