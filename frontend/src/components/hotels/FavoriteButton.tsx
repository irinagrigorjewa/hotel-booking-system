import { IconButton, Tooltip } from '@mui/material'
import { useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import { useFavoriteMutations } from '../../hooks/useFavoriteMutations'
import { getApiErrorMessage } from '../../utils/getApiErrorMessage'

interface FavoriteButtonProps {
  hotelId: number
  isFavorite: boolean | null
}

export const FavoriteButton = ({ hotelId, isFavorite }: FavoriteButtonProps) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { addFavorite, removeFavorite } = useFavoriteMutations()
  const [error, setError] = useState('')
  const pending = addFavorite.isPending || removeFavorite.isPending
  const favorited = isFavorite === true

  const toggle = async (event: MouseEvent): Promise<void> => {
    event.preventDefault()
    event.stopPropagation()
    setError('')

    if (!user) {
      navigate(`/login?returnUrl=${encodeURIComponent(`/hotels/${hotelId}`)}`)
      return
    }

    try {
      if (favorited) {
        await removeFavorite.mutateAsync(hotelId)
      } else {
        await addFavorite.mutateAsync(hotelId)
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Не удалось обновить избранное'))
    }
  }

  return (
    <Tooltip title={error || (favorited ? 'Убрать из избранного' : 'В избранное')}>
      <IconButton
        aria-label={favorited ? 'Убрать из избранного' : 'В избранное'}
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
