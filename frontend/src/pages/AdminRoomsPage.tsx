import {
  Alert,
  Box,
  Button,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { isAxiosError } from 'axios'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'

import { RoomForm } from '../components/admin/rooms/RoomForm'
import { useHotels } from '../hooks/useHotels'
import { useRoomMutations } from '../hooks/useRoomMutations'
import { useRoomTypes } from '../hooks/useRoomTypes'
import { useRooms } from '../hooks/useRooms'
import type { Room, RoomWritePayload } from '../types/room'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

export const AdminRoomsPage = () => {
  const hotelsQuery = useHotels({ page: 1, size: 100, sort: 'created_at' })
  const roomTypesQuery = useRoomTypes()
  const roomsQuery = useRooms({ page: 1, size: 100 })
  const { createRoom, updateRoom, deleteRoom } = useRoomMutations()
  const [editing, setEditing] = useState<Room | null>(null)
  const [formError, setFormError] = useState('')
  const [actionError, setActionError] = useState('')

  const isSubmitting = createRoom.isPending || updateRoom.isPending

  const handleSubmit = async (payload: RoomWritePayload): Promise<void> => {
    setFormError('')

    try {
      if (editing) {
        await updateRoom.mutateAsync({ roomId: editing.id, payload })
        setEditing(null)
      } else {
        await createRoom.mutateAsync(payload)
      }
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        setFormError('Номер комнаты уже существует в этом отеле')
        return
      }

      setFormError(getApiErrorMessage(error, 'Не удалось сохранить номер'))
    }
  }

  const handleDelete = async (roomId: number): Promise<void> => {
    setActionError('')

    try {
      await deleteRoom.mutateAsync(roomId)
      if (editing?.id === roomId) {
        setEditing(null)
      }
    } catch (error) {
      setActionError(getApiErrorMessage(error, 'Не удалось удалить номер'))
    }
  }

  return (
    <Box>
      <Typography component="h1" gutterBottom variant="h4">
        Админ: номера
      </Typography>
      <Typography sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/admin/hotels" sx={{ mr: 2 }}>
          Отели
        </Link>
        <Link component={RouterLink} to="/admin/room-types">
          Типы номеров
        </Link>
      </Typography>
      {actionError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      ) : null}
      <Paper sx={{ mb: 3, p: 2 }} variant="outlined">
        <Typography component="h2" gutterBottom variant="h6">
          {editing ? 'Редактирование номера' : 'Новый номер'}
        </Typography>
        <RoomForm
          hotels={hotelsQuery.data?.items ?? []}
          initialRoom={editing}
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
          roomTypes={roomTypesQuery.data?.items ?? []}
          submitError={formError}
        />
      </Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Отель</TableCell>
            <TableCell>Номер</TableCell>
            <TableCell>Тип</TableCell>
            <TableCell>Цена</TableCell>
            <TableCell>Вместимость</TableCell>
            <TableCell>Статус</TableCell>
            <TableCell align="right">Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(roomsQuery.data?.items ?? []).map((room) => (
            <TableRow key={room.id}>
              <TableCell>{room.hotel.name}</TableCell>
              <TableCell>{room.number}</TableCell>
              <TableCell>{room.room_type.name}</TableCell>
              <TableCell>{room.price}</TableCell>
              <TableCell>{room.capacity}</TableCell>
              <TableCell>{room.status}</TableCell>
              <TableCell align="right">
                <Button onClick={() => setEditing(room)} size="small">
                  Изменить
                </Button>
                <Button
                  color="error"
                  disabled={deleteRoom.isPending}
                  onClick={() => {
                    void handleDelete(room.id)
                  }}
                  size="small"
                >
                  Удалить
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!roomsQuery.isLoading && (roomsQuery.data?.items.length ?? 0) === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Номера ещё не созданы
        </Typography>
      ) : null}
    </Box>
  )
}
