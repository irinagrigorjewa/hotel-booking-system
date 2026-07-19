import { Alert, Box, Button, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useState, type ChangeEvent } from 'react'

import { imagesApi } from '../../../api/images'
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage'

interface HotelImageUploadProps {
  hotelId: number
}

export const HotelImageUpload = ({ hotelId }: HotelImageUploadProps) => {
  const queryClient = useQueryClient()
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const onFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    setError('')
    setUploading(true)

    try {
      await imagesApi.uploadHotelImage(hotelId, file)
      await queryClient.invalidateQueries({ queryKey: ['hotels'] })
      await queryClient.invalidateQueries({ queryKey: ['hotel', hotelId] })
    } catch (uploadError) {
      setError(getApiErrorMessage(uploadError, 'Не удалось загрузить фото'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="body2">Фото отеля</Typography>
      <Button component="label" disabled={uploading} size="small" sx={{ mt: 1 }}>
        {uploading ? 'Загрузка…' : 'Загрузить фото'}
        <input
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(event) => {
            void onFileChange(event)
          }}
          type="file"
        />
      </Button>
      {error ? (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      ) : null}
    </Box>
  )
}
