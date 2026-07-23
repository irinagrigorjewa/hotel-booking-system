import { Box, Button, Typography } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { useNotify } from '@app/providers/NotificationProvider'
import { uploadRoomImageMutationOptions } from '@entities/image/api/mutations/uploadRoomImageMutationOptions'

const MAX_ROOM_IMAGES = 10
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

interface RoomImageUploadProps {
  roomId: number
  imagesCount: number
}

export const RoomImageUpload = ({
  roomId,
  imagesCount,
}: RoomImageUploadProps) => {
  const { t } = useTranslation()
  const { notifySuccess, notifyError, notifyApiError } = useNotify()
  const queryClient = useQueryClient()
  const uploadMutation = useMutation(uploadRoomImageMutationOptions(queryClient))

  const atLimit = imagesCount >= MAX_ROOM_IMAGES
  const isUploading = uploadMutation.isPending
  const isDisabled = atLimit || isUploading

  const onFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file || atLimit) {
      return
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      notifyError('errors.invalidImageType')
      return
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      notifyError('errors.imageTooLarge')
      return
    }

    try {
      await uploadMutation.mutateAsync({ roomId, file })
      notifySuccess('notifications.imageUploaded')
    } catch (uploadError) {
      notifyApiError(uploadError, 'errors.uploadImageFailed')
    }
  }

  return (
    <Box sx={{ mt: 1 }}>
      {atLimit ? (
        <Typography color="text.secondary" sx={{ mb: 1 }} variant="body2">
          {t('admin.roomPhotosLimitReached')}
        </Typography>
      ) : null}
      <Button component="label" disabled={isDisabled} size="small">
        {isUploading ? t('common.loading') : t('admin.uploadPhoto')}
        <input
          accept="image/jpeg,image/png,image/webp"
          disabled={isDisabled}
          hidden
          onChange={(event) => {
            void onFileChange(event)
          }}
          type="file"
        />
      </Button>
    </Box>
  )
}
