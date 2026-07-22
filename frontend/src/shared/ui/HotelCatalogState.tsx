import { Alert, Box, Button, Grid, Skeleton, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { HotelCard } from '@entities/hotel/ui/HotelCard'
import type { HotelListItem } from '@entities/hotel/model/types'
import { SKELETON_CARD_KEYS } from '@shared/config/domainOptions'

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
  emptyMessage,
}: HotelCatalogStateProps) => {
  const { t } = useTranslation()
  const emptyText = emptyMessage ?? t('hotels.notFound')

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {SKELETON_CARD_KEYS.map((index) => (
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
            {t('common.retry')}
          </Button>
        }
        severity="error"
      >
        {t('hotels.loadFailed')}
      </Alert>
    )
  }

  if (items.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">{emptyText}</Typography>
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
