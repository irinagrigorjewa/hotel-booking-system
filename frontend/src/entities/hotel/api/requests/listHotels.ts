import { apiClient } from '@shared/api/client'

import type { HotelListParams, HotelPage } from '../../model/types'

const buildListParams = (
  params: HotelListParams,
): Record<string, string | number> => {
  const query: Record<string, string | number> = {}

  if (params.city?.trim()) {
    query.city = params.city.trim()
  }

  if (params.stars !== undefined) {
    query.stars = params.stars
  }

  if (params.sort) {
    query.sort = params.sort
  }

  if (params.order) {
    query.order = params.order
  }

  if (params.page !== undefined) {
    query.page = params.page
  }

  if (params.size !== undefined) {
    query.size = params.size
  }

  return query
}

export const listHotels = async (
  params: HotelListParams = {},
): Promise<HotelPage> => {
  const { data } = await apiClient.get<HotelPage>('/hotels', {
    params: buildListParams(params),
  })

  return data
}
