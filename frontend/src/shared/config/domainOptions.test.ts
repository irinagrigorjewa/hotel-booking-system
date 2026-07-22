import { describe, expect, it } from 'vitest'

import {
  BOOKING_STATUS_OPTIONS,
  SKELETON_CARD_COUNT,
  SKELETON_CARD_KEYS,
  STAR_OPTIONS,
} from './domainOptions'

describe('domainOptions', () => {
  it('exposes star options 1–5 for select maps', () => {
    expect([...STAR_OPTIONS]).toEqual([1, 2, 3, 4, 5])
  })

  it('exposes all booking statuses for filter maps', () => {
    expect([...BOOKING_STATUS_OPTIONS]).toEqual([
      'PENDING',
      'CONFIRMED',
      'CANCELLED',
      'COMPLETED',
    ])
  })

  it('exposes skeleton keys matching SKELETON_CARD_COUNT', () => {
    expect(SKELETON_CARD_KEYS).toHaveLength(SKELETON_CARD_COUNT)
    expect(SKELETON_CARD_KEYS).toEqual([0, 1, 2, 3, 4, 5])
  })
})
