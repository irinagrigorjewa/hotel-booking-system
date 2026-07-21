import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { HotelForm } from '../components/admin/hotels/HotelForm'
import { HotelImageUpload } from '../components/admin/hotels/HotelImageUpload'
import { AdminErrorAlert } from '../components/admin/shared/AdminErrorAlert'
import { AdminFormSection } from '../components/admin/shared/AdminFormSection'
import { AdminPageHeader } from '../components/admin/shared/AdminPageHeader'
import { useHotelMutations } from '../hooks/useHotelMutations'
import { useHotels } from '../hooks/useHotels'
import type { HotelListItem, HotelWritePayload } from '../types/hotel'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

export const AdminHotelsPage = () => {
  const { t } = useTranslation()
  const hotelsQuery = useHotels({ page: 1, size: 100, sort: 'created_at' })
  const { createHotel, updateHotel, deleteHotel } = useHotelMutations()
  const [editingHotel, setEditingHotel] = useState<HotelListItem | null>(null)
  const [formError, setFormError] = useState('')
  const [actionError, setActionError] = useState('')

  const isSubmitting = createHotel.isPending || updateHotel.isPending

  const handleSubmit = async (payload: HotelWritePayload): Promise<void> => {
    setFormError('')

    try {
      if (editingHotel) {
        await updateHotel.mutateAsync({ hotelId: editingHotel.id, payload })
        setEditingHotel(null)
      } else {
        await createHotel.mutateAsync(payload)
      }
    } catch (error) {
      setFormError(getApiErrorMessage(error, t('admin.hotelsSaveFailed'), (key) => t(key)))
    }
  }

  const handleDelete = async (hotelId: number): Promise<void> => {
    setActionError('')

    try {
      await deleteHotel.mutateAsync(hotelId)
      if (editingHotel?.id === hotelId) {
        setEditingHotel(null)
      }
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, t('admin.hotelsDeleteFailed'), (key) => t(key)),
      )
    }
  }

  return (
    <Box>
      <AdminPageHeader
        links={[{ label: t('admin.nav.roomTypes'), to: '/admin/room-types' }]}
        title={t('admin.hotelsTitle')}
      />
      {hotelsQuery.isError ? (
        <AdminErrorAlert
          message={t('admin.hotelsLoadFailed')}
          onRetry={() => {
            void hotelsQuery.refetch()
          }}
          retryLabel={t('common.retry')}
        />
      ) : null}
      {actionError ? <AdminErrorAlert message={actionError} /> : null}
      <AdminFormSection
        title={editingHotel ? t('admin.hotelsEditTitle') : t('admin.hotelsNewTitle')}
      >
        <HotelForm
          initialHotel={editingHotel}
          isSubmitting={isSubmitting}
          onCancel={
            editingHotel
              ? () => {
                  setEditingHotel(null)
                  setFormError('')
                }
              : undefined
          }
          onSubmit={handleSubmit}
          submitError={formError}
        />
      </AdminFormSection>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('common.name')}</TableCell>
            <TableCell>{t('common.city')}</TableCell>
            <TableCell>{t('common.stars')}</TableCell>
            <TableCell>{t('admin.colCoordinates')}</TableCell>
            <TableCell align="right">{t('admin.colActions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(hotelsQuery.data?.items ?? []).map((hotel) => (
            <TableRow key={hotel.id}>
              <TableCell>{hotel.name}</TableCell>
              <TableCell>{hotel.city}</TableCell>
              <TableCell>{hotel.stars}</TableCell>
              <TableCell>
                {hotel.latitude}, {hotel.longitude}
              </TableCell>
              <TableCell align="right">
                <HotelImageUpload hotelId={hotel.id} />
                <Button onClick={() => setEditingHotel(hotel)} size="small">
                  {t('common.edit')}
                </Button>
                <Button
                  color="error"
                  disabled={deleteHotel.isPending}
                  onClick={() => {
                    void handleDelete(hotel.id)
                  }}
                  size="small"
                >
                  {t('common.delete')}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!hotelsQuery.isLoading && (hotelsQuery.data?.items.length ?? 0) === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          {t('admin.hotelsEmpty')}
        </Typography>
      ) : null}
    </Box>
  )
}
