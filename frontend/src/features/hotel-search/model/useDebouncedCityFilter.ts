import { useEffect, useState } from 'react'

import { useDebouncedValue } from '@shared/lib/useDebouncedValue'

/** Shared city draft + debounce used by Home / Hotels / Map. */
export const useDebouncedCityFilter = (
  syncedCity = '',
  delayMs = 350,
) => {
  const [cityDraft, setCityDraft] = useState(syncedCity)
  const debouncedCity = useDebouncedValue(cityDraft, delayMs)

  useEffect(() => {
    setCityDraft(syncedCity)
  }, [syncedCity])

  return { cityDraft, setCityDraft, debouncedCity }
}
