import { apiClient } from '@shared/api/client'
import type { User } from '../types/auth'
import type {
  UserListParams,
  UserMeUpdatePayload,
  UserPage,
  UserUpdatePayload,
} from '../types/user'

export const usersApi = {
  list: async (params: UserListParams = {}): Promise<UserPage> => {
    const { data } = await apiClient.get<UserPage>('/users', {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 20,
        ...(params.search ? { search: params.search } : {}),
      },
    })

    return data
  },

  patchMe: async (payload: UserMeUpdatePayload): Promise<User> => {
    const { data } = await apiClient.patch<User>('/users/me', payload)

    return data
  },

  patchUser: async (userId: number, payload: UserUpdatePayload): Promise<User> => {
    const { data } = await apiClient.patch<User>(`/users/${userId}`, payload)

    return data
  },
}
