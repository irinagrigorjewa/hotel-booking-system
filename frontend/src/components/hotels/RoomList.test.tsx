import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { User } from '../../types/auth'
import type { Room } from '../../types/room'
import { renderWithProviders } from '../../test/renderWithProviders'
import { RoomList } from './RoomList'

const auth = vi.hoisted(() => ({
  user: null as User | null,
}))

vi.mock('../../context/AuthContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../context/AuthContext')>()

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

const sampleRoom: Room = {
  id: 5,
  hotel_id: 1,
  room_type_id: 1,
  number: '301',
  price: '5500.00',
  capacity: 2,
  description: null,
  status: 'AVAILABLE',
  room_type: { id: 1, name: 'Standard' },
  hotel: { id: 1, name: 'Grand Hotel', city: 'Moscow' },
  images: [],
}

describe('RoomList', () => {
  it('includes date_from/date_to in book link for authenticated user', () => {
    auth.user = {
      id: 2,
      name: 'Client',
      email: 'client@example.com',
      phone: null,
      role: 'CLIENT',
      created_at: '2026-07-01T00:00:00Z',
    }

    renderWithProviders(
      <RoomList
        dateFrom="2026-08-10"
        dateTo="2026-08-15"
        isError={false}
        isLoading={false}
        onRetry={() => undefined}
        rooms={[sampleRoom]}
      />,
    )

    expect(screen.getByRole('link', { name: 'Забронировать' })).toHaveAttribute(
      'href',
      '/bookings/new?room_id=5&hotel_id=1&date_from=2026-08-10&date_to=2026-08-15',
    )
  })

  it('preserves dates in guest returnUrl', () => {
    auth.user = null

    renderWithProviders(
      <RoomList
        dateFrom="2026-08-10"
        dateTo="2026-08-15"
        isError={false}
        isLoading={false}
        onRetry={() => undefined}
        rooms={[sampleRoom]}
      />,
    )

    const href = screen.getByRole('link', { name: 'Забронировать' }).getAttribute('href')
    expect(href).toMatch(/^\/login\?returnUrl=/)
    const returnUrl = decodeURIComponent(href!.split('returnUrl=')[1] ?? '')
    expect(returnUrl).toBe(
      '/bookings/new?room_id=5&hotel_id=1&date_from=2026-08-10&date_to=2026-08-15',
    )
  })
})
