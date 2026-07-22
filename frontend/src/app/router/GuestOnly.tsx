import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '@features/auth/ui/AuthContext'

export const GuestOnly = () => {
  const { loading, user } = useAuth()

  if (loading) {
    return null
  }

  return user ? <Navigate replace to="/" /> : <Outlet />
}
