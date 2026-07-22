import { afterEach, describe, expect, it } from 'vitest'

import { tokenStorage } from './tokenStorage'

const tokenPair = {
  access_token: 'access-token',
  refresh_token: 'refresh-token',
  token_type: 'bearer' as const,
}

afterEach(() => {
  window.localStorage.clear()
})

describe('tokenStorage', () => {
  it('returns the saved token pair', () => {
    tokenStorage.save(tokenPair)

    expect(tokenStorage.read()).toEqual(tokenPair)
  })

  it('clears saved tokens', () => {
    tokenStorage.save(tokenPair)
    tokenStorage.clear()

    expect(tokenStorage.read()).toBeNull()
  })
})
