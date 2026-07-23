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

import type { HotelSort } from '@entities/hotel/model/types'
import { STAR_OPTIONS } from '@shared/config/domainOptions'
import { APP_HEADER_STICKY_TOP_PX } from '@shared/layout/appHeaderSticky'
import { elevation, radius } from '@shared/theme/tokens'

import { parseStarsSelect } from '../model/parseFilters'

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
    onChange({
      ...value,
      stars: parseStarsSelect(event.target.value),
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
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: `${radius.md}px`,
        boxShadow: elevation[1],
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1.5,
        mb: 2,
        position: 'sticky',
        px: 1.5,
        py: 1.5,
        top: {
          xs: APP_HEADER_STICKY_TOP_PX.xs,
          sm: APP_HEADER_STICKY_TOP_PX.sm,
        },
        zIndex: 2,
      }}
    >
      <TextField
        label={t('common.city')}
        onChange={(event) =>
          onChange({ ...value, city: event.target.value })
        }
        size="small"
        sx={{ flex: '1 1 160px', minWidth: 140 }}
        value={value.city}
      />
      <FormControl size="small" sx={{ flex: '0 1 120px', minWidth: 120 }}>
        <InputLabel id="hotel-stars-filter-label">{t('common.stars')}</InputLabel>
        <Select
          label={t('common.stars')}
          labelId="hotel-stars-filter-label"
          onChange={handleStarsChange}
          value={value.stars === '' ? '' : String(value.stars)}
        >
          <MenuItem value="">{t('common.all')}</MenuItem>
          {STAR_OPTIONS.map((star) => (
            <MenuItem key={star} value={String(star)}>
              {star}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {showSort ? (
        <FormControl size="small" sx={{ flex: '0 1 160px', minWidth: 140 }}>
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
