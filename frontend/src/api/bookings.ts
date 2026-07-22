import { cancelBooking } from '@entities/booking/api/requests/cancelBooking'
import { createBooking } from '@entities/booking/api/requests/createBooking'
import { getBooking } from '@entities/booking/api/requests/getBooking'
import { listBookings } from '@entities/booking/api/requests/listBookings'
import { updateBookingStatus } from '@entities/booking/api/requests/updateBookingStatus'

/** @deprecated Prefer `@entities/booking/api/requests/*` */
export const bookingsApi = {
  list: listBookings,
  getById: getBooking,
  create: createBooking,
  cancel: cancelBooking,
  updateStatus: updateBookingStatus,
}
