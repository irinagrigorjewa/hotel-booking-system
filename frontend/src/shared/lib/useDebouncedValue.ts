import { useEffect, useState } from 'react'

export const useDebouncedValue = <T,>(value: T, delayMs = 350): T => {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebounced(value)
    }, delayMs)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [value, delayMs])

  return debounced
}
