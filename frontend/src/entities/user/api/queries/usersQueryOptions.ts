import { queryOptions } from '@tanstack/react-query'

import type { UserListParams } from '../../model/types'
import { userKeys } from '../keys'
import { listUsers } from '../requests/listUsers'

export const usersQueryOptions = (params: UserListParams = {}) =>
  queryOptions({
    queryKey: userKeys.list(params),
    queryFn: () => listUsers(params),
  })
