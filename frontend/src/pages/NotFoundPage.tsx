import { Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

export const NotFoundPage = () => {
  const { t } = useTranslation()

  return (
    <>
      <Typography component="h1" variant="h4">
        {t('common.notFoundTitle')}
      </Typography>
      <Typography component={RouterLink} to="/" sx={{ display: 'inline-block', mt: 2 }}>
        {t('common.notFoundHome')}
      </Typography>
    </>
  )
}
