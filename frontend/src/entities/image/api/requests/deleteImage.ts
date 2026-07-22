import { apiClient } from '@shared/api/client'

export const deleteImage = async (imageId: number): Promise<void> => {
  await apiClient.delete(`/images/${imageId}`)
}
