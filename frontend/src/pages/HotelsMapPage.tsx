import {
  Alert,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { HotelsMapView } from '../components/hotels/HotelsMapView'
import { useHotelsMap } from '../hooks/useHotelsMap'

export const HotelsMapPage = () => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const cityFilter = searchParams.get('city') ?? ''
  const [cityDraft, setCityDraft] = useState(cityFilter)
  const mapQuery = useHotelsMap(cityFilter || undefined)

  const applyCity = (): void => {
    const next = cityDraft.trim()
    if (next) {
      setSearchParams({ city: next })
    } else {
      setSearchParams({})
    }
  }

  return (
    <Box>
      <Typography component="h1" gutterBottom variant="h4">
        {t('map.title')}
      </Typography>
      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault()
          applyCity()
        }}
        sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}
      >
        <TextField
          label={t('common.city')}
          onChange={(event) => setCityDraft(event.target.value)}
          size="small"
          value={cityDraft}
        />
        <Button type="submit" variant="contained">
          {t('common.filter')}
        </Button>
      </Box>
      {mapQuery.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : null}
      {mapQuery.isError ? (
        <Alert severity="error">{t('map.loadFailed')}</Alert>
      ) : null}
      {mapQuery.data && mapQuery.data.items.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t('map.empty')}
        </Alert>
      ) : null}
      {mapQuery.data ? <HotelsMapView hotels={mapQuery.data.items} /> : null}
    </Box>
  )
}
