import { deleteImage } from '@entities/image/api/requests/deleteImage'
import { updateImageSortOrder } from '@entities/image/api/requests/updateImageSortOrder'
import { uploadHotelImage } from '@entities/image/api/requests/uploadHotelImage'
import { uploadRoomImage } from '@entities/image/api/requests/uploadRoomImage'

/** @deprecated Prefer `@entities/image/api/requests/*` */
export const imagesApi = {
  uploadHotelImage,
  uploadRoomImage,
  updateSortOrder: updateImageSortOrder,
  remove: deleteImage,
}

export type { ImageOut } from '@entities/image/model/types'
