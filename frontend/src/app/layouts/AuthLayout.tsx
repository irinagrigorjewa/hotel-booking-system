import { Box, Container, Paper, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, Outlet } from 'react-router-dom'

import { LanguageSwitcher } from '@features/language-switch/ui/LanguageSwitcher'
import { fonts, radius } from '@shared/theme/tokens'

export const AuthLayout = () => {
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        minHeight: '100vh',
      }}
    >
      <Box
        component="header"
        sx={{
          alignItems: 'center',
          display: 'flex',
          gap: 2,
          justifyContent: 'space-between',
          px: { xs: 2, sm: 3 },
          py: 2,
        }}
      >
        <Typography
          component={RouterLink}
          sx={{
            color: 'primary.main',
            fontFamily: fonts.display,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            textDecoration: 'none',
          }}
          to="/"
          variant="h6"
        >
          {t('nav.brand')}
        </Typography>
        <LanguageSwitcher />
      </Box>
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            display: 'grid',
            minHeight: 'calc(100vh - 72px)',
            placeItems: 'center',
            py: { xs: 3, md: 5 },
          }}
        >
          <Paper
            elevation={3}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: `${radius.lg}px`,
              p: { xs: 3, sm: 4 },
              width: '100%',
            }}
          >
            <Outlet />
          </Paper>
        </Box>
      </Container>
    </Box>
  )
}
