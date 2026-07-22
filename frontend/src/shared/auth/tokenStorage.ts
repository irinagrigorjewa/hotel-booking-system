import type { TokenPair } from '@entities/user/model/auth-types'

const storageKey = 'auth_tokens'

const isTokenPair = (value: unknown): value is TokenPair => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const tokens = value as Record<string, unknown>

  return (
    typeof tokens.access_token === 'string' &&
    typeof tokens.refresh_token === 'string' &&
    tokens.token_type === 'bearer'
  )
}

export const tokenStorage = {
  save: (tokens: TokenPair): void => {
    window.localStorage.setItem(storageKey, JSON.stringify(tokens))
  },
  read: (): TokenPair | null => {
    const serializedTokens = window.localStorage.getItem(storageKey)

    if (!serializedTokens) {
      return null
    }

    try {
      const tokens: unknown = JSON.parse(serializedTokens)

      return isTokenPair(tokens) ? tokens : null
    } catch {
      return null
    }
  },
  clear: (): void => {
    window.localStorage.removeItem(storageKey)
  },
}
