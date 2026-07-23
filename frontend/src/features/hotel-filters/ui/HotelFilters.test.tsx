import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setAppLanguage } from '@shared/i18n'
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
