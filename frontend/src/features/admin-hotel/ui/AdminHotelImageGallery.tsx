import { Box, Button, CircularProgress, Typography } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useNotify } from '@app/providers/NotificationProvider'
import { useHotel } from '@entities/hotel/api/queries/useHotel'
import { deleteImageMutationOptions } from '@entities/image/api/mutations/deleteImageMutationOptions'
import { mediaUrl } from '@shared/lib/mediaUrl'
import { ConfirmDialog } from '@shared/ui/ConfirmDialog'

interface AdminHotelImageGalleryProps {
  hotelId: number
}

export const AdminHotelImageGallery = ({
  hotelId,
}: AdminHotelImageGalleryProps) => {
  const { t } = useTranslation()
  const { notifySuccess, notifyApiError } = useNotify()
  const queryClient = useQueryClient()
  const hotelQuery = useHotel(hotelId)
  const deleteMutation = useMutation(
    deleteImageMutationOptions(queryClient, hotelId),
  )
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  const hotel = hotelQuery.data
  const images = hotel?.images ?? []

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

  if (hotelQuery.isLoading) {
    return (
      <Box aria-busy="true" sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  if (images.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        {t('admin.hotelPhotosEmpty')}
      </Typography>
    )
  }

  return (
    <Box>
      <Box
        aria-label={t('admin.hotelPhotos')}
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
        {images.map((image) => {
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
                alt={t('hotels.gallery.photoAlt', {
                  hotelName: hotel?.name ?? '',
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
              <Box sx={{ p: 1 }}>
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
