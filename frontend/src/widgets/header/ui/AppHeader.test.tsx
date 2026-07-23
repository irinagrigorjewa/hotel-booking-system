import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { setAppLanguage } from '@shared/i18n'
import { renderWithProviders } from '@shared/test/renderWithProviders'
import { AppHeader } from './AppHeader'

describe('AppHeader', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    await setAppLanguage('ru')
  })

  it('renders brand wordmark and primary nav links', () => {
    renderWithProviders(<AppHeader />)

    expect(screen.getByRole('link', { name: 'Hotel Booking System' })).toHaveAttribute(
      'href',
      '/',
    )
    expect(screen.getByRole('link', { name: 'Отели' })).toHaveAttribute('href', '/hotels')
    expect(screen.getByRole('link', { name: 'Карта' })).toHaveAttribute('href', '/hotels/map')
    expect(screen.getByRole('link', { name: 'Вход' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Регистрация' })).toBeInTheDocument()
  })

  it('uses a paper sticky bar instead of a solid primary slab', () => {
    const { container } = renderWithProviders(<AppHeader />)
    const appBar = container.querySelector('.MuiAppBar-root')

    expect(appBar).toHaveClass('MuiAppBar-colorInherit')
    expect(appBar).toHaveClass('MuiAppBar-positionSticky')
  })

  it('keeps a single-row toolbar so sticky filters stay below the header on xs', () => {
    const { container } = renderWithProviders(<AppHeader />)
    const toolbar = container.querySelector('.MuiToolbar-root')
    const nav = container.querySelector('nav')

    expect(toolbar).toHaveStyle({ flexWrap: 'nowrap' })
    expect(nav).toHaveStyle({ flexWrap: 'nowrap' })
  })

  it('does not allow the brand wordmark to flex-shrink to zero width', () => {
    renderWithProviders(<AppHeader />)
    const brand = screen.getByRole('link', { name: 'Hotel Booking System' })

    expect(brand).toBeVisible()
    expect(brand).toHaveStyle({
      flexShrink: '0',
      minWidth: 'auto',
      whiteSpace: 'nowrap',
    })
  })
})
