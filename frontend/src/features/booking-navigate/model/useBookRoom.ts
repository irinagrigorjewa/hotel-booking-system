import { useAuth } from '@features/auth/ui/AuthContext'
import { buildBookPath } from '@entities/room/lib/buildBookPath'
import type { Room } from '@entities/room/model/types'

/** Auth-gated book URL: guests go to login with returnUrl. */
export const useBookRoom = () => {
  const { user } = useAuth()

  const resolveBookTo = (
    room: Room,
    dateFrom?: string,
    dateTo?: string,
  ): string => {
    const bookPath = buildBookPath(room, dateFrom, dateTo)

    return user
      ? bookPath
      : `/login?returnUrl=${encodeURIComponent(bookPath)}`
  }

  return { resolveBookTo, isAuthenticated: Boolean(user) }
}
