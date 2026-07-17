import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

export const RequireAuth = () => {
  const { loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return null
  }

  if (user) {
    return <Outlet />
  }

  const returnUrl = `${location.pathname}${location.search}${location.hash}`

  return <Navigate replace to={`/login?returnUrl=${encodeURIComponent(returnUrl)}`} />
}
