import {
  Box,
  Button,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet } from 'react-router-dom'

import { AppHeader } from '@widgets/header/ui/AppHeader'

const DRAWER_WIDTH = 240

const NAV_ITEMS = [
  { to: '/admin', key: 'home', end: true },
  { to: '/admin/users', key: 'users', end: false },
  { to: '/admin/hotels', key: 'hotels', end: false },
  { to: '/admin/room-types', key: 'roomTypes', end: false },
  { to: '/admin/rooms', key: 'rooms', end: false },
  { to: '/admin/bookings', key: 'bookings', end: false },
  { to: '/admin/reviews', key: 'reviews', end: false },
] as const

export const AdminLayout = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up(768))
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobileNav = () => {
    setMobileOpen(false)
  }

  const drawerContent = (
    <Box
      aria-label={t('admin.navLabel')}
      component="nav"
      sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: DRAWER_WIDTH }}
    >
      <Toolbar sx={{ px: 2 }}>
        <Typography component="p" sx={{ fontWeight: 700 }} variant="subtitle1">
          {t('admin.homeTitle')}
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1, py: 1 }}>
        {NAV_ITEMS.map((item) => (
          <ListItemButton
            component={NavLink}
            end={item.end}
            key={item.to}
            onClick={closeMobileNav}
            sx={{
              '&.active': {
                bgcolor: 'action.selected',
                borderRight: 3,
                borderColor: 'primary.main',
              },
            }}
            to={item.to}
          >
            <ListItemText primary={t(`admin.nav.${item.key}`)} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', overflowX: 'hidden' }}>
      <AppHeader />
      <Box sx={{ display: 'flex' }}>
        <Drawer
          ModalProps={{ keepMounted: true }}
          onClose={closeMobileNav}
          open={isDesktop || mobileOpen}
          sx={{
            flexShrink: 0,
            ...(isDesktop
              ? {
                  width: DRAWER_WIDTH,
                  '& .MuiDrawer-paper': {
                    boxSizing: 'border-box',
                    position: 'relative',
                    width: DRAWER_WIDTH,
                  },
                }
              : {
                  '& .MuiDrawer-paper': {
                    boxSizing: 'border-box',
                    width: DRAWER_WIDTH,
                  },
                }),
          }}
          variant={isDesktop ? 'permanent' : 'temporary'}
        >
          {drawerContent}
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            maxWidth: '100%',
            minWidth: 0,
            overflowX: 'hidden',
            px: { xs: 2, sm: 3 },
            py: 3,
            width: isDesktop ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
          }}
        >
          {!isDesktop ? (
            <Button
              aria-label={t('admin.openNav')}
              onClick={() => {
                setMobileOpen(true)
              }}
              size="small"
              sx={{ mb: 2 }}
              variant="outlined"
            >
              {t('admin.openNav')}
            </Button>
          ) : null}
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
