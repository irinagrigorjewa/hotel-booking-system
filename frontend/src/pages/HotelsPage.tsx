import { Box, Button, Link, Pagination, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

import { useHotels } from '@entities/hotel/api/queries/useHotels'
import { useDebouncedValue } from '@shared/lib/useDebouncedValue'

import { HotelCatalogState } from '../components/hotels/HotelCatalogState'
import { HotelFilters } from '../components/hotels/HotelFilters'
import { useHotelListSearchParams } from '../hooks/useHotelListSearchParams'

export const HotelsPage = () => {
  const { t } = useTranslation()
  const { params, setFilters } = useHotelListSearchParams({
    page: 1,
    size: 20,
    sort: 'created_at',
  })
  const [cityDraft, setCityDraft] = useState(params.city ?? '')
  const debouncedCity = useDebouncedValue(cityDraft, 350)
  const hotelsQuery = useHotels(params)
  const totalPages = Math.max(
    1,
    Math.ceil((hotelsQuery.data?.total ?? 0) / (params.size ?? 20)),
  )

  useEffect(() => {
    setCityDraft(params.city ?? '')
  }, [params.city])

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
      <Typography component="h1" gutterBottom variant="h4">
        {t('hotels.title')}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {t('hotels.subtitle')}
      </Typography>
      <HotelFilters
        onChange={(value) => {
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
        value={{
          city: cityDraft,
          stars: params.stars ?? '',
          sort: params.sort ?? 'created_at',
        }}
      />
      <Button
        component={RouterLink}
        sx={{ mb: 2 }}
        to={params.city ? `/hotels/map?city=${encodeURIComponent(params.city)}` : '/hotels/map'}
      >
        {t('hotels.onMap')}
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
          {t('common.notFoundHome')}
        </Link>
      </Typography>
    </Box>
  )
}
