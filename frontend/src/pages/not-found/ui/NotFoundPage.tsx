import { Box, Button, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

import { fonts } from '@shared/theme/tokens'

export const NotFoundPage = () => {
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        alignItems: 'flex-start',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        py: { xs: 4, md: 8 },
      }}
    >
      <Typography
        component="h1"
        sx={{ fontFamily: fonts.display, fontWeight: 700, letterSpacing: '-0.02em' }}
        variant="h4"
      >
        {t('common.notFoundTitle')}
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
        {t('common.notFoundHint')}
      </Typography>
      <Button component={RouterLink} to="/" variant="contained">
        {t('common.notFoundHome')}
      </Button>
    </Box>
  )
}
