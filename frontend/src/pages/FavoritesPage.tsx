import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { HotelCatalogState } from '../components/hotels/HotelCatalogState'
import { useFavorites } from '@entities/favorite/api/queries/useFavorites'

export const FavoritesPage = () => {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useFavorites()

  return (
    <Box>
      <Typography component="h1" gutterBottom variant="h4">
        {t('favorites.title')}
      </Typography>
      <HotelCatalogState
        emptyMessage={t('favorites.empty')}
        isError={isError}
        isLoading={isLoading}
        items={data?.items ?? []}
        onRetry={() => {
          void refetch()
        }}
      />
    </Box>
  )
}
