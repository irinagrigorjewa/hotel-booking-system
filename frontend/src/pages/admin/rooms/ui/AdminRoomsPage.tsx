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

import { useNotify } from '@app/providers/NotificationProvider'
import { useHotels } from '@entities/hotel/api/queries/useHotels'

import { AdminRoomImageGallery } from '@features/admin-room/ui/AdminRoomImageGallery'
import { RoomForm } from '@features/admin-room/ui/RoomForm'
import { RoomImageUpload } from '@features/admin-room/ui/RoomImageUpload'
import { AdminFormSection } from '@shared/ui/AdminFormSection'
import { AdminPageHeader } from '@shared/ui/AdminPageHeader'
import { ConfirmDialog } from '@shared/ui/ConfirmDialog'
import { useRoomMutations } from '@entities/room/api/mutations/useRoomMutations'
import { useRoom } from '@entities/room/api/queries/useRoom'
import { useRoomTypes } from '@entities/room-type/api/queries/useRoomTypes'
import { useRooms } from '@entities/room/api/queries/useRooms'
import type { Room, RoomWritePayload } from '@entities/room/model/types'

export const AdminRoomsPage = () => {
  const { t } = useTranslation()
  const { notifySuccess, notifyApiError } = useNotify()
  const hotelsQuery = useHotels({ page: 1, size: 100, sort: 'created_at' })
  const roomTypesQuery = useRoomTypes()
  const roomsQuery = useRooms({ page: 1, size: 100 })
  const { createRoom, updateRoom, deleteRoom } = useRoomMutations()
  const [editing, setEditing] = useState<Room | null>(null)
  const [formError, setFormError] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  const editingRoomDetail = useRoom(editing?.id ?? 0)

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
    } finally {
      setPendingDeleteId(null)
    }
  }

  return (
    <Box>
      <AdminPageHeader title={t('admin.roomsTitle')} />
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
      {editing ? (
        <AdminFormSection title={t('admin.roomPhotos')}>
          <AdminRoomImageGallery roomId={editing.id} />
          <RoomImageUpload
            imagesCount={editingRoomDetail.data?.images.length ?? 0}
            roomId={editing.id}
          />
        </AdminFormSection>
      ) : null}
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
                  onClick={() => setPendingDeleteId(room.id)}
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
      <ConfirmDialog
        isConfirming={deleteRoom.isPending}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId !== null) {
            void handleDelete(pendingDeleteId)
          }
        }}
        open={pendingDeleteId !== null}
        title={t('common.confirmDelete')}
      />
    </Box>
  )
}
