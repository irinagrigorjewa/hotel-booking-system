import axios, {
  type AxiosAdapter,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios'

import { tokenStorage } from '../auth/tokenStorage'
import type { TokenPair } from '../types/auth'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'
const refreshRequestKey = 'refresh'
const refreshRequests = new Map<string, Promise<TokenPair>>()
const authenticationPaths = ['/auth/login', '/auth/register', '/auth/refresh']

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

interface ApiClientOptions {
  adapter?: AxiosAdapter
  onSessionExpired?: () => void
}

const isAuthenticationRequest = (url: string | undefined): boolean =>
  authenticationPaths.some((path) => url?.includes(path))

const notifySessionExpired = (): void => {
  window.dispatchEvent(new Event('auth:session-expired'))
}

const refreshTokens = (client: AxiosInstance): Promise<TokenPair> => {
  const activeRequest = refreshRequests.get(refreshRequestKey)

  if (activeRequest) {
    return activeRequest
  }

  const tokens = tokenStorage.read()

  if (!tokens) {
    return Promise.reject(new Error('Refresh token is missing'))
  }

  const request = client
    .post<TokenPair>('/auth/refresh', { refresh_token: tokens.refresh_token })
    .then(({ data }) => {
      tokenStorage.save(data)
      window.dispatchEvent(
        new CustomEvent<TokenPair>('auth:tokens-refreshed', { detail: data }),
      )

      return data
    })
    .finally(() => {
      refreshRequests.delete(refreshRequestKey)
    })

  refreshRequests.set(refreshRequestKey, request)

  return request
}

export const createApiClient = ({
  adapter,
  onSessionExpired = notifySessionExpired,
}: ApiClientOptions = {}): AxiosInstance => {
  const client = axios.create({
    adapter,
    baseURL: apiBaseUrl,
  })

  client.interceptors.request.use((config) => {
    const tokens = tokenStorage.read()

    if (tokens) {
      config.headers.set('Authorization', `Bearer ${tokens.access_token}`)
    }

    return config
  })

  client.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!axios.isAxiosError(error) || error.response?.status !== 401) {
        return Promise.reject(error)
      }

      const originalRequest = error.config as RetryableRequestConfig | undefined

      if (
        !originalRequest ||
        originalRequest._retry ||
        isAuthenticationRequest(originalRequest.url)
      ) {
        if (!isAuthenticationRequest(originalRequest?.url)) {
          tokenStorage.clear()
          onSessionExpired()
        }

        return Promise.reject(error)
      }

      originalRequest._retry = true

      try {
        const tokens = await refreshTokens(client)

        originalRequest.headers.set(
          'Authorization',
          `Bearer ${tokens.access_token}`,
        )

        return client.request(originalRequest)
      } catch {
        tokenStorage.clear()
        onSessionExpired()

        return Promise.reject(error)
      }
    },
  )

  return client
}

export const apiClient = createApiClient()
