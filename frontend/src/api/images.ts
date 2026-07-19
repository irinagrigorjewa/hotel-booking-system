import { apiClient } from './client'

export interface ImageOut {
  id: number
  url: string
  sort_order: number
  entity_type: 'HOTEL' | 'ROOM'
  entity_id: number
}

export const imagesApi = {
  uploadHotelImage: async (
    hotelId: number,
    file: File,
    sortOrder = 0,
  ): Promise<ImageOut> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('sort_order', String(sortOrder))
    const { data } = await apiClient.post<ImageOut>(
      `/hotels/${hotelId}/images`,
      formData,
    )

    return data
  },

  uploadRoomImage: async (
    roomId: number,
    file: File,
    sortOrder = 0,
  ): Promise<ImageOut> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('sort_order', String(sortOrder))
    const { data } = await apiClient.post<ImageOut>(
      `/rooms/${roomId}/images`,
      formData,
    )

    return data
  },

  updateSortOrder: async (
    imageId: number,
    sortOrder: number,
  ): Promise<ImageOut> => {
    const { data } = await apiClient.patch<ImageOut>(`/images/${imageId}`, {
      sort_order: sortOrder,
    })

    return data
  },

  remove: async (imageId: number): Promise<void> => {
    await apiClient.delete(`/images/${imageId}`)
  },
}
