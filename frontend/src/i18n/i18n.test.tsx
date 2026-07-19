import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { I18N_STORAGE_KEY, setAppLanguage } from '../i18n'
import { PublicLayout } from '../layouts/PublicLayout'
import { renderWithProviders } from '../test/renderWithProviders'

describe('i18n', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    await setAppLanguage('ru')
  })

  it('switches language and persists i18n_lang', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<p>home</p>} />
        </Route>
      </Routes>,
    )

    expect(screen.getByRole('link', { name: 'Отели' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'EN' }))

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Hotels' })).toBeInTheDocument()
    })
    expect(window.localStorage.getItem(I18N_STORAGE_KEY)).toBe('en')

    await user.click(screen.getByRole('button', { name: 'RU' }))

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Отели' })).toBeInTheDocument()
    })
    expect(window.localStorage.getItem(I18N_STORAGE_KEY)).toBe('ru')
  })

  it('renders language switcher buttons', () => {
    renderWithProviders(<LanguageSwitcher />)
    expect(screen.getByRole('button', { name: 'RU' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument()
  })
})
