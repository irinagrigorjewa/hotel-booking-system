import { Alert, Button } from '@mui/material'

interface AdminErrorAlertProps {
  message: string
  onRetry?: () => void
  retryLabel?: string
}

export const AdminErrorAlert = ({
  message,
  onRetry,
  retryLabel,
}: AdminErrorAlertProps) => {
  return (
    <Alert
      action={
        onRetry && retryLabel ? (
          <Button color="inherit" onClick={onRetry} size="small">
            {retryLabel}
          </Button>
        ) : undefined
      }
      severity="error"
      sx={{ mb: 2 }}
    >
      {message}
    </Alert>
  )
}
