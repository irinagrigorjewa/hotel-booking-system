import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

import type { HotelMapItem } from '@entities/hotel/model/map-types'
import { HotelsMapView } from '@entities/hotel/ui/HotelsMapView'
import { fonts, radius } from '@shared/theme/tokens'

interface HotelsMapSectionProps {
  cityDraft: string
  onCityDraftChange: (value: string) => void
  onApplyCity: () => void
  isLoading: boolean
  isError: boolean
  hotels: HotelMapItem[] | undefined
}

export const HotelsMapSection = ({
  cityDraft,
  onCityDraftChange,
  onApplyCity,
  isLoading,
  isError,
  hotels,
}: HotelsMapSectionProps) => {
  const { t } = useTranslation()

  return (
    <Box>
      <Typography
        component="h1"
        gutterBottom
        sx={{ fontFamily: fonts.display, fontWeight: 700, letterSpacing: '-0.02em' }}
        variant="h4"
      >
        {t('map.title')}
      </Typography>
      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault()
          onApplyCity()
        }}
        sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2.5 }}
      >
        <TextField
          label={t('common.city')}
          onChange={(event) => onCityDraftChange(event.target.value)}
          size="small"
          value={cityDraft}
        />
        <Button color="cta" type="submit" variant="contained">
          {t('common.filter')}
        </Button>
      </Box>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : null}
      {isError ? <Alert severity="error">{t('map.loadFailed')}</Alert> : null}
      {hotels && hotels.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t('map.empty')}
        </Alert>
      ) : null}
      {hotels && hotels.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: 'minmax(260px, 320px) 1fr' },
            minHeight: { md: 520 },
          }}
        >
          <Box
            aria-label={t('map.listLabel')}
            component="aside"
            sx={{
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: `${radius.md}px`,
              display: { xs: 'none', md: 'block' },
              maxHeight: 560,
              overflow: 'auto',
            }}
          >
            <Typography
              sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2, py: 1.5 }}
              variant="subtitle2"
            >
              {t('map.listTitle', { count: hotels.length })}
            </Typography>
            <List dense disablePadding>
              {hotels.map((hotel) => (
                <ListItemButton
                  component={RouterLink}
                  key={hotel.id}
                  sx={{ alignItems: 'flex-start', py: 1.25 }}
                  to={`/hotels/${hotel.id}`}
                >
                  <ListItemText
                    primary={hotel.name}
                    primaryTypographyProps={{ fontWeight: 600, variant: 'body2' }}
                    secondary={
                      hotel.min_price
                        ? t('common.fromPrice', { price: hotel.min_price })
                        : t('hotels.starsCount', { count: hotel.stars })
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: `${radius.md}px`,
              height: { xs: 420, md: 560 },
              overflow: 'hidden',
            }}
          >
            <HotelsMapView height="100%" hotels={hotels} />
          </Box>
        </Box>
      ) : null}
      {hotels && hotels.length > 0 ? (
        <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 2 }}>
          <Typography sx={{ mb: 1 }} variant="subtitle2">
            {t('map.listTitle', { count: hotels.length })}
          </Typography>
          {hotels.slice(0, 8).map((hotel) => (
            <Typography key={hotel.id} sx={{ mb: 0.75 }} variant="body2">
              <Link component={RouterLink} to={`/hotels/${hotel.id}`}>
                {hotel.name}
              </Link>
              {hotel.min_price
                ? ` · ${t('common.fromPrice', { price: hotel.min_price })}`
                : null}
            </Typography>
          ))}
        </Box>
      ) : null}
    </Box>
  )
}
