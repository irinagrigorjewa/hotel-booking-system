import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

import { useBookingForm } from '@features/booking-create/model/useBookingForm'
import { fonts, radius } from '@shared/theme/tokens'

export const BookingNewPage = () => {
  const { t } = useTranslation()
  const {
    roomId,
    room,
    isLoading,
    isError,
    form,
    nights,
    totalPreview,
    checkInRules,
    checkOutRules,
    submit,
    isPending,
  } = useBookingForm()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form

  if (!roomId) {
    return <Alert severity="warning">{t('bookings.selectRoom')}</Alert>
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (isError || !room) {
    return <Alert severity="error">{t('bookings.roomLoadFailed')}</Alert>
  }

  return (
    <Paper
      component="form"
      elevation={0}
      noValidate
      onSubmit={handleSubmit(submit)}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: `${radius.lg}px`,
        maxWidth: 480,
        p: { xs: 2.5, sm: 3.5 },
      }}
    >
      <Typography
        component="h1"
        gutterBottom
        sx={{ fontFamily: fonts.display, fontWeight: 700, letterSpacing: '-0.02em' }}
        variant="h4"
      >
        {t('bookings.newTitle')}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {t('bookings.roomSummary', {
          hotel: room.hotel.name,
          number: room.number,
          price: room.price,
        })}
      </Typography>
      <Stack spacing={2.5}>
        <TextField
          InputLabelProps={{ shrink: true }}
          error={Boolean(errors.check_in)}
          fullWidth
          helperText={errors.check_in?.message}
          label={t('hotels.checkIn')}
          type="date"
          {...register('check_in', checkInRules)}
        />
        <TextField
          InputLabelProps={{ shrink: true }}
          error={Boolean(errors.check_out)}
          fullWidth
          helperText={errors.check_out?.message}
          label={t('hotels.checkOut')}
          type="date"
          {...register('check_out', checkOutRules)}
        />
        <Typography variant="body1">
          {nights > 0 && totalPreview
            ? t('bookings.nightsAndTotal', { nights, total: totalPreview })
            : t('bookings.nightsPlaceholder')}
        </Typography>
        <Button
          color="cta"
          disabled={isSubmitting || isPending}
          type="submit"
          variant="contained"
        >
          {t('bookings.submit')}
        </Button>
      </Stack>
    </Paper>
  )
}
