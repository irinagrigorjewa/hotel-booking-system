import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setAppLanguage } from '@shared/i18n'
import { renderWithProviders } from '@shared/test/renderWithProviders'
import { AdminLayout } from './AdminLayout'

const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

describe('AdminLayout', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    await setAppLanguage('ru')
    mockMatchMedia(true)
  })

  it('renders side navigation for admin sections', () => {
    renderWithProviders(
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="admin/hotels" element={<p>Hotels content</p>} />
        </Route>
      </Routes>,
      { initialEntries: ['/admin/hotels'] },
    )

    expect(screen.getByText('Hotels content')).toBeInTheDocument()

    const nav = screen.getByRole('navigation', { name: 'Админ-навигация' })
    expect(within(nav).getByRole('link', { name: 'Отели' })).toHaveAttribute(
      'href',
      '/admin/hotels',
    )
    expect(within(nav).getByRole('link', { name: 'Номера' })).toHaveAttribute(
      'href',
      '/admin/rooms',
    )
    expect(within(nav).getByRole('link', { name: 'Обзор' })).toHaveAttribute('href', '/admin')
  })

  it('navigates between admin sections from the drawer', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="admin" element={<p>Admin home</p>} />
          <Route path="admin/users" element={<p>Users content</p>} />
        </Route>
      </Routes>,
      { initialEntries: ['/admin'] },
    )

    expect(screen.getByText('Admin home')).toBeInTheDocument()

    const nav = screen.getByRole('navigation', { name: 'Админ-навигация' })
    await user.click(within(nav).getByRole('link', { name: 'Пользователи' }))

    expect(await screen.findByText('Users content')).toBeInTheDocument()
  })

  it('opens temporary navigation on narrow viewports', async () => {
    mockMatchMedia(false)
    const user = userEvent.setup()

    renderWithProviders(
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="admin" element={<p>Admin home</p>} />
        </Route>
      </Routes>,
      { initialEntries: ['/admin'] },
    )

    expect(screen.getByRole('button', { name: 'Меню' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Меню' }))

    expect(
      await screen.findByRole('navigation', { name: 'Админ-навигация' }),
    ).toBeInTheDocument()
  })
})
