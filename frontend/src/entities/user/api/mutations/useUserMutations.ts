import { useMutation, useQueryClient } from '@tanstack/react-query'

import { patchMeMutationOptions } from './patchMeMutationOptions'
import { patchUserMutationOptions } from './patchUserMutationOptions'

export const useUserMutations = () => {
  const queryClient = useQueryClient()

  const patchMe = useMutation(patchMeMutationOptions())
  const patchUser = useMutation(patchUserMutationOptions(queryClient))

  return { patchMe, patchUser }
}
