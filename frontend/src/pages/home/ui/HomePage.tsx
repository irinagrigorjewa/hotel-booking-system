import { Box, Button, Link, Paper, TextField, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useNavigate } from 'react-router-dom'

import { useHotels } from '@entities/hotel/api/queries/useHotels'
import { useDebouncedCityFilter } from '@features/hotel-search/model/useDebouncedCityFilter'
import { HotelCatalog } from '@widgets/hotel-catalog/ui/HotelCatalog'

export const HomePage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { cityDraft, setCityDraft, debouncedCity } = useDebouncedCityFilter('')
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
      <Paper
        elevation={0}
        sx={{
          bgcolor: 'primary.main',
          borderRadius: 3,
          color: 'primary.contrastText',
          mb: 4,
          overflow: 'hidden',
          px: { xs: 3, md: 5 },
          py: { xs: 4, md: 6 },
        }}
      >
        <Typography component="h1" gutterBottom sx={{ fontWeight: 700 }} variant="h3">
          {t('nav.brand')}
        </Typography>
        <Typography sx={{ mb: 3, maxWidth: 520, opacity: 0.95 }} variant="h6">
          {t('hotels.homeTagline')}
        </Typography>
        <Box
          component="form"
          onSubmit={(event) => {
            event.preventDefault()
            search()
          }}
          sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}
        >
          <TextField
            label={t('common.city')}
            onChange={(event) => setCityDraft(event.target.value)}
            size="small"
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 1,
              minWidth: { xs: '100%', sm: 240 },
            }}
            value={cityDraft}
          />
          <Button color="secondary" type="submit" variant="contained">
            {t('common.search')}
          </Button>
        </Box>
      </Paper>
      <Typography component="h2" gutterBottom variant="h5">
        {t('hotels.popular')}
      </Typography>
      <HotelCatalog
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
