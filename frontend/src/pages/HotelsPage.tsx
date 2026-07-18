import { Box, Button, Link, Pagination, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

import { HotelCatalogState } from '../components/hotels/HotelCatalogState'
import { HotelFilters } from '../components/hotels/HotelFilters'
import { useHotelListSearchParams } from '../hooks/useHotelListSearchParams'
import { useHotels } from '../hooks/useHotels'

export const HotelsPage = () => {
  const { params, setFilters } = useHotelListSearchParams({
    page: 1,
    size: 20,
    sort: 'created_at',
  })
  const hotelsQuery = useHotels(params)
  const totalPages = Math.max(
    1,
    Math.ceil((hotelsQuery.data?.total ?? 0) / (params.size ?? 20)),
  )

  return (
    <Box>
      <Typography component="h1" gutterBottom variant="h4">
        Отели
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Фильтруйте каталог по городу и звёздам.
      </Typography>
      <HotelFilters
        onChange={(value) =>
          setFilters({
            city: value.city,
            stars: value.stars,
            sort: value.sort,
            resetPage: true,
          })
        }
        value={{
          city: params.city ?? '',
          stars: params.stars ?? '',
          sort: params.sort ?? 'created_at',
        }}
      />
      <Button
        component={RouterLink}
        sx={{ mb: 2 }}
        to={params.city ? `/hotels/map?city=${encodeURIComponent(params.city)}` : '/hotels/map'}
      >
        На карте
      </Button>
      <HotelCatalogState
        isError={hotelsQuery.isError}
        isLoading={hotelsQuery.isLoading}
        items={hotelsQuery.data?.items ?? []}
        onRetry={() => {
          void hotelsQuery.refetch()
        }}
      />
      {!hotelsQuery.isLoading && !hotelsQuery.isError && (hotelsQuery.data?.total ?? 0) > 0 ? (
        <Pagination
          count={totalPages}
          onChange={(_, page) => setFilters({ page })}
          page={params.page ?? 1}
          sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}
        />
      ) : null}
      <Typography sx={{ mt: 3 }}>
        <Link component={RouterLink} to="/">
          На главную
        </Link>
      </Typography>
    </Box>
  )
}
