import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material'
import { Link as RouterLink, Outlet } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

export const PublicLayout = () => {
  const { user, logout } = useAuth()

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar color="default" elevation={1} position="static">
        <Toolbar sx={{ gap: 1 }}>
          <Typography
            component={RouterLink}
            sx={{ color: 'inherit', flexGrow: 1, textDecoration: 'none' }}
            to="/"
            variant="h6"
          >
            Hotel Booking System
          </Typography>
          <Button color="inherit" component={RouterLink} to="/hotels">
            Отели
          </Button>
          <Button color="inherit" component={RouterLink} to="/hotels/map">
            Карта
          </Button>
          {user?.role === 'ADMIN' ? (
            <>
              <Button color="inherit" component={RouterLink} to="/admin/hotels">
                Отели
              </Button>
              <Button color="inherit" component={RouterLink} to="/admin/rooms">
                Номера
              </Button>
            </>
          ) : null}
          {user ? (
            <Button color="inherit" onClick={() => void logout()}>
              Выйти
            </Button>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Вход
              </Button>
              <Button color="inherit" component={RouterLink} to="/register">
                Регистрация
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  )
}
