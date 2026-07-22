import { ThemeProvider } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { App } from '@app/App'
import { AuthProvider } from '@features/auth/ui/AuthContext'
import { NotificationProvider } from '@app/providers/NotificationProvider'
import { theme } from '@shared/theme/theme'

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
          <NotificationProvider>
            <App />
          </NotificationProvider>
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
