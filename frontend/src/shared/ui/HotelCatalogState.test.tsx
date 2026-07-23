import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setAppLanguage } from '@shared/i18n'
import { createHotelListItem } from '@shared/test/hotelFixtures'
import { renderWithProviders } from '@shared/test/renderWithProviders'
import { HotelCatalogState } from './HotelCatalogState'

describe('HotelCatalogState', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    await setAppLanguage('ru')
  })

  it('renders loading skeletons', () => {
    const { container } = renderWithProviders(
      <HotelCatalogState isError={false} isLoading items={[]} onRetry={() => undefined} />,
    )

    expect(container.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(0)
  })

  it('renders empty state with hint', () => {
    renderWithProviders(
      <HotelCatalogState isError={false} isLoading={false} items={[]} onRetry={() => undefined} />,
    )

    expect(screen.getByText('Отели не найдены')).toBeInTheDocument()
    expect(
      screen.getByText('Измените город или количество звёзд и попробуйте снова.'),
    ).toBeInTheDocument()
  })

  it('renders error state and retries', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()

    renderWithProviders(
      <HotelCatalogState isError isLoading={false} items={[]} onRetry={onRetry} />,
    )

    expect(screen.getByText('Не удалось загрузить отели')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('renders hotel cards for items', () => {
    renderWithProviders(
      <HotelCatalogState
        isError={false}
        isLoading={false}
        items={[createHotelListItem({ min_price: '4500', name: 'Grand Hotel' })]}
        onRetry={() => undefined}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Grand Hotel' })).toBeInTheDocument()
    expect(screen.getByText('от 4500 ₽')).toBeInTheDocument()
  })
})
