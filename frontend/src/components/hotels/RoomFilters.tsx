import { Box, Button, TextField } from '@mui/material'

export interface RoomFiltersValue {
  capacity: string
  price_from: string
  price_to: string
  date_from: string
  date_to: string
}

interface RoomFiltersProps {
  value: RoomFiltersValue
  onChange: (next: RoomFiltersValue) => void
  onApply: () => void
}

export const RoomFilters = ({ value, onChange, onApply }: RoomFiltersProps) => (
  <Box
    component="form"
    onSubmit={(event) => {
      event.preventDefault()
      onApply()
    }}
    sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}
  >
    <TextField
      label="Вместимость"
      onChange={(event) => onChange({ ...value, capacity: event.target.value })}
      size="small"
      type="number"
      value={value.capacity}
    />
    <TextField
      label="Цена от"
      onChange={(event) =>
        onChange({ ...value, price_from: event.target.value })
      }
      size="small"
      type="number"
      value={value.price_from}
    />
    <TextField
      label="Цена до"
      onChange={(event) => onChange({ ...value, price_to: event.target.value })}
      size="small"
      type="number"
      value={value.price_to}
    />
    <TextField
      InputLabelProps={{ shrink: true }}
      label="Заезд"
      onChange={(event) =>
        onChange({ ...value, date_from: event.target.value })
      }
      size="small"
      type="date"
      value={value.date_from}
    />
    <TextField
      InputLabelProps={{ shrink: true }}
      label="Выезд"
      onChange={(event) => onChange({ ...value, date_to: event.target.value })}
      size="small"
      type="date"
      value={value.date_to}
    />
    <Button type="submit" variant="contained">
      Применить
    </Button>
  </Box>
)
