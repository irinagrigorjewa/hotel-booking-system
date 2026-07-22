import type { UserListParams } from '../model/types'

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: UserListParams = {}) => [...userKeys.lists(), params] as const,
}
