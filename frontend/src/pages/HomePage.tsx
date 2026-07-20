import { Box, Button, Link, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useNavigate } from 'react-router-dom'

import { HotelCatalogState } from '../components/hotels/HotelCatalogState'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useHotels } from '../hooks/useHotels'

export const HomePage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [cityDraft, setCityDraft] = useState('')
  const debouncedCity = useDebouncedValue(cityDraft, 350)
  const hotelsQuery = useHotels({
    city: debouncedCity.trim() || undefined,
    page: 1,
    size: 6,
    sort: 'avg_rating',
  })

  const search = (): void => {
    const nextCity = cityDraft.trim()
    navigate(nextCity ? `/hotels?city=${encodeURIComponent(nextCity)}` : '/hotels')
  }

  return (
    <Box>
      <Typography component="h1" gutterBottom variant="h3">
        {t('nav.brand')}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {t('hotels.homeTagline')}
      </Typography>
      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault()
          search()
        }}
        sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}
      >
        <TextField
          label={t('common.city')}
          onChange={(event) => setCityDraft(event.target.value)}
          size="small"
          value={cityDraft}
        />
        <Button type="submit" variant="contained">
          {t('common.search')}
        </Button>
      </Box>
      <Typography component="h2" gutterBottom variant="h5">
        {t('hotels.popular')}
      </Typography>
      <HotelCatalogState
        emptyMessage={t('hotels.notFound')}
        isError={hotelsQuery.isError}
        isLoading={hotelsQuery.isLoading}
        items={hotelsQuery.data?.items ?? []}
        onRetry={() => {
          void hotelsQuery.refetch()
        }}
      />
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button component={RouterLink} to="/hotels" variant="outlined">
          {t('hotels.allHotels')}
        </Button>
        <Button component={RouterLink} to="/hotels/map">
          {t('hotels.openMap')}
        </Button>
      </Box>
      <Typography sx={{ mt: 2 }}>
        <Link component={RouterLink} to="/hotels">
          {t('hotels.catalogLink')}
        </Link>
      </Typography>
    </Box>
  )
}
