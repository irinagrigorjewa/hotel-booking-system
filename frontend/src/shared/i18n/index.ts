import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import ru from './locales/ru.json'

export const I18N_STORAGE_KEY = 'i18n_lang'

const readStoredLanguage = (): 'ru' | 'en' => {
  if (typeof window === 'undefined') {
    return 'ru'
  }

  const stored = window.localStorage.getItem(I18N_STORAGE_KEY)

  return stored === 'en' || stored === 'ru' ? stored : 'ru'
}

void i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru as Record<string, unknown> },
    en: { translation: en as Record<string, unknown> },
  },
  lng: readStoredLanguage(),
  fallbackLng: 'ru',
  initAsync: false,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
})

export const setAppLanguage = async (language: 'ru' | 'en'): Promise<void> => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(I18N_STORAGE_KEY, language)
  }
  await i18n.changeLanguage(language)
}

export default i18n
