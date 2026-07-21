import { Box, Button, TextField } from '@mui/material'
import { useTranslation } from 'react-i18next'

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

export const RoomFilters = ({ value, onChange, onApply }: RoomFiltersProps) => {
  const { t } = useTranslation()

  return (
    <Box
      component="form"
      onSubmit={(event) => {
        event.preventDefault()
        onApply()
      }}
      sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}
    >
      <TextField
        label={t('rooms.filters.capacity')}
        onChange={(event) => onChange({ ...value, capacity: event.target.value })}
        size="small"
        type="number"
        value={value.capacity}
      />
      <TextField
        label={t('rooms.filters.priceFrom')}
        onChange={(event) =>
          onChange({ ...value, price_from: event.target.value })
        }
        size="small"
        type="number"
        value={value.price_from}
      />
      <TextField
        label={t('rooms.filters.priceTo')}
        onChange={(event) => onChange({ ...value, price_to: event.target.value })}
        size="small"
        type="number"
        value={value.price_to}
      />
      <TextField
        InputLabelProps={{ shrink: true }}
        label={t('rooms.filters.checkIn')}
        onChange={(event) =>
          onChange({ ...value, date_from: event.target.value })
        }
        size="small"
        type="date"
        value={value.date_from}
      />
      <TextField
        InputLabelProps={{ shrink: true }}
        label={t('rooms.filters.checkOut')}
        onChange={(event) => onChange({ ...value, date_to: event.target.value })}
        size="small"
        type="date"
        value={value.date_to}
      />
      <Button type="submit" variant="contained">
        {t('rooms.filters.apply')}
      </Button>
    </Box>
  )
}
