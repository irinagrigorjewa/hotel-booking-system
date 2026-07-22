import { AxiosError } from 'axios'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { tokenStorage } from '@shared/auth/tokenStorage'
import type { TokenPair } from '../../types/auth'
import { server } from '@shared/test/server'
import { createApiClient } from '@shared/api/client'

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

beforeEach(() => {
  window.localStorage.clear()
})

describe('apiClient', () => {
  it('refreshes once and retries a protected request with the new access token', async () => {
    tokenStorage.save(initialTokens)
    const onSessionExpired = vi.fn()
    const protectedRequests = vi.fn()
    const refreshRequests = vi.fn()
    server.use(
      http.get('*/api/v1/protected-resource', ({ request }) => {
        protectedRequests(request)

        if (protectedRequests.mock.calls.length === 1) {
          return HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 })
        }

        return HttpResponse.json({ id: 1 })
      }),
      http.post('*/api/v1/auth/refresh', () => {
        refreshRequests()

        return HttpResponse.json(refreshedTokens)
      }),
    )
    const client = createApiClient({ onSessionExpired })

    await expect(client.get('/protected-resource')).resolves.toMatchObject({
      data: { id: 1 },
    })

    expect(refreshRequests).toHaveBeenCalledTimes(1)
    expect(protectedRequests).toHaveBeenCalledTimes(2)
    expect(
      protectedRequests.mock.calls[1]?.[0].headers.get('Authorization'),
    ).toBe('Bearer new-access')
    expect(tokenStorage.read()).toEqual(refreshedTokens)
    expect(onSessionExpired).not.toHaveBeenCalled()
  })

  it('shares one refresh request between parallel unauthorized requests', async () => {
    tokenStorage.save(initialTokens)
    const protectedRequests = vi.fn()
    const refreshRequests = vi.fn()
    server.use(
      http.get('*/api/v1/protected-resource', () => {
        protectedRequests()

        if (protectedRequests.mock.calls.length <= 2) {
          return HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 })
        }

        return HttpResponse.json({ id: protectedRequests.mock.calls.length })
      }),
      http.post('*/api/v1/auth/refresh', () => {
        refreshRequests()

        return HttpResponse.json(refreshedTokens)
      }),
    )
    const client = createApiClient()

    await expect(
      Promise.all([
        client.get('/protected-resource'),
        client.get('/protected-resource'),
      ]),
    ).resolves.toHaveLength(2)

    expect(refreshRequests).toHaveBeenCalledTimes(1)
  })

  it('clears the session after a second unauthorized response without another retry loop', async () => {
    tokenStorage.save(initialTokens)
    const onSessionExpired = vi.fn()
    const protectedRequests = vi.fn()
    const refreshRequests = vi.fn()
    server.use(
      http.get('*/api/v1/protected-resource', () => {
        protectedRequests()

        return HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 })
      }),
      http.post('*/api/v1/auth/refresh', () => {
        refreshRequests()

        return HttpResponse.json(refreshedTokens)
      }),
    )
    const client = createApiClient({ onSessionExpired })

    await expect(client.get('/protected-resource')).rejects.toBeInstanceOf(
      AxiosError,
    )

    expect(protectedRequests).toHaveBeenCalledTimes(2)
    expect(refreshRequests).toHaveBeenCalledTimes(1)
    expect(tokenStorage.read()).toBeNull()
    expect(onSessionExpired).toHaveBeenCalledTimes(1)
  })

  it('clears the session when refreshing the token is unauthorized', async () => {
    tokenStorage.save(initialTokens)
    const onSessionExpired = vi.fn()
    const protectedRequests = vi.fn()
    const refreshRequests = vi.fn()
    server.use(
      http.get('*/api/v1/protected-resource', () => {
        protectedRequests()

        return HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 })
      }),
      http.post('*/api/v1/auth/refresh', () => {
        refreshRequests()

        return HttpResponse.json({ detail: 'Refresh token is invalid' }, { status: 401 })
      }),
    )
    const client = createApiClient({ onSessionExpired })

    await expect(client.get('/protected-resource')).rejects.toBeInstanceOf(
      AxiosError,
    )

    expect(protectedRequests).toHaveBeenCalledTimes(1)
    expect(refreshRequests).toHaveBeenCalledTimes(1)
    expect(tokenStorage.read()).toBeNull()
    expect(onSessionExpired).toHaveBeenCalledTimes(1)
  })
})
