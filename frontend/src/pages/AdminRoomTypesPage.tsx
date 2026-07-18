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

import { RoomTypeForm } from '../components/admin/room-types/RoomTypeForm'
import { useRoomTypeMutations } from '../hooks/useRoomTypeMutations'
import { useRoomTypes } from '../hooks/useRoomTypes'
import type { RoomType } from '../types/roomType'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

export const AdminRoomTypesPage = () => {
  const roomTypesQuery = useRoomTypes()
  const { createRoomType, updateRoomType, deleteRoomType } =
    useRoomTypeMutations()
  const [editing, setEditing] = useState<RoomType | null>(null)
  const [formError, setFormError] = useState('')
  const [actionError, setActionError] = useState('')

  const isSubmitting = createRoomType.isPending || updateRoomType.isPending

  const handleSubmit = async (name: string): Promise<void> => {
    setFormError('')

    try {
      if (editing) {
        await updateRoomType.mutateAsync({
          roomTypeId: editing.id,
          payload: { name },
        })
        setEditing(null)
      } else {
        await createRoomType.mutateAsync({ name })
      }
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        setFormError('Тип номера с таким названием уже существует')
        return
      }

      setFormError(getApiErrorMessage(error, 'Не удалось сохранить тип номера'))
    }
  }

  const handleDelete = async (roomTypeId: number): Promise<void> => {
    setActionError('')

    try {
      await deleteRoomType.mutateAsync(roomTypeId)
      if (editing?.id === roomTypeId) {
        setEditing(null)
      }
    } catch (error) {
      setActionError(getApiErrorMessage(error, 'Не удалось удалить тип номера'))
    }
  }

  return (
    <Box>
      <Typography component="h1" gutterBottom variant="h4">
        Админ: типы номеров
      </Typography>
      <Typography sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/admin/hotels">
          Отели
        </Link>
      </Typography>
      {roomTypesQuery.isError ? (
        <Alert
          action={
            <Button
              color="inherit"
              onClick={() => {
                void roomTypesQuery.refetch()
              }}
              size="small"
            >
              Повторить
            </Button>
          }
          severity="error"
          sx={{ mb: 2 }}
        >
          Не удалось загрузить типы номеров
        </Alert>
      ) : null}
      {actionError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      ) : null}
      <Paper sx={{ mb: 3, p: 2 }} variant="outlined">
        <Typography component="h2" gutterBottom variant="h6">
          {editing ? 'Редактирование типа' : 'Новый тип номера'}
        </Typography>
        <RoomTypeForm
          initialRoomType={editing}
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
          submitError={formError}
        />
      </Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Название</TableCell>
            <TableCell align="right">Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(roomTypesQuery.data?.items ?? []).map((roomType) => (
            <TableRow key={roomType.id}>
              <TableCell>{roomType.name}</TableCell>
              <TableCell align="right">
                <Button onClick={() => setEditing(roomType)} size="small">
                  Изменить
                </Button>
                <Button
                  color="error"
                  disabled={deleteRoomType.isPending}
                  onClick={() => {
                    void handleDelete(roomType.id)
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
      {!roomTypesQuery.isLoading &&
      (roomTypesQuery.data?.items.length ?? 0) === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Типы номеров ещё не созданы
        </Typography>
      ) : null}
    </Box>
  )
}
