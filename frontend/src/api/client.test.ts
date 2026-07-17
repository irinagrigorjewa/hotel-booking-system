import {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { tokenStorage } from '../auth/tokenStorage'
import type { TokenPair } from '../types/auth'
import { createApiClient } from './client'

const initialTokens: TokenPair = {
  access_token: 'expired-access',
  refresh_token: 'refresh-token',
  token_type: 'bearer',
}

const refreshedTokens: TokenPair = {
  access_token: 'new-access',
  refresh_token: 'new-refresh-token',
  token_type: 'bearer',
}

const response = <Data>(
  config: InternalAxiosRequestConfig,
  status: number,
  data: Data,
): AxiosResponse<Data> => ({
  config,
  data,
  headers: {},
  status,
  statusText: '',
})

const unauthorized = (config: InternalAxiosRequestConfig): Promise<never> =>
  Promise.reject(
    new AxiosError(
      'Unauthorized',
      undefined,
      config,
      {},
      response(config, 401, { detail: 'Unauthorized' }),
    ),
  )

afterEach(() => {
  window.localStorage.clear()
})

describe('apiClient', () => {
  it('refreshes once and retries a protected request with the new access token', async () => {
    tokenStorage.save(initialTokens)
    const requests: InternalAxiosRequestConfig[] = []
    const onSessionExpired = vi.fn()
    const adapter: AxiosAdapter = async (config) => {
      requests.push(config)

      if (config.url === '/auth/refresh') {
        return response(config, 200, refreshedTokens)
      }

      const protectedRequests = requests.filter(
        ({ url }) => url === '/protected-resource',
      )

      if (protectedRequests.length === 1) {
        return unauthorized(config)
      }

      return response(config, 200, { id: 1 })
    }
    const client = createApiClient({ adapter, onSessionExpired })

    await expect(client.get('/protected-resource')).resolves.toMatchObject({
      data: { id: 1 },
    })

    expect(
      requests.filter(({ url }) => url === '/auth/refresh'),
    ).toHaveLength(1)
    expect(requests[2]?.headers.Authorization).toBe('Bearer new-access')
    expect(tokenStorage.read()).toEqual(refreshedTokens)
    expect(onSessionExpired).not.toHaveBeenCalled()
  })

  it('shares one refresh request between parallel unauthorized requests', async () => {
    tokenStorage.save(initialTokens)
    const requests: InternalAxiosRequestConfig[] = []
    const adapter: AxiosAdapter = async (config) => {
      requests.push(config)

      if (config.url === '/auth/refresh') {
        return response(config, 200, refreshedTokens)
      }

      const requestCount = requests.filter(
        ({ url }) => url === '/protected-resource',
      ).length

      if (requestCount <= 2) {
        return unauthorized(config)
      }

      return response(config, 200, { id: requestCount })
    }
    const client = createApiClient({ adapter })

    await expect(
      Promise.all([
        client.get('/protected-resource'),
        client.get('/protected-resource'),
      ]),
    ).resolves.toHaveLength(2)

    expect(
      requests.filter(({ url }) => url === '/auth/refresh'),
    ).toHaveLength(1)
  })

  it('clears the session after a second unauthorized response without another retry loop', async () => {
    tokenStorage.save(initialTokens)
    const requests: InternalAxiosRequestConfig[] = []
    const onSessionExpired = vi.fn()
    const adapter: AxiosAdapter = async (config) => {
      requests.push(config)

      if (config.url === '/auth/refresh') {
        return response(config, 200, refreshedTokens)
      }

      return unauthorized(config)
    }
    const client = createApiClient({ adapter, onSessionExpired })

    await expect(client.get('/protected-resource')).rejects.toBeInstanceOf(
      AxiosError,
    )

    expect(
      requests.filter(({ url }) => url === '/auth/refresh'),
    ).toHaveLength(1)
    expect(tokenStorage.read()).toBeNull()
    expect(onSessionExpired).toHaveBeenCalledTimes(1)
  })
})
