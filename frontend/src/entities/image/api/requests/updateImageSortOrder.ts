import { apiClient } from '@shared/api/client'

import type { ImageOut } from '../../model/types'

export const updateImageSortOrder = async (
  imageId: number,
  sortOrder: number,
): Promise<ImageOut> => {
  const { data } = await apiClient.patch<ImageOut>(`/images/${imageId}`, {
    sort_order: sortOrder,
  })

  return data
}
