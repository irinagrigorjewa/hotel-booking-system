import { Box, Button, Pagination } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

import type { HotelListItem } from '@entities/hotel/model/types'
import {
  HotelFilters,
  type HotelFiltersValue,
} from '@features/hotel-filters/ui/HotelFilters'
import { HotelCatalogState } from '@shared/ui/HotelCatalogState'

interface HotelCatalogPagination {
  count: number
  page: number
  onChange: (page: number) => void
}

interface HotelCatalogProps {
  isLoading: boolean
  isError: boolean
  items: HotelListItem[]
  onRetry: () => void
  emptyMessage?: string
  filters?: HotelFiltersValue
  onFiltersChange?: (value: HotelFiltersValue) => void
  showSort?: boolean
  mapHref?: string
  mapLabel?: string
  pagination?: HotelCatalogPagination | null
}

export const HotelCatalog = ({
  isLoading,
  isError,
  items,
  onRetry,
  emptyMessage,
  filters,
  onFiltersChange,
  showSort = true,
  mapHref,
  mapLabel,
  pagination = null,
}: HotelCatalogProps) => (
  <Box>
    {filters && onFiltersChange ? (
      <HotelFilters onChange={onFiltersChange} showSort={showSort} value={filters} />
    ) : null}
    {mapHref && mapLabel ? (
      <Button
        color="secondary"
        component={RouterLink}
        size="small"
        sx={{ mb: 2 }}
        to={mapHref}
        variant="outlined"
      >
        {mapLabel}
      </Button>
    ) : null}
    <HotelCatalogState
      emptyMessage={emptyMessage}
      isError={isError}
      isLoading={isLoading}
      items={items}
      onRetry={onRetry}
    />
    {pagination && pagination.count > 0 && !isLoading && !isError ? (
      <Pagination
        color="primary"
        count={pagination.count}
        onChange={(_, page) => pagination.onChange(page)}
        page={pagination.page}
        shape="rounded"
        sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}
      />
    ) : null}
  </Box>
)
