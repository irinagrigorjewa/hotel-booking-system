import { Box, Container, Paper } from '@mui/material'
import { Outlet } from 'react-router-dom'

export const AuthLayout = () => (
  <Container component="main" maxWidth="sm">
    <Box sx={{ display: 'grid', minHeight: '100vh', placeItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
        <Outlet />
      </Paper>
    </Box>
  </Container>
)
