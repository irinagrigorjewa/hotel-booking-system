import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { setAppLanguage } from '../../i18n'
import { renderWithProviders } from '../../test/renderWithProviders'
import { RoomFilters, type RoomFiltersValue } from './RoomFilters'

const emptyValue: RoomFiltersValue = {
  capacity: '',
  price_from: '',
  price_to: '',
  date_from: '',
  date_to: '',
}

describe('RoomFilters', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    await setAppLanguage('ru')
  })

  it('renders Russian labels by default', () => {
    renderWithProviders(
      <RoomFilters onApply={() => undefined} onChange={() => undefined} value={emptyValue} />,
    )

    expect(screen.getByLabelText('Вместимость')).toBeInTheDocument()
    expect(screen.getByLabelText('Цена от')).toBeInTheDocument()
    expect(screen.getByLabelText('Цена до')).toBeInTheDocument()
    expect(screen.getByLabelText('Заезд')).toBeInTheDocument()
    expect(screen.getByLabelText('Выезд')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Применить' })).toBeInTheDocument()
  })

  it('renders English labels when locale is en', async () => {
    await setAppLanguage('en')

    renderWithProviders(
      <RoomFilters onApply={() => undefined} onChange={() => undefined} value={emptyValue} />,
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Capacity')).toBeInTheDocument()
    })
    expect(screen.getByLabelText('Price from')).toBeInTheDocument()
    expect(screen.getByLabelText('Price to')).toBeInTheDocument()
    expect(screen.getByLabelText('Check-in')).toBeInTheDocument()
    expect(screen.getByLabelText('Check-out')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument()
  })
})
