import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

import { LanguageSwitcher } from '@features/language-switch/ui/LanguageSwitcher'
import { useAuth } from '@features/auth/ui/AuthContext'
import { elevation, fonts } from '@shared/theme/tokens'

export const AppHeader = () => {
  const { user, logout } = useAuth()
  const { t } = useTranslation()

  return (
    <AppBar
      color="inherit"
      elevation={0}
      position="sticky"
      sx={{
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        boxShadow: elevation[1],
        color: 'text.primary',
      }}
    >
      <Toolbar
        disableGutters={false}
        sx={{
          flexWrap: 'wrap',
          gap: { xs: 0.5, md: 0.75 },
          minHeight: { xs: 52, sm: 56 },
          py: { xs: 0.5, sm: 0 },
          rowGap: 0.5,
        }}
      >
        <Typography
          component={RouterLink}
          sx={{
            color: 'primary.main',
            flexGrow: 1,
            fontFamily: fonts.display,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            mr: 1,
            textDecoration: 'none',
          }}
          to="/"
          variant="h6"
        >
          {t('nav.brand')}
        </Typography>
        <Box
          component="nav"
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.25,
          }}
        >
          <Button color="inherit" component={RouterLink} size="small" to="/hotels">
            {t('nav.hotels')}
          </Button>
          <Button color="inherit" component={RouterLink} size="small" to="/hotels/map">
            {t('nav.map')}
          </Button>
          {user?.role === 'ADMIN' ? (
            <Button color="inherit" component={RouterLink} size="small" to="/admin">
              {t('nav.admin')}
            </Button>
          ) : null}
          <LanguageSwitcher />
          {user ? (
            <>
              <Button color="inherit" component={RouterLink} size="small" to="/favorites">
                {t('nav.favorites')}
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                size="small"
                to="/profile?tab=bookings"
              >
                {t('nav.profile')}
              </Button>
              <Button color="inherit" onClick={() => void logout()} size="small">
                {t('nav.logout')}
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} size="small" to="/login">
                {t('nav.login')}
              </Button>
              <Button
                color="primary"
                component={RouterLink}
                size="small"
                to="/register"
                variant="contained"
              >
                {t('nav.register')}
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}
