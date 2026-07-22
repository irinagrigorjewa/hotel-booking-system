import { apiClient } from '@shared/api/client'

import type { User } from '../../model/types'
import type { UserMeUpdatePayload } from '../../model/types'

export const patchMe = async (payload: UserMeUpdatePayload): Promise<User> => {
  const { data } = await apiClient.patch<User>('/users/me', payload)

  return data
}
