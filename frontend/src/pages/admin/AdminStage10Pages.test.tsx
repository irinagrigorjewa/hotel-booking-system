import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import * as updateBookingStatusRequest from '@entities/booking/api/requests/updateBookingStatus'
import * as patchUserRequest from '@entities/user/api/requests/patchUser'
import type { User } from '@entities/user/model/types'
import { renderWithProviders } from '@shared/test/renderWithProviders'
import { AdminBookingsPage } from '@pages/admin/bookings/ui/AdminBookingsPage'
import { AdminHomePage } from '@pages/admin/home/ui/AdminHomePage'
import { AdminUsersPage } from '@pages/admin/users/ui/AdminUsersPage'

const auth = vi.hoisted(() => ({
  user: {
    id: 1,
    name: 'Admin',
    email: 'admin@example.com',
    phone: null,
    role: 'ADMIN',
    created_at: '2026-07-01T00:00:00Z',
  } as User,
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
      applyUser: vi.fn(),
    }),
  }
})

describe('AdminHomePage', () => {
  it('links to admin sections', () => {
    renderWithProviders(<AdminHomePage />, { initialEntries: ['/admin'] })

    expect(screen.getByRole('heading', { name: 'Админ-панель' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Пользователи' })).toHaveAttribute(
      'href',
      '/admin/users',
    )
    expect(screen.getByRole('link', { name: 'Бронирования' })).toHaveAttribute(
      'href',
      '/admin/bookings',
    )
  })
})

describe('AdminUsersPage', () => {
  it('lists users and changes a client role', async () => {
    const patchSpy = vi.spyOn(patchUserRequest, 'patchUser')

    renderWithProviders(<AdminUsersPage />, { initialEntries: ['/admin/users'] })

    expect(await screen.findByText('client@example.com')).toBeInTheDocument()

    const roleSelects = screen.getAllByLabelText('Роль')
    fireEvent.mouseDown(roleSelects[1])
    fireEvent.click(await screen.findByRole('option', { name: 'Админ' }))

    await waitFor(() => {
      expect(patchSpy).toHaveBeenCalledWith(2, { role: 'ADMIN' })
    })

    expect(await screen.findByRole('alert')).toHaveTextContent('Роль обновлена')
  })
})

describe('AdminBookingsPage', () => {
  it('lists all bookings for admin', async () => {
    renderWithProviders(<AdminBookingsPage />, {
      initialEntries: ['/admin/bookings'],
    })

    expect(await screen.findByText('client@example.com')).toBeInTheDocument()
    expect(screen.getByText(/Grand Hotel/)).toBeInTheDocument()
  })

  it('offers only allowed status transitions for CONFIRMED', async () => {
    renderWithProviders(<AdminBookingsPage />, {
      initialEntries: ['/admin/bookings'],
    })

    await screen.findByText('client@example.com')

    const comboboxes = screen.getAllByRole('combobox')
    const statusSelect = comboboxes[comboboxes.length - 1]
    expect(statusSelect).toHaveTextContent('Подтверждено')
    fireEvent.mouseDown(statusSelect)

    const options = await screen.findAllByRole('option')
    const labels = options.map((option) => option.textContent)

    expect(labels).toEqual(['Подтверждено', 'Отменено', 'Завершено'])
    expect(screen.queryByRole('option', { name: 'Ожидает' })).not.toBeInTheDocument()
  })

  it('updates booking status and shows success notification', async () => {
    const updateSpy = vi.spyOn(updateBookingStatusRequest, 'updateBookingStatus')

    renderWithProviders(<AdminBookingsPage />, {
      initialEntries: ['/admin/bookings'],
    })

    await screen.findByText('client@example.com')

    const comboboxes = screen.getAllByRole('combobox')
    const statusSelect = comboboxes[comboboxes.length - 1]
    fireEvent.mouseDown(statusSelect)
    fireEvent.click(await screen.findByRole('option', { name: 'Завершено' }))

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalled()
    })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Статус бронирования обновлён',
    )
  })
})

