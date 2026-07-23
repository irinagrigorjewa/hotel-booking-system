import { Box, Button, CircularProgress, Typography } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useNotify } from '@app/providers/NotificationProvider'
import { deleteImageMutationOptions } from '@entities/image/api/mutations/deleteImageMutationOptions'
import { updateImageSortOrderMutationOptions } from '@entities/image/api/mutations/updateImageSortOrderMutationOptions'
import { useRoom } from '@entities/room/api/queries/useRoom'
import { mediaUrl } from '@shared/lib/mediaUrl'
import { ConfirmDialog } from '@shared/ui/ConfirmDialog'

interface AdminRoomImageGalleryProps {
  roomId: number
}

export const AdminRoomImageGallery = ({
  roomId,
}: AdminRoomImageGalleryProps) => {
  const { t } = useTranslation()
  const { notifySuccess, notifyApiError } = useNotify()
  const queryClient = useQueryClient()
  const roomQuery = useRoom(roomId)
  const deleteMutation = useMutation(
    deleteImageMutationOptions(queryClient, { roomId }),
  )
  const reorderMutation = useMutation(
    updateImageSortOrderMutationOptions(queryClient, { roomId }),
  )
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  const room = roomQuery.data
  const images = [...(room?.images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order || a.id - b.id,
  )

  const handleConfirmDelete = async (): Promise<void> => {
    if (pendingDeleteId === null) {
      return
    }

    try {
      await deleteMutation.mutateAsync(pendingDeleteId)
      notifySuccess('notifications.imageDeleted')
    } catch (error) {
      notifyApiError(error, 'errors.deleteImageFailed')
    } finally {
      setPendingDeleteId(null)
    }
  }

  const handleMove = async (index: number, direction: -1 | 1): Promise<void> => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= images.length) {
      return
    }

    const reordered = [...images]
    const [moved] = reordered.splice(index, 1)
    if (!moved) {
      return
    }
    reordered.splice(targetIndex, 0, moved)

    const updates = reordered
      .map((image, sortOrder) => ({ imageId: image.id, sortOrder }))
      .filter((update, sortOrder) => images[sortOrder]?.id !== update.imageId)

    try {
      await reorderMutation.mutateAsync(updates)
    } catch (error) {
      notifyApiError(error, 'errors.reorderImageFailed')
    }
  }

  if (roomQuery.isLoading) {
    return (
      <Box aria-busy="true" sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  if (images.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        {t('admin.roomPhotosEmpty')}
      </Typography>
    )
  }

  return (
    <Box>
      <Box
        aria-label={t('admin.roomPhotos')}
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(4, 1fr)',
          },
        }}
      >
        {images.map((image, index) => {
          const src = mediaUrl(image.url)

          if (!src) {
            return null
          }

          return (
            <Box
              key={image.id}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              <Box
                alt={t('rooms.gallery.photoAlt', {
                  roomNumber: room?.number ?? '',
                  order: image.sort_order,
                })}
                component="img"
                src={src}
                sx={{
                  aspectRatio: '4 / 3',
                  display: 'block',
                  objectFit: 'cover',
                  width: '100%',
                }}
              />
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.5,
                  p: 1,
                }}
              >
                <Button
                  disabled={index === 0 || reorderMutation.isPending}
                  onClick={() => {
                    void handleMove(index, -1)
                  }}
                  size="small"
                  type="button"
                >
                  {t('admin.movePhotoLeft')}
                </Button>
                <Button
                  disabled={
                    index === images.length - 1 || reorderMutation.isPending
                  }
                  onClick={() => {
                    void handleMove(index, 1)
                  }}
                  size="small"
                  type="button"
                >
                  {t('admin.movePhotoRight')}
                </Button>
                <Button
                  color="error"
                  onClick={() => setPendingDeleteId(image.id)}
                  size="small"
                  type="button"
                >
                  {t('common.delete')}
                </Button>
              </Box>
            </Box>
          )
        })}
      </Box>
      <ConfirmDialog
        description={t('admin.confirmDeletePhoto')}
        isConfirming={deleteMutation.isPending}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          void handleConfirmDelete()
        }}
        open={pendingDeleteId !== null}
        title={t('admin.confirmDeletePhotoTitle')}
      />
    </Box>
  )
}
