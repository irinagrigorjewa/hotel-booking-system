import {
  Alert,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { useHotelsMap } from '@entities/hotel/api/queries/useHotelsMap'
import { useDebouncedValue } from '@shared/lib/useDebouncedValue'

import { HotelsMapView } from '../components/hotels/HotelsMapView'

export const HotelsMapPage = () => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const cityFilter = searchParams.get('city') ?? ''
  const [cityDraft, setCityDraft] = useState(cityFilter)
  const debouncedCity = useDebouncedValue(cityDraft, 350)
  const mapQuery = useHotelsMap(cityFilter || undefined)

  useEffect(() => {
    setCityDraft(cityFilter)
  }, [cityFilter])

  useEffect(() => {
    const next = debouncedCity.trim()
    const current = cityFilter.trim()
    if (next === current) {
      return
    }
    if (next) {
      setSearchParams({ city: next })
    } else {
      setSearchParams({})
    }
  }, [debouncedCity, cityFilter, setSearchParams])

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
