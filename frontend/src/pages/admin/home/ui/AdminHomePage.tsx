import { Box, Card, CardActionArea, CardContent, Grid, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

const links = [
  { to: '/admin/users', key: 'users' },
  { to: '/admin/hotels', key: 'hotels' },
  { to: '/admin/room-types', key: 'roomTypes' },
  { to: '/admin/rooms', key: 'rooms' },
  { to: '/admin/bookings', key: 'bookings' },
  { to: '/admin/reviews', key: 'reviews' },
] as const

export const AdminHomePage = () => {
  const { t } = useTranslation()

  return (
    <Box>
      <Typography component="h1" gutterBottom variant="h4">
        {t('admin.homeTitle')}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {t('admin.homeSubtitle')}
      </Typography>
      <Grid container spacing={2}>
        {links.map((link) => (
          <Grid key={link.to} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card variant="outlined">
              <CardActionArea component={RouterLink} to={link.to}>
                <CardContent>
                  <Typography variant="h6">{t(`admin.nav.${link.key}`)}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
