import {
  Alert,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { HotelMapItem } from '@entities/hotel/model/map-types'
import { HotelsMapView } from '@entities/hotel/ui/HotelsMapView'

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
      <Typography component="h1" gutterBottom variant="h4">
        {t('map.title')}
      </Typography>
      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault()
          onApplyCity()
        }}
        sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}
      >
        <TextField
          label={t('common.city')}
          onChange={(event) => onCityDraftChange(event.target.value)}
          size="small"
          value={cityDraft}
        />
        <Button type="submit" variant="contained">
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
      {hotels ? <HotelsMapView hotels={hotels} /> : null}
    </Box>
  )
}
