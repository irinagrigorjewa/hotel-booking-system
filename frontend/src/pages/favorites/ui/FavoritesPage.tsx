import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { HotelCatalogState } from '@shared/ui/HotelCatalogState'
import { fonts } from '@shared/theme/tokens'
import { useFavorites } from '@entities/favorite/api/queries/useFavorites'

export const FavoritesPage = () => {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useFavorites()

  return (
    <Box>
      <Typography
        component="h1"
        gutterBottom
        sx={{ fontFamily: fonts.display, fontWeight: 700, letterSpacing: '-0.02em' }}
        variant="h4"
      >
        {t('favorites.title')}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }} variant="body1">
        {t('favorites.subtitle')}
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
