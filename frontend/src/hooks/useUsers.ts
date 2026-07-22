export { useUsers } from '@entities/user/api/queries/useUsers'
export { useUserMutations } from '@entities/user/api/mutations/useUserMutations'
export { userKeys } from '@entities/user/api/keys'

import { userKeys } from '@entities/user/api/keys'
import type { UserListParams } from '@entities/user/model/types'

/** @deprecated Prefer `userKeys.list` */
export const usersQueryKey = (params: UserListParams = {}) =>
  userKeys.list(params)
