import { type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { useNotify } from '@app/providers/NotificationProvider'
import { useFavoriteMutations } from '@entities/favorite/api/mutations/useFavoriteMutations'
import { useAuth } from '@features/auth/ui/AuthContext'

export const useFavoriteToggle = (hotelId: number, isFavorite: boolean | null) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { notifySuccess, notifyApiError } = useNotify()
  const { addFavorite, removeFavorite } = useFavoriteMutations()
  const pending = addFavorite.isPending || removeFavorite.isPending
  const favorited = isFavorite === true

  const toggle = async (event: MouseEvent): Promise<void> => {
    event.preventDefault()
    event.stopPropagation()

    if (!user) {
      navigate(`/login?returnUrl=${encodeURIComponent(`/hotels/${hotelId}`)}`)
      return
    }

    try {
      if (favorited) {
        await removeFavorite.mutateAsync(hotelId)
        notifySuccess('notifications.favoriteRemoved')
      } else {
        await addFavorite.mutateAsync(hotelId)
        notifySuccess('notifications.favoriteAdded')
      }
    } catch (err) {
      notifyApiError(err, 'errors.updateFavoriteFailed')
    }
  }

  return { favorited, pending, toggle }
}
