import { apiClient } from '@shared/api/client'
import type {
  Booking,
  BookingCreatePayload,
  BookingListParams,
  BookingPage,
} from '../types/booking'

const buildListParams = (
  params: BookingListParams,
): Record<string, string | number> => {
  const query: Record<string, string | number> = {}

  if (params.status) {
    query.status = params.status
  }
  if (params.page !== undefined) {
    query.page = params.page
  }
  if (params.size !== undefined) {
    query.size = params.size
  }

  return query
}

export const bookingsApi = {
  list: async (params: BookingListParams = {}): Promise<BookingPage> => {
    const { data } = await apiClient.get<BookingPage>('/bookings', {
      params: buildListParams(params),
    })

    return data
  },

  getById: async (bookingId: number): Promise<Booking> => {
    const { data } = await apiClient.get<Booking>(`/bookings/${bookingId}`)

    return data
  },

  create: async (payload: BookingCreatePayload): Promise<Booking> => {
    const { data } = await apiClient.post<Booking>('/bookings', payload)

    return data
  },

  cancel: async (bookingId: number): Promise<Booking> => {
    const { data } = await apiClient.patch<Booking>(`/bookings/${bookingId}/cancel`)

    return data
  },

  updateStatus: async (
    bookingId: number,
    status: Booking['status'],
  ): Promise<Booking> => {
    const { data } = await apiClient.patch<Booking>(`/bookings/${bookingId}`, {
      status,
    })

    return data
  },
}
