import { Box, Button, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { type ChangeEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { imagesApi } from '../../../api/images'
import { useNotify } from '@app/providers/NotificationProvider'

interface HotelImageUploadProps {
  hotelId: number
}

export const HotelImageUpload = ({ hotelId }: HotelImageUploadProps) => {
  const { t } = useTranslation()
  const { notifySuccess, notifyApiError } = useNotify()
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState(false)

  const onFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    setUploading(true)

    try {
      await imagesApi.uploadHotelImage(hotelId, file)
      await queryClient.invalidateQueries({ queryKey: ['hotels'] })
      await queryClient.invalidateQueries({ queryKey: ['hotel', hotelId] })
      notifySuccess('notifications.imageUploaded')
    } catch (uploadError) {
      notifyApiError(uploadError, 'errors.uploadImageFailed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="body2">{t('admin.hotelPhotos')}</Typography>
      <Button component="label" disabled={uploading} size="small" sx={{ mt: 1 }}>
        {uploading ? t('common.loading') : t('admin.uploadPhoto')}
        <input
          accept="image/jpeg,image/png,image/webp"
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
