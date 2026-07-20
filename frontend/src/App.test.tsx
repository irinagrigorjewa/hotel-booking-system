import { ThemeProvider } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { App } from './App'
import { AuthProvider } from './context/AuthContext'
import { theme } from './theme/theme'

const renderAtPath = (path: string) => {
  window.history.pushState({}, '', path)
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  )
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('App', () => {
  it('renders the home page at the public root route', async () => {
    renderAtPath('/')

    expect(
      screen.getByRole('heading', { name: 'Hotel Booking System' }),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Grand Hotel' })).toBeInTheDocument()
    })
  })

  it('renders a not-found page for an unknown route', () => {
    renderAtPath('/missing')

    expect(
      screen.getByRole('heading', { name: 'Страница не найдена' }),
    ).toBeInTheDocument()
  })
})
