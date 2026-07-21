import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { bookingsApi } from '../api/bookings'
import { bookingHandlers, server } from '../test/server'
import { renderWithProviders } from '../test/renderWithProviders'
import { utcTodayIso } from '../utils/bookingDates'
import { BookingNewPage } from './BookingNewPage'

const addDays = (isoDate: string, days: number): string => {
  const date = new Date(`${isoDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)

  return date.toISOString().slice(0, 10)
}

describe('BookingNewPage', () => {
  it('shows nights and total preview, then creates a booking', async () => {
    const createSpy = vi.spyOn(bookingsApi, 'create')
    const today = utcTodayIso()
    const checkIn = addDays(today, 10)
    const checkOut = addDays(today, 15)

    renderWithProviders(<BookingNewPage />, {
      initialEntries: [`/bookings/new?room_id=5`],
    })

    expect(await screen.findByText(/Grand Hotel · номер 301/)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Заезд'), {
      target: { value: checkIn },
    })
    fireEvent.change(screen.getByLabelText('Выезд'), {
      target: { value: checkOut },
    })

    expect(await screen.findByText(/Ночей: 5 · Итого: 27500.00 ₽/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Забронировать' }))

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith({
        room_id: 5,
        check_in: checkIn,
        check_out: checkOut,
      })
    })
  })

  it('shows API overlap error on 409', async () => {
    server.use(bookingHandlers.createConflict)
    const today = utcTodayIso()

    renderWithProviders(<BookingNewPage />, {
      initialEntries: ['/bookings/new?room_id=5'],
    })

    await screen.findByText(/Grand Hotel · номер 301/)

    fireEvent.change(screen.getByLabelText('Заезд'), {
      target: { value: addDays(today, 10) },
    })
    fireEvent.change(screen.getByLabelText('Выезд'), {
      target: { value: addDays(today, 12) },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Забронировать' }))

    expect(
      await screen.findByText('Даты пересекаются с существующим бронированием'),
    ).toBeInTheDocument()
  })

  it('warns when room_id is missing', () => {
    renderWithProviders(<BookingNewPage />, {
      initialEntries: ['/bookings/new'],
    })

    expect(screen.getByText('Выберите номер на странице отеля.')).toBeInTheDocument()
  })

  it('prefills check-in/out from date_from/date_to query params', async () => {
    const today = utcTodayIso()
    const checkIn = addDays(today, 10)
    const checkOut = addDays(today, 15)

    renderWithProviders(<BookingNewPage />, {
      initialEntries: [
        `/bookings/new?room_id=5&date_from=${checkIn}&date_to=${checkOut}`,
      ],
    })

    await screen.findByText(/Grand Hotel · номер 301/)

    expect(screen.getByLabelText('Заезд')).toHaveValue(checkIn)
    expect(screen.getByLabelText('Выезд')).toHaveValue(checkOut)
    expect(await screen.findByText(/Ночей: 5 · Итого: 27500.00 ₽/)).toBeInTheDocument()
  })
})

