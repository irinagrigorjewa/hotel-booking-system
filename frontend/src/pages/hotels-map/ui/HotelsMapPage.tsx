import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useHotelsMap } from '@entities/hotel/api/queries/useHotelsMap'
import { useDebouncedCityFilter } from '@features/hotel-search/model/useDebouncedCityFilter'
import { HotelsMapSection } from '@widgets/hotels-map/ui/HotelsMapSection'

export const HotelsMapPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const cityFilter = searchParams.get('city') ?? ''
  const { cityDraft, setCityDraft, debouncedCity } =
    useDebouncedCityFilter(cityFilter)
  const mapQuery = useHotelsMap(cityFilter || undefined)

  useEffect(() => {
    const next = debouncedCity.trim()
    const current = cityFilter.trim()
    if (next === current) {
      return
    }
    if (next) {
      setSearchParams({ city: next })
    } else {
      setSearchParams({})
    }
  }, [debouncedCity, cityFilter, setSearchParams])

  const applyCity = (): void => {
    const next = cityDraft.trim()
    if (next) {
      setSearchParams({ city: next })
    } else {
      setSearchParams({})
    }
  }

  return (
    <HotelsMapSection
      cityDraft={cityDraft}
      hotels={mapQuery.data?.items}
      isError={mapQuery.isError}
      isLoading={mapQuery.isLoading}
      onApplyCity={applyCity}
      onCityDraftChange={setCityDraft}
    />
  )
}
