import { apiClient } from './client'
import type {
  HotelDetail,
  HotelListParams,
  HotelPage,
  HotelWritePayload,
} from '../types/hotel'

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

export const hotelsApi = {
  list: async (params: HotelListParams = {}): Promise<HotelPage> => {
    const { data } = await apiClient.get<HotelPage>('/hotels', {
      params: buildListParams(params),
    })

    return data
  },

  getById: async (hotelId: number): Promise<HotelDetail> => {
    const { data } = await apiClient.get<HotelDetail>(`/hotels/${hotelId}`)

    return data
  },

  create: async (payload: HotelWritePayload): Promise<HotelDetail> => {
    const { data } = await apiClient.post<HotelDetail>('/hotels', payload)

    return data
  },

  update: async (
    hotelId: number,
    payload: HotelWritePayload,
  ): Promise<HotelDetail> => {
    const { data } = await apiClient.put<HotelDetail>(
      `/hotels/${hotelId}`,
      payload,
    )

    return data
  },

  remove: async (hotelId: number): Promise<void> => {
    await apiClient.delete(`/hotels/${hotelId}`)
  },
}
