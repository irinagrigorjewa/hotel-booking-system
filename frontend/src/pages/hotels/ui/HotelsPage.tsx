import { Box, Link, Typography } from '@mui/material'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

import { useHotels } from '@entities/hotel/api/queries/useHotels'
import { useHotelListSearchParams } from '@features/hotel-filters/model/useHotelListSearchParams'
import { useDebouncedCityFilter } from '@features/hotel-search/model/useDebouncedCityFilter'
import { fonts } from '@shared/theme/tokens'
import { HotelCatalog } from '@widgets/hotel-catalog/ui/HotelCatalog'

export const HotelsPage = () => {
  const { t } = useTranslation()
  const { params, setFilters } = useHotelListSearchParams({
    page: 1,
    size: 20,
    sort: 'created_at',
  })
  const { cityDraft, setCityDraft, debouncedCity } = useDebouncedCityFilter(
    params.city ?? '',
  )
  const hotelsQuery = useHotels(params)
  const totalPages = Math.max(
    1,
    Math.ceil((hotelsQuery.data?.total ?? 0) / (params.size ?? 20)),
  )

  useEffect(() => {
    const next = debouncedCity.trim()
    const current = (params.city ?? '').trim()
    if (next === current) {
      return
    }
    setFilters({ city: debouncedCity, resetPage: true })
  }, [debouncedCity, params.city, setFilters])

  return (
    <Box>
      <Typography
        component="h1"
        gutterBottom
        sx={{ fontFamily: fonts.display, fontWeight: 700, letterSpacing: '-0.02em' }}
        variant="h4"
      >
        {t('hotels.title')}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }} variant="body1">
        {t('hotels.subtitle')}
      </Typography>
      <HotelCatalog
        filters={{
          city: cityDraft,
          stars: params.stars ?? '',
          sort: params.sort ?? 'created_at',
        }}
        isError={hotelsQuery.isError}
        isLoading={hotelsQuery.isLoading}
        items={hotelsQuery.data?.items ?? []}
        mapHref={
          params.city
            ? `/hotels/map?city=${encodeURIComponent(params.city)}`
            : '/hotels/map'
        }
        mapLabel={t('hotels.onMap')}
        onFiltersChange={(value) => {
          setCityDraft(value.city)
          if (
            value.stars !== (params.stars ?? '') ||
            value.sort !== (params.sort ?? 'created_at')
          ) {
            setFilters({
              stars: value.stars,
              sort: value.sort,
              resetPage: true,
            })
          }
        }}
        onRetry={() => {
          void hotelsQuery.refetch()
        }}
        pagination={
          (hotelsQuery.data?.total ?? 0) > 0
            ? {
                count: totalPages,
                page: params.page ?? 1,
                onChange: (page) => setFilters({ page }),
              }
            : null
        }
      />
      <Typography sx={{ mt: 4 }} variant="body2">
        <Link component={RouterLink} to="/">
          {t('common.notFoundHome')}
        </Link>
      </Typography>
    </Box>
  )
}
