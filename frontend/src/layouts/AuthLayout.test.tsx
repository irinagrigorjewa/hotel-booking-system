import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTranslation } from 'react-i18next'
import { Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { setAppLanguage } from '../i18n'
import { renderWithProviders } from '../test/renderWithProviders'
import { AuthLayout } from './AuthLayout'

const AuthTitle = () => {
  const { t } = useTranslation()

  return <p>{t('auth.loginTitle')}</p>
}

describe('AuthLayout', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    await setAppLanguage('ru')
  })

  it('links the brand to home and shows a language switcher', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="login" element={<p>Login form</p>} />
        </Route>
        <Route path="/" element={<p>Home page</p>} />
      </Routes>,
      { initialEntries: ['/login'] },
    )

    expect(screen.getByText('Login form')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'RU' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Hotel Booking System' }))

    expect(await screen.findByText('Home page')).toBeInTheDocument()
  })

  it('updates auth strings when the language switcher is used', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="login" element={<AuthTitle />} />
        </Route>
      </Routes>,
      { initialEntries: ['/login'] },
    )

    expect(screen.getByText('Вход')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'EN' }))

    expect(await screen.findByText('Sign in')).toBeInTheDocument()
  })
})
