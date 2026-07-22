import { AdminErrorAlert } from './AdminErrorAlert'

interface AdminFormErrorProps {
  message?: string
}

export const AdminFormError = ({ message }: AdminFormErrorProps) => {
  if (!message) {
    return null
  }

  return <AdminErrorAlert message={message} />
}
