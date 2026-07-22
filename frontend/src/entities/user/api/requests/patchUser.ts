import { apiClient } from '@shared/api/client'

import type { User, UserUpdatePayload } from '../../model/types'

export const patchUser = async (
  userId: number,
  payload: UserUpdatePayload,
): Promise<User> => {
  const { data } = await apiClient.patch<User>(`/users/${userId}`, payload)

  return data
}
