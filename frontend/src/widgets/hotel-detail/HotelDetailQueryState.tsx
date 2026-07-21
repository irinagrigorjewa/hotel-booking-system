import { Alert, Box, Button, Link, Skeleton } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

type HotelDetailQueryStateProps =
  | { status: 'loading' }
  | { status: 'notFound' }
  | { status: 'error'; onRetry: () => void }

export const HotelDetailQueryState = (props: HotelDetailQueryStateProps) => {
  const { t } = useTranslation()

  if (props.status === 'loading') {
    return (
      <Box>
        <Skeleton height={48} width="60%" />
        <Skeleton height={24} sx={{ mt: 2 }} width="40%" />
        <Skeleton height={120} sx={{ mt: 3 }} />
      </Box>
    )
  }

  if (props.status === 'notFound') {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t('hotels.detailNotFound')}
        </Alert>
        <Link component={RouterLink} to="/hotels">
          {t('common.returnToCatalog')}
        </Link>
      </Box>
    )
  }

  return (
    <Alert
      action={
        <Button color="inherit" onClick={props.onRetry} size="small">
          {t('common.retry')}
        </Button>
      }
      severity="error"
    >
      {t('hotels.detailLoadFailed')}
    </Alert>
  )
}
