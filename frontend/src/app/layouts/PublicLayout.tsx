import { Box, Container } from '@mui/material'
import { Outlet, useLocation } from 'react-router-dom'

import { AppHeader } from '@widgets/header/ui/AppHeader'

export const PublicLayout = () => {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppHeader />
      {isHome ? (
        <Box component="main">
          <Outlet />
        </Box>
      ) : (
        <Container
          component="main"
          maxWidth="lg"
          sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 4 } }}
        >
          <Outlet />
        </Container>
      )}
    </Box>
  )
}
