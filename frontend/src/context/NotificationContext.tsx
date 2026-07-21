import { Alert, Snackbar } from '@mui/material'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { useTranslation } from 'react-i18next'

import { getApiErrorMessage } from '../utils/getApiErrorMessage'

type NotificationSeverity = 'success' | 'error'

interface NotificationState {
  message: string
  severity: NotificationSeverity
  open: boolean
}

interface NotificationContextValue {
  notifySuccess: (messageKey: string) => void
  notifyError: (messageKey: string) => void
  notifyApiError: (error: unknown, fallbackKey: string) => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export const NotificationProvider = ({ children }: PropsWithChildren) => {
  const { t } = useTranslation()
  const [notification, setNotification] = useState<NotificationState>({
    message: '',
    severity: 'success',
    open: false,
  })

  const show = useCallback((message: string, severity: NotificationSeverity) => {
    setNotification({ message, severity, open: true })
  }, [])

  const notifySuccess = useCallback(
    (messageKey: string) => {
      show(t(messageKey), 'success')
    },
    [show, t],
  )

  const notifyError = useCallback(
    (messageKey: string) => {
      show(t(messageKey), 'error')
    },
    [show, t],
  )

  const notifyApiError = useCallback(
    (error: unknown, fallbackKey: string) => {
      show(getApiErrorMessage(error, t(fallbackKey), (key) => t(key)), 'error')
    },
    [show, t],
  )

  const handleClose = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }))
  }, [])

  const value = useMemo(
    () => ({ notifySuccess, notifyError, notifyApiError }),
    [notifySuccess, notifyError, notifyApiError],
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={6000}
        onClose={handleClose}
        open={notification.open}
      >
        <Alert onClose={handleClose} severity={notification.severity} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  )
}

export const useNotify = (): NotificationContextValue => {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error('useNotify must be used within NotificationProvider')
  }

  return context
}
