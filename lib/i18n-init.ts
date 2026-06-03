import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { LOCALES, DEFAULT_LOCALE } from './i18n'

// Importations des fichiers de traduction
// En production, il vaut mieux utiliser un backend pour charger dynamiquement,
// mais pour commencer on peut les importer ou utiliser fetch
import frCommon from '../public/locales/fr/common.json'
import enCommon from '../public/locales/en/common.json'
import esCommon from '../public/locales/es/common.json'
import deCommon from '../public/locales/de/common.json'
import zhCommon from '../public/locales/zh/common.json'

const resources = {
  fr: { common: frCommon },
  en: { common: enCommon },
  es: { common: esCommon },
  de: { common: deCommon },
  zh: { common: zhCommon },
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: LOCALES,
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['cookie', 'header'],
      caches: ['cookie'],
    }
  })

export default i18n
