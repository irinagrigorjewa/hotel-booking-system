import { AppBar, Box, Container, Paper, Toolbar, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, Outlet } from 'react-router-dom'

import { LanguageSwitcher } from '../../components/LanguageSwitcher'

export const AuthLayout = () => {
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        bgcolor: 'grey.50',
        minHeight: '100vh',
      }}
    >
      <AppBar color="transparent" elevation={0} position="static">
        <Toolbar sx={{ gap: 2, justifyContent: 'space-between' }}>
          <Typography
            component={RouterLink}
            sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none' }}
            to="/"
            variant="h6"
          >
            {t('nav.brand')}
          </Typography>
          <LanguageSwitcher />
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="sm">
        <Box sx={{ display: 'grid', minHeight: 'calc(100vh - 64px)', placeItems: 'center', py: 4 }}>
          <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
            <Outlet />
          </Paper>
        </Box>
      </Container>
    </Box>
  )
}
