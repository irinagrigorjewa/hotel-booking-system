import { Alert, Button, Grid, Paper, Skeleton, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { HotelCard } from '@entities/hotel/ui/HotelCard'
import type { HotelListItem } from '@entities/hotel/model/types'
import { SKELETON_CARD_KEYS } from '@shared/config/domainOptions'
import { elevation, radius } from '@shared/theme/tokens'

interface HotelCatalogStateProps {
  isLoading: boolean
  isError: boolean
  items: HotelListItem[]
  onRetry: () => void
  emptyMessage?: string
}

const SKELETON_HEIGHT = 280

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
            <Skeleton
              height={SKELETON_HEIGHT}
              sx={{ borderRadius: `${radius.md}px` }}
              variant="rounded"
            />
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
        sx={{ borderRadius: `${radius.md}px` }}
        variant="outlined"
      >
        {t('hotels.loadFailed')}
      </Alert>
    )
  }

  if (items.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: `${radius.md}px`,
          boxShadow: elevation[0],
          px: 3,
          py: 6,
          textAlign: 'center',
        }}
      >
        <Typography color="text.secondary" component="p" variant="body1">
          {emptyText}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
          {t('hotels.emptyHint')}
        </Typography>
      </Paper>
    )
  }

  return (
    <Grid container spacing={2}>
      {items.map((hotel) => (
        <Grid key={hotel.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <HotelCard hotel={hotel} />
        </Grid>
      ))}
    </Grid>
  )
}
