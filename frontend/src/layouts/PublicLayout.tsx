import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, Outlet } from 'react-router-dom'

import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { useAuth } from '../context/AuthContext'

export const PublicLayout = () => {
  const { user, logout } = useAuth()
  const { t } = useTranslation()

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar color="primary" elevation={1} position="sticky">
        <Toolbar sx={{ gap: 1, flexWrap: 'wrap' }}>
          <Typography
            component={RouterLink}
            sx={{ color: 'inherit', flexGrow: 1, fontWeight: 700, textDecoration: 'none' }}
            to="/"
            variant="h6"
          >
            {t('nav.brand')}
          </Typography>
          <Button color="inherit" component={RouterLink} to="/hotels">
            {t('nav.hotels')}
          </Button>
          <Button color="inherit" component={RouterLink} to="/hotels/map">
            {t('nav.map')}
          </Button>
          {user?.role === 'ADMIN' ? (
            <Button color="inherit" component={RouterLink} to="/admin">
              {t('nav.admin')}
            </Button>
          ) : null}
          <LanguageSwitcher />
          {user ? (
            <>
              <Button color="inherit" component={RouterLink} to="/favorites">
                {t('nav.favorites')}
              </Button>
              <Button color="inherit" component={RouterLink} to="/profile?tab=bookings">
                {t('nav.profile')}
              </Button>
              <Button color="inherit" onClick={() => void logout()}>
                {t('nav.logout')}
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                {t('nav.login')}
              </Button>
              <Button color="inherit" component={RouterLink} to="/register">
                {t('nav.register')}
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
