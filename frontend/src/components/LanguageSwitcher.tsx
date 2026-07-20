import { Button, ButtonGroup } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { setAppLanguage } from '../i18n'

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation()
  const current = i18n.language.startsWith('en') ? 'en' : 'ru'

  return (
    <ButtonGroup color="inherit" size="small" variant="outlined">
      <Button
        aria-pressed={current === 'ru'}
        onClick={() => {
          void setAppLanguage('ru')
        }}
        variant={current === 'ru' ? 'contained' : 'outlined'}
      >
        {t('nav.langRu')}
      </Button>
      <Button
        aria-pressed={current === 'en'}
        onClick={() => {
          void setAppLanguage('en')
        }}
        variant={current === 'en' ? 'contained' : 'outlined'}
      >
        {t('nav.langEn')}
      </Button>
    </ButtonGroup>
  )
}
