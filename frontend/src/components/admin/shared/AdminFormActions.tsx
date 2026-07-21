import { Box, Button } from '@mui/material'

interface AdminFormActionsProps {
  isSubmitting: boolean
  submitLabel: string
  cancelLabel?: string
  onCancel?: () => void
}

export const AdminFormActions = ({
  isSubmitting,
  submitLabel,
  cancelLabel,
  onCancel,
}: AdminFormActionsProps) => {
  return (
    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
      <Button disabled={isSubmitting} type="submit" variant="contained">
        {submitLabel}
      </Button>
      {onCancel && cancelLabel ? (
        <Button disabled={isSubmitting} onClick={onCancel} type="button">
          {cancelLabel}
        </Button>
      ) : null}
    </Box>
  )
}
