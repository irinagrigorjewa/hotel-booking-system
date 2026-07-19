import { Box, Typography } from '@mui/material'

import { HotelCatalogState } from '../components/hotels/HotelCatalogState'
import { useFavorites } from '../hooks/useFavorites'

export const FavoritesPage = () => {
  const { data, isLoading, isError, refetch } = useFavorites()

  return (
    <Box>
      <Typography component="h1" gutterBottom variant="h4">
        Избранное
      </Typography>
      <HotelCatalogState
        emptyMessage="В избранном пока пусто"
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
