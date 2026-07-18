import { Box, Button, Link, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'

import { HotelCatalogState } from '../components/hotels/HotelCatalogState'
import { useHotels } from '../hooks/useHotels'

export const HomePage = () => {
  const navigate = useNavigate()
  const [cityDraft, setCityDraft] = useState('')
  const [city, setCity] = useState('')
  const hotelsQuery = useHotels({
    city: city || undefined,
    page: 1,
    size: 6,
    sort: 'avg_rating',
  })

  const search = (): void => {
    const nextCity = cityDraft.trim()
    setCity(nextCity)
    navigate(nextCity ? `/hotels?city=${encodeURIComponent(nextCity)}` : '/hotels')
  }

  return (
    <Box>
      <Typography component="h1" gutterBottom variant="h3">
        Hotel Booking System
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Найдите отель для следующей поездки.
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
          label="Город"
          onChange={(event) => setCityDraft(event.target.value)}
          size="small"
          value={cityDraft}
        />
        <Button type="submit" variant="contained">
          Найти
        </Button>
      </Box>
      <Typography component="h2" gutterBottom variant="h5">
        Популярные отели
      </Typography>
      <HotelCatalogState
        isError={hotelsQuery.isError}
        isLoading={hotelsQuery.isLoading}
        items={hotelsQuery.data?.items ?? []}
        onRetry={() => {
          void hotelsQuery.refetch()
        }}
      />
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button component={RouterLink} to="/hotels" variant="outlined">
          Все отели
        </Button>
        <Button component={RouterLink} to="/hotels/map">
          Открыть карту
        </Button>
      </Box>
      <Typography sx={{ mt: 2 }}>
        <Link component={RouterLink} to="/hotels">
          Перейти в каталог
        </Link>
      </Typography>
    </Box>
  )
}
