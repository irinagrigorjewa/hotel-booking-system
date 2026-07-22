import { nightsBetween } from '@shared/lib/bookingDates'

export const parseRoomId = (value: string | null): number => {
  if (!value) {
    return 0
  }

  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0
}

export const validateCheckIn = (
  value: string,
  today: string,
  pastMessage: string,
): true | string => (value >= today ? true : pastMessage)

export const validateCheckOut = (
  checkIn: string,
  checkOut: string,
  messages: { after: string; maxNights: string },
): true | string => {
  const count = nightsBetween(checkIn, checkOut)

  if (count < 1) {
    return messages.after
  }
  if (count > 30) {
    return messages.maxNights
  }

  return true
}
