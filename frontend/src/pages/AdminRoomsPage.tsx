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
import { isAxiosError } from 'axios'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { RoomForm } from '../components/admin/rooms/RoomForm'
import { AdminFormSection } from '../components/admin/shared/AdminFormSection'
import { AdminPageHeader } from '../components/admin/shared/AdminPageHeader'
import { useNotify } from '@app/providers/NotificationProvider'
import { useHotels } from '../hooks/useHotels'
import { useRoomMutations } from '../hooks/useRoomMutations'
import { useRoomTypes } from '../hooks/useRoomTypes'
import { useRooms } from '../hooks/useRooms'
import type { Room, RoomWritePayload } from '../types/room'

export const AdminRoomsPage = () => {
  const { t } = useTranslation()
  const { notifySuccess, notifyApiError } = useNotify()
  const hotelsQuery = useHotels({ page: 1, size: 100, sort: 'created_at' })
  const roomTypesQuery = useRoomTypes()
  const roomsQuery = useRooms({ page: 1, size: 100 })
  const { createRoom, updateRoom, deleteRoom } = useRoomMutations()
  const [editing, setEditing] = useState<Room | null>(null)
  const [formError, setFormError] = useState('')

  const isSubmitting = createRoom.isPending || updateRoom.isPending

  const handleSubmit = async (payload: RoomWritePayload): Promise<void> => {
    setFormError('')

    try {
      if (editing) {
        await updateRoom.mutateAsync({ roomId: editing.id, payload })
        setEditing(null)
      } else {
        await createRoom.mutateAsync(payload)
      }
      notifySuccess('notifications.roomSaved')
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        setFormError(t('admin.roomsDuplicateNumber'))
        return
      }

      notifyApiError(error, 'admin.roomsSaveFailed')
    }
  }

  const handleDelete = async (roomId: number): Promise<void> => {
    try {
      await deleteRoom.mutateAsync(roomId)
      if (editing?.id === roomId) {
        setEditing(null)
      }
      notifySuccess('notifications.roomDeleted')
    } catch (error) {
      notifyApiError(error, 'admin.roomsDeleteFailed')
    }
  }

  return (
    <Box>
      <AdminPageHeader
        links={[
          { label: t('admin.nav.hotels'), to: '/admin/hotels' },
          { label: t('admin.nav.roomTypes'), to: '/admin/room-types' },
        ]}
        title={t('admin.roomsTitle')}
      />
      <AdminFormSection
        title={editing ? t('admin.roomsEditTitle') : t('admin.roomsNewTitle')}
      >
        <RoomForm
          hotels={hotelsQuery.data?.items ?? []}
          initialRoom={editing}
          isSubmitting={isSubmitting}
          onCancel={
            editing
              ? () => {
                  setEditing(null)
                  setFormError('')
                }
              : undefined
          }
          onSubmit={handleSubmit}
          roomTypes={roomTypesQuery.data?.items ?? []}
          submitError={formError}
        />
      </AdminFormSection>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('nav.adminHotels')}</TableCell>
            <TableCell>{t('admin.colNumber')}</TableCell>
            <TableCell>{t('admin.colType')}</TableCell>
            <TableCell>{t('common.price')}</TableCell>
            <TableCell>{t('hotels.capacity')}</TableCell>
            <TableCell>{t('admin.colStatus')}</TableCell>
            <TableCell align="right">{t('admin.colActions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(roomsQuery.data?.items ?? []).map((room) => (
            <TableRow key={room.id}>
              <TableCell>{room.hotel.name}</TableCell>
              <TableCell>{room.number}</TableCell>
              <TableCell>{room.room_type.name}</TableCell>
              <TableCell>{room.price}</TableCell>
              <TableCell>{room.capacity}</TableCell>
              <TableCell>{t(`enums.room.${room.status}`)}</TableCell>
              <TableCell align="right">
                <Button onClick={() => setEditing(room)} size="small">
                  {t('common.edit')}
                </Button>
                <Button
                  color="error"
                  disabled={deleteRoom.isPending}
                  onClick={() => {
                    void handleDelete(room.id)
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
      {!roomsQuery.isLoading && (roomsQuery.data?.items.length ?? 0) === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          {t('admin.roomsEmpty')}
        </Typography>
      ) : null}
    </Box>
  )
}
