import { apiClient } from '@shared/api/client'

import type { UserListParams, UserPage } from '../../model/types'

export const listUsers = async (
  params: UserListParams = {},
): Promise<UserPage> => {
  const { data } = await apiClient.get<UserPage>('/users', {
    params: {
      page: params.page ?? 1,
      size: params.size ?? 20,
      ...(params.search ? { search: params.search } : {}),
    },
  })

  return data
}
