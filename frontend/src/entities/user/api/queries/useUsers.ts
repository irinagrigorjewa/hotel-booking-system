import { useQuery } from '@tanstack/react-query'

import type { UserListParams } from '../../model/types'
import { usersQueryOptions } from './usersQueryOptions'

export const useUsers = (params: UserListParams = {}) =>
  useQuery(usersQueryOptions(params))
