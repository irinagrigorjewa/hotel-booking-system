import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setAppLanguage } from '@shared/i18n'
import { APP_HEADER_STICKY_TOP_PX } from '@shared/layout/appHeaderSticky'
import { renderWithProviders } from '@shared/test/renderWithProviders'
import { HotelFilters, type HotelFiltersValue } from './HotelFilters'

const baseValue: HotelFiltersValue = {
  city: '',
  sort: 'created_at',
  stars: '',
}

describe('HotelFilters', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    await setAppLanguage('ru')
  })

  it('renders denser sticky filter controls', () => {
    const { container } = renderWithProviders(
      <HotelFilters onChange={() => undefined} value={baseValue} />,
    )

    const form = container.querySelector('form')
    expect(form).toBeTruthy()
    expect(form).toHaveStyle({ position: 'sticky' })
    expect(screen.getByLabelText('Город')).toBeInTheDocument()
    expect(screen.getByLabelText('Звёзды')).toBeInTheDocument()
    expect(screen.getByLabelText('Сортировка')).toBeInTheDocument()
  })

  it('sticky top tracks APP_HEADER_STICKY_TOP_PX (single-row header, not wrapped ~99px)', () => {
    // Guard: filters offset must stay aligned with AppHeader Toolbar minHeight.
    // AppHeader itself must stay nowrap on xs (see AppHeader.test) so real height ≈ these values.
    expect(APP_HEADER_STICKY_TOP_PX.xs).toBe(52)
    expect(APP_HEADER_STICKY_TOP_PX.sm).toBe(56)
    expect(APP_HEADER_STICKY_TOP_PX.xs).toBeLessThan(90)

    const { container } = renderWithProviders(
      <HotelFilters onChange={() => undefined} value={baseValue} />,
    )
    const form = container.querySelector('form')
    expect(form).toHaveStyle({ position: 'sticky' })
  })

  it('notifies on city change', () => {
    const onChange = vi.fn()

    renderWithProviders(<HotelFilters onChange={onChange} value={baseValue} />)

    fireEvent.change(screen.getByLabelText('Город'), { target: { value: 'Kazan' } })

    expect(onChange).toHaveBeenCalledWith({
      city: 'Kazan',
      sort: 'created_at',
      stars: '',
    })
  })

  it('can hide sort control', () => {
    renderWithProviders(
      <HotelFilters onChange={() => undefined} showSort={false} value={baseValue} />,
    )

    expect(screen.queryByLabelText('Сортировка')).not.toBeInTheDocument()
  })
})
