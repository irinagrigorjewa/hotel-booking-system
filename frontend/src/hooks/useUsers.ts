import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { usersApi } from '../api/users'
import type { UserListParams, UserMeUpdatePayload, UserUpdatePayload } from '../types/user'

export const usersQueryKey = (params: UserListParams = {}) => ['users', params] as const

export const useUsers = (params: UserListParams = {}) =>
  useQuery({
    queryKey: usersQueryKey(params),
    queryFn: () => usersApi.list(params),
  })

export const useUserMutations = () => {
  const queryClient = useQueryClient()

  const invalidateUsers = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ['users'] })
  }

  const patchMe = useMutation({
    mutationFn: (payload: UserMeUpdatePayload) => usersApi.patchMe(payload),
  })

  const patchUser = useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: number
      payload: UserUpdatePayload
    }) => usersApi.patchUser(userId, payload),
    onSuccess: async () => {
      await invalidateUsers()
    },
  })

  return { patchMe, patchUser }
}
