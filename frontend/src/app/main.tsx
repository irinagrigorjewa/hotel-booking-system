import { CssBaseline, ThemeProvider } from '@mui/material'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'

import { App } from '@app/App'
import { NotificationProvider } from '@app/providers/NotificationProvider'
import { QueryProvider } from '@app/providers/QueryProvider'
import { AuthProvider } from '../context/AuthContext'
import i18n from '@shared/i18n'
import { theme } from '@shared/theme/theme'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element is missing')
}

createRoot(rootElement).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <QueryProvider>
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <NotificationProvider>
              <CssBaseline />
              <App />
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryProvider>
    </I18nextProvider>
  </StrictMode>,
)
