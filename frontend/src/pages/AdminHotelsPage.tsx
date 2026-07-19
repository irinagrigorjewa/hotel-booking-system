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
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'

import { HotelForm } from '../components/admin/hotels/HotelForm'
import { HotelImageUpload } from '../components/admin/hotels/HotelImageUpload'
import { useHotelMutations } from '../hooks/useHotelMutations'
import { useHotels } from '../hooks/useHotels'
import type { HotelListItem, HotelWritePayload } from '../types/hotel'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

export const AdminHotelsPage = () => {
  const hotelsQuery = useHotels({ page: 1, size: 100, sort: 'created_at' })
  const { createHotel, updateHotel, deleteHotel } = useHotelMutations()
  const [editingHotel, setEditingHotel] = useState<HotelListItem | null>(null)
  const [formError, setFormError] = useState('')
  const [actionError, setActionError] = useState('')

  const isSubmitting = createHotel.isPending || updateHotel.isPending

  const handleSubmit = async (payload: HotelWritePayload): Promise<void> => {
    setFormError('')

    try {
      if (editingHotel) {
        await updateHotel.mutateAsync({ hotelId: editingHotel.id, payload })
        setEditingHotel(null)
      } else {
        await createHotel.mutateAsync(payload)
      }
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Не удалось сохранить отель'))
    }
  }

  const handleDelete = async (hotelId: number): Promise<void> => {
    setActionError('')

    try {
      await deleteHotel.mutateAsync(hotelId)
      if (editingHotel?.id === hotelId) {
        setEditingHotel(null)
      }
    } catch (error) {
      setActionError(getApiErrorMessage(error, 'Не удалось удалить отель'))
    }
  }

  return (
    <Box>
      <Typography component="h1" gutterBottom variant="h4">
        Админ: отели
      </Typography>
      <Typography sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/admin/room-types">
          Типы номеров
        </Link>
      </Typography>
      {hotelsQuery.isError ? (
        <Alert
          action={
            <Button
              color="inherit"
              onClick={() => {
                void hotelsQuery.refetch()
              }}
              size="small"
            >
              Повторить
            </Button>
          }
          severity="error"
          sx={{ mb: 2 }}
        >
          Не удалось загрузить список отелей
        </Alert>
      ) : null}
      {actionError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      ) : null}
      <Paper sx={{ mb: 3, p: 2 }} variant="outlined">
        <Typography component="h2" gutterBottom variant="h6">
          {editingHotel ? 'Редактирование отеля' : 'Новый отель'}
        </Typography>
        <HotelForm
          initialHotel={editingHotel}
          isSubmitting={isSubmitting}
          onCancel={
            editingHotel
              ? () => {
                  setEditingHotel(null)
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
            <TableCell>Город</TableCell>
            <TableCell>Звёзды</TableCell>
            <TableCell>Координаты</TableCell>
            <TableCell align="right">Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(hotelsQuery.data?.items ?? []).map((hotel) => (
            <TableRow key={hotel.id}>
              <TableCell>{hotel.name}</TableCell>
              <TableCell>{hotel.city}</TableCell>
              <TableCell>{hotel.stars}</TableCell>
              <TableCell>
                {hotel.latitude}, {hotel.longitude}
              </TableCell>
              <TableCell align="right">
                <HotelImageUpload hotelId={hotel.id} />
                <Button onClick={() => setEditingHotel(hotel)} size="small">
                  Изменить
                </Button>
                <Button
                  color="error"
                  disabled={deleteHotel.isPending}
                  onClick={() => {
                    void handleDelete(hotel.id)
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
      {!hotelsQuery.isLoading && (hotelsQuery.data?.items.length ?? 0) === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Отели ещё не созданы
        </Typography>
      ) : null}
    </Box>
  )
}
