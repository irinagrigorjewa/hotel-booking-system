import { IconButton, Tooltip } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { useFavoriteToggle } from '../model/useFavoriteToggle'

interface FavoriteButtonProps {
  hotelId: number
  isFavorite: boolean | null
}

export const FavoriteButton = ({ hotelId, isFavorite }: FavoriteButtonProps) => {
  const { t } = useTranslation()
  const { favorited, pending, toggle } = useFavoriteToggle(hotelId, isFavorite)
  const label = favorited ? t('favorites.remove') : t('favorites.add')

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
