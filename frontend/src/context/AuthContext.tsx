import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'
import i18n from '../i18n'

import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from '../api/auth'
import { tokenStorage } from '../auth/tokenStorage'
import type { LoginRequest, RegisterRequest, TokenPair, User } from '../types/auth'

interface AuthContextValue {
  user: User | null
  tokens: TokenPair | null
  loading: boolean
  error: Error | null
  login: (credentials: LoginRequest) => Promise<void>
  register: (credentials: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  restoreSession: () => Promise<void>
  applyUser: (nextUser: User) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const toError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(i18n.t('errors.authRequestFailed'))

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null)
  const [tokens, setTokens] = useState<TokenPair | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const clearSession = useCallback(() => {
    tokenStorage.clear()
    setTokens(null)
    setUser(null)
  }, [])

  useEffect(() => {
    const handleSessionExpired = (): void => {
      clearSession()
    }
    const handleTokensRefreshed = (event: Event): void => {
      const tokenEvent = event as CustomEvent<TokenPair>

      setTokens(tokenEvent.detail)
    }

    window.addEventListener('auth:session-expired', handleSessionExpired)
    window.addEventListener('auth:tokens-refreshed', handleTokensRefreshed)

    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired)
      window.removeEventListener('auth:tokens-refreshed', handleTokensRefreshed)
    }
  }, [clearSession])

  const loadUser = useCallback(async (tokenPair: TokenPair): Promise<void> => {
    tokenStorage.save(tokenPair)
    setTokens(tokenPair)

    const currentUser = await getCurrentUser(tokenPair.access_token)

    setUser(currentUser)
  }, [])

  const restoreSession = useCallback(async (): Promise<void> => {
    const storedTokens = tokenStorage.read()

    if (!storedTokens) {
      setLoading(false)

      return
    }

    setLoading(true)
    setError(null)

    try {
      await loadUser(storedTokens)
    } catch (caughtError) {
      clearSession()
      setError(toError(caughtError))
    } finally {
      setLoading(false)
    }
  }, [clearSession, loadUser])

  useEffect(() => {
    void restoreSession()
  }, [restoreSession])

  const authenticate = useCallback(
    async (request: () => Promise<TokenPair>): Promise<void> => {
      setLoading(true)
      setError(null)

      try {
        await loadUser(await request())
      } catch (caughtError) {
        clearSession()
        const authError = toError(caughtError)
        setError(authError)
        throw authError
      } finally {
        setLoading(false)
      }
    },
    [clearSession, loadUser],
  )

  const login = useCallback(
    async (credentials: LoginRequest): Promise<void> => {
      await authenticate(() => loginRequest(credentials))
    },
    [authenticate],
  )

  const register = useCallback(
    async (credentials: RegisterRequest): Promise<void> => {
      await authenticate(() => registerRequest(credentials))
    },
    [authenticate],
  )

  const logout = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      if (tokens) {
        await logoutRequest(tokens.access_token, tokens.refresh_token)
      }
    } catch (caughtError) {
      setError(toError(caughtError))
    } finally {
      clearSession()
      setLoading(false)
    }
  }, [clearSession, tokens])

  const applyUser = useCallback((nextUser: User): void => {
    setUser(nextUser)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        loading,
        error,
        login,
        register,
        logout,
        restoreSession,
        applyUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(i18n.t('auth.providerRequired'))
  }

  return context
}
