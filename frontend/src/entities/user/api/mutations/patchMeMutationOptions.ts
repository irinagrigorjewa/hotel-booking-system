import { mutationOptions } from '@tanstack/react-query'

import type { UserMeUpdatePayload } from '../../model/types'
import { patchMe } from '../requests/patchMe'

export const patchMeMutationOptions = () =>
  mutationOptions({
    mutationFn: (payload: UserMeUpdatePayload) => patchMe(payload),
  })
