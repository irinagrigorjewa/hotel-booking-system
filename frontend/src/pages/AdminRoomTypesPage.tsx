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

import { RoomTypeForm } from '../components/admin/room-types/RoomTypeForm'
import { AdminErrorAlert } from '../components/admin/shared/AdminErrorAlert'
import { AdminFormSection } from '../components/admin/shared/AdminFormSection'
import { AdminPageHeader } from '../components/admin/shared/AdminPageHeader'
import { useNotify } from '@app/providers/NotificationProvider'
import { useRoomTypeMutations } from '../hooks/useRoomTypeMutations'
import { useRoomTypes } from '../hooks/useRoomTypes'
import type { RoomType } from '../types/roomType'

export const AdminRoomTypesPage = () => {
  const { t } = useTranslation()
  const { notifySuccess, notifyApiError } = useNotify()
  const roomTypesQuery = useRoomTypes()
  const { createRoomType, updateRoomType, deleteRoomType } =
    useRoomTypeMutations()
  const [editing, setEditing] = useState<RoomType | null>(null)
  const [formError, setFormError] = useState('')

  const isSubmitting = createRoomType.isPending || updateRoomType.isPending

  const handleSubmit = async (name: string): Promise<void> => {
    setFormError('')

    try {
      if (editing) {
        await updateRoomType.mutateAsync({
          roomTypeId: editing.id,
          payload: { name },
        })
        setEditing(null)
      } else {
        await createRoomType.mutateAsync({ name })
      }
      notifySuccess('notifications.roomTypeSaved')
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        setFormError(t('admin.roomTypesDuplicateName'))
        return
      }

      notifyApiError(error, 'admin.roomTypesSaveFailed')
    }
  }

  const handleDelete = async (roomTypeId: number): Promise<void> => {
    try {
      await deleteRoomType.mutateAsync(roomTypeId)
      if (editing?.id === roomTypeId) {
        setEditing(null)
      }
      notifySuccess('notifications.roomTypeDeleted')
    } catch (error) {
      notifyApiError(error, 'admin.roomTypesDeleteFailed')
    }
  }

  return (
    <Box>
      <AdminPageHeader
        links={[{ label: t('admin.nav.hotels'), to: '/admin/hotels' }]}
        title={t('admin.roomTypesTitle')}
      />
      {roomTypesQuery.isError ? (
        <AdminErrorAlert
          message={t('admin.roomTypesLoadFailed')}
          onRetry={() => {
            void roomTypesQuery.refetch()
          }}
          retryLabel={t('common.retry')}
        />
      ) : null}
      <AdminFormSection
        title={editing ? t('admin.roomTypesEditTitle') : t('admin.roomTypesNewTitle')}
      >
        <RoomTypeForm
          initialRoomType={editing}
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
          submitError={formError}
        />
      </AdminFormSection>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('common.name')}</TableCell>
            <TableCell align="right">{t('admin.colActions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(roomTypesQuery.data?.items ?? []).map((roomType) => (
            <TableRow key={roomType.id}>
              <TableCell>{roomType.name}</TableCell>
              <TableCell align="right">
                <Button onClick={() => setEditing(roomType)} size="small">
                  {t('common.edit')}
                </Button>
                <Button
                  color="error"
                  disabled={deleteRoomType.isPending}
                  onClick={() => {
                    void handleDelete(roomType.id)
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
      {!roomTypesQuery.isLoading &&
      (roomTypesQuery.data?.items.length ?? 0) === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          {t('admin.roomTypesEmpty')}
        </Typography>
      ) : null}
    </Box>
  )
}
