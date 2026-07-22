import { listUsers } from '@entities/user/api/requests/listUsers'
import { patchMe } from '@entities/user/api/requests/patchMe'
import { patchUser } from '@entities/user/api/requests/patchUser'

/** @deprecated Prefer `@entities/user/api/requests/*` */
export const usersApi = {
  list: listUsers,
  patchMe,
  patchUser,
}
