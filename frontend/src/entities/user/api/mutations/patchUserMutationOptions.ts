import { mutationOptions, type QueryClient } from '@tanstack/react-query'

import type { UserUpdatePayload } from '../../model/types'
import { userKeys } from '../keys'
import { patchUser } from '../requests/patchUser'

export const patchUserMutationOptions = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: number
      payload: UserUpdatePayload
    }) => patchUser(userId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
