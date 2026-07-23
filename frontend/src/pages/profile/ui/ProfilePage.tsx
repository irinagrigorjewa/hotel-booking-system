import { Box, Button, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'

import { useNotify } from '@app/providers/NotificationProvider'
import { useBookingMutations } from '@entities/booking/api/mutations/useBookingMutations'
import { useBookings } from '@entities/booking/api/queries/useBookings'
import { useUserMutations } from '@entities/user/api/mutations/useUserMutations'
import { useAuth } from '@features/auth/ui/AuthContext'
import { fonts } from '@shared/theme/tokens'
import { ProfileAccountTab } from '@widgets/profile/ui/ProfileAccountTab'
import { ProfileBookingsTab } from '@widgets/profile/ui/ProfileBookingsTab'

export const ProfilePage = () => {
  const { t } = useTranslation()
  const { notifySuccess, notifyApiError } = useNotify()
  const { user, applyUser } = useAuth()
  const [searchParams] = useSearchParams()
  const showBookings = searchParams.get('tab') !== 'account'
  const { data, isLoading, isError } = useBookings({ page: 1, size: 50 })
  const { cancelBooking } = useBookingMutations()
  const { patchMe } = useUserMutations()
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')

  const handleCancel = async (bookingId: number): Promise<void> => {
    if (!window.confirm(t('bookings.cancelConfirm'))) {
      return
    }

    setCancellingId(bookingId)

    try {
      await cancelBooking.mutateAsync(bookingId)
      notifySuccess('notifications.bookingCancelled')
    } catch (error) {
      notifyApiError(error, 'errors.cancelBookingFailed')
    } finally {
      setCancellingId(null)
    }
  }

  const handleSaveProfile = async (): Promise<void> => {
    try {
      const updated = await patchMe.mutateAsync({
        name: name.trim(),
        phone: phone.trim() ? phone.trim() : null,
      })
      applyUser(updated)
      notifySuccess('notifications.profileSaved')
    } catch (error) {
      notifyApiError(error, 'errors.saveProfileFailed')
    }
  }

  return (
    <Box>
      <Typography
        component="h1"
        gutterBottom
        sx={{ fontFamily: fonts.display, fontWeight: 700, letterSpacing: '-0.02em' }}
        variant="h4"
      >
        {t('bookings.profileTitle')}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {user?.name} · {user?.email}
      </Typography>
      <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mb: 3.5 }}>
        <Button
          component={RouterLink}
          to="/profile?tab=account"
          variant={!showBookings ? 'contained' : 'outlined'}
        >
          {t('profile.tabAccount')}
        </Button>
        <Button
          component={RouterLink}
          to="/profile?tab=bookings"
          variant={showBookings ? 'contained' : 'outlined'}
        >
          {t('bookings.tab')}
        </Button>
      </Stack>
      {!showBookings ? (
        <ProfileAccountTab
          isSaving={patchMe.isPending}
          name={name}
          onNameChange={setName}
          onPhoneChange={setPhone}
          onSave={() => {
            void handleSaveProfile()
          }}
          phone={phone}
          user={user}
        />
      ) : null}
      {showBookings ? (
        <ProfileBookingsTab
          bookings={data?.items}
          cancellingId={cancellingId}
          isError={isError}
          isLoading={isLoading}
          onCancel={(bookingId) => {
            void handleCancel(bookingId)
          }}
        />
      ) : null}
    </Box>
  )
}
