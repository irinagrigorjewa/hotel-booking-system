import { apiClient } from '@shared/api/client'

import type { BookingListParams, BookingPage } from '../../model/types'

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

export const listBookings = async (
  params: BookingListParams = {},
): Promise<BookingPage> => {
  const { data } = await apiClient.get<BookingPage>('/bookings', {
    params: buildListParams(params),
  })

  return data
}
