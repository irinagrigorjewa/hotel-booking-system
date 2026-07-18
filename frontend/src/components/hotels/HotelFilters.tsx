import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  type SelectChangeEvent,
} from '@mui/material'

import type { HotelSort } from '../../types/hotel'

export interface HotelFiltersValue {
  city: string
  stars: number | ''
  sort: HotelSort
}

interface HotelFiltersProps {
  value: HotelFiltersValue
  onChange: (next: HotelFiltersValue) => void
  showSort?: boolean
}

export const HotelFilters = ({
  value,
  onChange,
  showSort = true,
}: HotelFiltersProps) => {
  const handleStarsChange = (event: SelectChangeEvent<string>): void => {
    const nextStars = event.target.value

    onChange({
      ...value,
      stars: nextStars === '' ? '' : Number(nextStars),
    })
  }

  const handleSortChange = (event: SelectChangeEvent<HotelSort>): void => {
    onChange({
      ...value,
      sort: event.target.value,
    })
  }

  return (
    <Box
      component="form"
      onSubmit={(event) => event.preventDefault()}
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        mb: 3,
      }}
    >
      <TextField
        label="Город"
        onChange={(event) =>
          onChange({ ...value, city: event.target.value })
        }
        size="small"
        value={value.city}
      />
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="hotel-stars-filter-label">Звёзды</InputLabel>
        <Select
          label="Звёзды"
          labelId="hotel-stars-filter-label"
          onChange={handleStarsChange}
          value={value.stars === '' ? '' : String(value.stars)}
        >
          <MenuItem value="">Все</MenuItem>
          {[1, 2, 3, 4, 5].map((star) => (
            <MenuItem key={star} value={String(star)}>
              {star}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {showSort ? (
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="hotel-sort-filter-label">Сортировка</InputLabel>
          <Select
            label="Сортировка"
            labelId="hotel-sort-filter-label"
            onChange={handleSortChange}
            value={value.sort}
          >
            <MenuItem value="created_at">По дате</MenuItem>
            <MenuItem value="stars">По звёздам</MenuItem>
            <MenuItem value="avg_rating">По рейтингу</MenuItem>
          </Select>
        </FormControl>
      ) : null}
    </Box>
  )
}
