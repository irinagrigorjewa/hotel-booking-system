import { Alert, Box, Button, Grid, Skeleton, Typography } from '@mui/material'

import type { HotelListItem } from '../../types/hotel'
import { HotelCard } from './HotelCard'

interface HotelCatalogStateProps {
  isLoading: boolean
  isError: boolean
  items: HotelListItem[]
  onRetry: () => void
  emptyMessage?: string
}

export const HotelCatalogState = ({
  isLoading,
  isError,
  items,
  onRetry,
  emptyMessage = 'Отели не найдены',
}: HotelCatalogStateProps) => {
  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 6 }, (_, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
            <Skeleton height={180} variant="rounded" />
          </Grid>
        ))}
      </Grid>
    )
  }

  if (isError) {
    return (
      <Alert
        action={
          <Button color="inherit" onClick={onRetry} size="small">
            Повторить
          </Button>
        }
        severity="error"
      >
        Не удалось загрузить отели
      </Alert>
    )
  }

  if (items.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Box>
    )
  }

  return (
    <Grid container spacing={2}>
      {items.map((hotel) => (
        <Grid key={hotel.id} size={{ xs: 12, sm: 6, md: 4 }}>
          <HotelCard hotel={hotel} />
        </Grid>
      ))}
    </Grid>
  )
}
