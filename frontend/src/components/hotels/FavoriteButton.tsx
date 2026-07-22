import { IconButton, Tooltip } from '@mui/material'
import { type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import { useNotify } from '@app/providers/NotificationProvider'
import { useFavoriteMutations } from '../../hooks/useFavoriteMutations'

interface FavoriteButtonProps {
  hotelId: number
  isFavorite: boolean | null
}

export const FavoriteButton = ({ hotelId, isFavorite }: FavoriteButtonProps) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { notifySuccess, notifyApiError } = useNotify()
  const { addFavorite, removeFavorite } = useFavoriteMutations()
  const pending = addFavorite.isPending || removeFavorite.isPending
  const favorited = isFavorite === true
  const label = favorited ? t('favorites.remove') : t('favorites.add')

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

  return (
    <Tooltip title={label}>
      <IconButton
        aria-label={label}
        color={favorited ? 'error' : 'default'}
        disabled={pending}
        onClick={(event) => {
          void toggle(event)
        }}
        size="small"
        sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'background.paper' } }}
      >
        {favorited ? '♥' : '♡'}
      </IconButton>
    </Tooltip>
  )
}
