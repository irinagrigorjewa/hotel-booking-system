import { Box, Container } from '@mui/material'
import { Outlet } from 'react-router-dom'

import { AppHeader } from '@widgets/header/ui/AppHeader'

export const PublicLayout = () => (
  <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
    <AppHeader />
    <Container component="main" sx={{ py: 4 }}>
      <Outlet />
    </Container>
  </Box>
)
