import { Box, Button, Container, TextField, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useNavigate } from 'react-router-dom'

import { useHotels } from '@entities/hotel/api/queries/useHotels'
import { useDebouncedCityFilter } from '@features/hotel-search/model/useDebouncedCityFilter'
import { fonts, radius } from '@shared/theme/tokens'
import { HotelCatalog } from '@widgets/hotel-catalog/ui/HotelCatalog'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80'

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
      <Box
        aria-label={t('hotels.homeHeroLabel')}
        component="section"
        sx={{
          backgroundColor: 'primary.dark',
          backgroundImage: `linear-gradient(115deg, rgba(8, 47, 70, 0.92) 0%, rgba(12, 74, 110, 0.78) 42%, rgba(8, 47, 70, 0.55) 100%), url(${HERO_IMAGE})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          color: 'common.white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          minHeight: { xs: 'calc(100vh - 64px)', md: 'min(720px, calc(100vh - 64px))' },
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 5, md: 8 },
          width: '100%',
        }}
      >
        <Box sx={{ maxWidth: 720, mx: 'auto', width: '100%' }}>
          <Typography
            component="p"
            sx={{
              fontFamily: fonts.display,
              fontSize: { xs: '2.25rem', md: '3rem' },
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              mb: 1.5,
            }}
          >
            {t('nav.brand')}
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontFamily: fonts.display,
              fontSize: { xs: '1.5rem', md: '1.875rem' },
              fontWeight: 600,
              letterSpacing: '-0.02em',
              mb: 1,
            }}
          >
            {t('hotels.homeHeadline')}
          </Typography>
          <Typography
            sx={{ mb: 3, maxWidth: 480, opacity: 0.92 }}
            variant="body1"
          >
            {t('hotels.homeTagline')}
          </Typography>
          <Box
            component="form"
            onSubmit={(event) => {
              event.preventDefault()
              search()
            }}
            sx={{
              alignItems: { xs: 'stretch', sm: 'center' },
              bgcolor: 'background.paper',
              borderRadius: `${radius.lg}px`,
              boxShadow: 3,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1.5,
              p: 1.5,
              width: '100%',
            }}
          >
            <TextField
              label={t('common.city')}
              onChange={(event) => setCityDraft(event.target.value)}
              size="small"
              sx={{ flex: 1, minWidth: 0 }}
              value={cityDraft}
            />
            <Button
              color="cta"
              sx={{ flexShrink: 0, px: 3 }}
              type="submit"
              variant="contained"
            >
              {t('common.search')}
            </Button>
          </Box>
        </Box>
      </Box>

      <Container
        maxWidth="lg"
        sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 4, md: 6 } }}
      >
        <Typography
          component="h2"
          gutterBottom
          sx={{ fontFamily: fonts.display, fontWeight: 700, letterSpacing: '-0.02em' }}
          variant="h5"
        >
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
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 4 }}>
          <Button component={RouterLink} to="/hotels" variant="contained">
            {t('hotels.allHotels')}
          </Button>
          <Button component={RouterLink} to="/hotels/map" variant="outlined">
            {t('hotels.openMap')}
          </Button>
        </Box>
      </Container>
    </Box>
  )
}
