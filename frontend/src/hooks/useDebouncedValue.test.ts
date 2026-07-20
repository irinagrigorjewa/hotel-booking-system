import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useDebouncedValue } from './useDebouncedValue'

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('Moscow', 350))

    expect(result.current).toBe('Moscow')
  })

  it('does not update until the delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 350),
      { initialProps: { value: 'M' } },
    )

    rerender({ value: 'Mo' })
    rerender({ value: 'Mos' })

    act(() => {
      vi.advanceTimersByTime(349)
    })
    expect(result.current).toBe('M')

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('Mos')
  })

  it('defaults delay to 350ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value),
      { initialProps: { value: 'a' } },
    )

    rerender({ value: 'ab' })

    act(() => {
      vi.advanceTimersByTime(349)
    })
    expect(result.current).toBe('a')

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('ab')
  })

  it('resets the timer on each value change', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 350),
      { initialProps: { value: 'x' } },
    )

    rerender({ value: 'xy' })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    rerender({ value: 'xyz' })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current).toBe('x')

    act(() => {
      vi.advanceTimersByTime(150)
    })
    expect(result.current).toBe('xyz')
  })
})
