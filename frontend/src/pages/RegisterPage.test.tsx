import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { LoginRequest, RegisterRequest } from '../types/auth'
import { RegisterPage } from './RegisterPage'

const auth = vi.hoisted(() => ({
  login: vi.fn<(credentials: LoginRequest) => Promise<void>>(),
  register: vi.fn<(credentials: RegisterRequest) => Promise<void>>(),
}))
const navigate = vi.hoisted(() => vi.fn())

vi.mock('../context/AuthContext', () => ({
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
  auth.register.mockReset()
  navigate.mockReset()
})

describe('RegisterPage', () => {
  it('shows a validation error when passwords do not match', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Пароль'), {
      target: { value: 'Secret123!' },
    })
    fireEvent.change(screen.getByLabelText('Подтвердите пароль'), {
      target: { value: 'Different123!' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))

    expect(await screen.findByText('Пароли должны совпадать')).toBeInTheDocument()
    expect(auth.register).not.toHaveBeenCalled()
  })

  it('registers an account and navigates home', async () => {
    auth.register.mockResolvedValue(undefined)

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Имя'), {
      target: { value: 'Иван Иванов' },
    })
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'guest@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Пароль'), {
      target: { value: 'Secret123!' },
    })
    fireEvent.change(screen.getByLabelText('Подтвердите пароль'), {
      target: { value: 'Secret123!' },
    })
    fireEvent.change(screen.getByLabelText('Телефон'), {
      target: { value: '+79001234567' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))

    await waitFor(() => {
      expect(auth.register).toHaveBeenCalledWith({
        name: 'Иван Иванов',
        email: 'guest@example.com',
        password: 'Secret123!',
        phone: '+79001234567',
      })
    })

    expect(navigate).toHaveBeenCalledWith('/', { replace: true })
  })

  it('shows a registration error returned by the context', async () => {
    auth.register.mockRejectedValue(new Error('Email already registered'))

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Имя'), {
      target: { value: 'Иван Иванов' },
    })
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'guest@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Пароль'), {
      target: { value: 'Secret123!' },
    })
    fireEvent.change(screen.getByLabelText('Подтвердите пароль'), {
      target: { value: 'Secret123!' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))

    expect(
      await screen.findByText('Email already registered'),
    ).toBeInTheDocument()
  })
})
