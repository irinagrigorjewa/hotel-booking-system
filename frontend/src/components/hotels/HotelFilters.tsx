import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  type SelectChangeEvent,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()

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
        label={t('common.city')}
        onChange={(event) =>
          onChange({ ...value, city: event.target.value })
        }
        size="small"
        value={value.city}
      />
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="hotel-stars-filter-label">{t('common.stars')}</InputLabel>
        <Select
          label={t('common.stars')}
          labelId="hotel-stars-filter-label"
          onChange={handleStarsChange}
          value={value.stars === '' ? '' : String(value.stars)}
        >
          <MenuItem value="">{t('common.all')}</MenuItem>
          {[1, 2, 3, 4, 5].map((star) => (
            <MenuItem key={star} value={String(star)}>
              {star}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {showSort ? (
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="hotel-sort-filter-label">{t('common.sort')}</InputLabel>
          <Select
            label={t('common.sort')}
            labelId="hotel-sort-filter-label"
            onChange={handleSortChange}
            value={value.sort}
          >
            <MenuItem value="created_at">{t('hotels.sortByDate')}</MenuItem>
            <MenuItem value="stars">{t('hotels.sortByStars')}</MenuItem>
            <MenuItem value="avg_rating">{t('hotels.sortByRating')}</MenuItem>
          </Select>
        </FormControl>
      ) : null}
    </Box>
  )
}
