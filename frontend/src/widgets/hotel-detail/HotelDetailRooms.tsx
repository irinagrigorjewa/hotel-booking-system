import { Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { useRooms } from '@entities/room/api/queries/useRooms'
import { RoomList } from '@entities/room/ui/RoomList'
import { RoomFilters } from '@features/room-filters/ui/RoomFilters'
import { useRoomListSearchParams } from '@features/room-filters/model/useRoomListSearchParams'

interface HotelDetailRoomsProps {
  hotelId: number
}

export const HotelDetailRooms = ({ hotelId }: HotelDetailRoomsProps) => {
  const { t } = useTranslation()
  const {
    draftFilters,
    setDraftFilters,
    applyFilters,
    roomParams,
    dateFrom,
    dateTo,
  } = useRoomListSearchParams(hotelId)
  const roomsQuery = useRooms(roomParams)

  return (
    <>
      <Typography component="h2" gutterBottom variant="h5">
        {t('hotels.roomsSection')}
      </Typography>
      <RoomFilters
        onApply={applyFilters}
        onChange={setDraftFilters}
        value={draftFilters}
      />
      <RoomList
        dateFrom={dateFrom}
        dateTo={dateTo}
        isError={roomsQuery.isError}
        isLoading={roomsQuery.isLoading}
        onRetry={() => {
          void roomsQuery.refetch()
        }}
        rooms={roomsQuery.data?.items ?? []}
      />
    </>
  )
}
