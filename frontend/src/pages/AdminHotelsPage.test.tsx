import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '../test/renderWithProviders'
import { AdminHotelsPage } from './AdminHotelsPage'

describe('AdminHotelsPage', () => {
  it('lists hotels and validates latitude before submit', async () => {
    renderWithProviders(<AdminHotelsPage />, {
      initialEntries: ['/admin/hotels'],
    })

    expect(await screen.findByText('Grand Hotel')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Название'), {
      target: { value: 'Aurora' },
    })
    fireEvent.change(screen.getByLabelText('Город'), {
      target: { value: 'Sochi' },
    })
    fireEvent.change(screen.getByLabelText('Адрес'), {
      target: { value: 'Beach 1' },
    })
    fireEvent.change(screen.getByLabelText('Широта'), {
      target: { value: '120' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Создать' }))

    expect(await screen.findByText('Широта от −90 до 90')).toBeInTheDocument()
  })

  it('creates a hotel through the API on valid submit', async () => {
    renderWithProviders(<AdminHotelsPage />, {
      initialEntries: ['/admin/hotels'],
    })

    await screen.findByText('Grand Hotel')

    fireEvent.change(screen.getByLabelText('Название'), {
      target: { value: 'Aurora' },
    })
    fireEvent.change(screen.getByLabelText('Город'), {
      target: { value: 'Sochi' },
    })
    fireEvent.change(screen.getByLabelText('Адрес'), {
      target: { value: 'Beach 1' },
    })
    fireEvent.change(screen.getByLabelText('Широта'), {
      target: { value: '43.6' },
    })
    fireEvent.change(screen.getByLabelText('Долгота'), {
      target: { value: '39.7' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Создать' }))

    await waitFor(() => {
      expect(screen.queryByDisplayValue('Aurora')).not.toBeInTheDocument()
    })

    expect(await screen.findByRole('alert')).toHaveTextContent('Отель сохранён')
  })
})
