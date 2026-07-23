import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  isConfirming?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const { t } = useTranslation()

  return (
    <Dialog
      aria-labelledby="confirm-dialog-title"
      onClose={onCancel}
      open={open}
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      {description ? (
        <DialogContent>
          <DialogContentText>{description}</DialogContentText>
        </DialogContent>
      ) : null}
      <DialogActions>
        <Button disabled={isConfirming} onClick={onCancel} type="button">
          {cancelLabel ?? t('common.cancel')}
        </Button>
        <Button
          color="error"
          disabled={isConfirming}
          onClick={onConfirm}
          type="button"
          variant="contained"
        >
          {confirmLabel ?? t('common.confirmDelete')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
