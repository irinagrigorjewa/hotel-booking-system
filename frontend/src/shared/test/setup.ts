import '@testing-library/jest-dom/vitest'
import { createElement, type ReactNode } from 'react'
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest'

import { setAppLanguage } from '@shared/i18n'
import { server } from '@shared/test/server'

vi.mock('leaflet/dist/leaflet.css', () => ({}))

vi.mock('leaflet', () => ({
  default: {
    Icon: { Default: { mergeOptions: vi.fn() } },
    latLngBounds: vi.fn(() => ({})),
  },
}))

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children?: ReactNode }) =>
    createElement('div', { 'data-testid': 'map-container' }, children),
  TileLayer: () => null,
  Marker: ({ children }: { children?: ReactNode }) =>
    createElement('div', { 'data-testid': 'map-marker' }, children),
  Popup: ({ children }: { children?: ReactNode }) => createElement('div', null, children),
  useMap: () => ({ fitBounds: vi.fn() }),
}))

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(async () => {
  window.localStorage.clear()
  await setAppLanguage('ru')
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
