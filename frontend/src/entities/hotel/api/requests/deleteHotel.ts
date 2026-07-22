import { apiClient } from '@shared/api/client'

export const deleteHotel = async (hotelId: number): Promise<void> => {
  await apiClient.delete(`/hotels/${hotelId}`)
}
