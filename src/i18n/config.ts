import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import commonTh from '../locales/th/common.json';
import headerTh from '../locales/th/header.json';
import landingTh from '../locales/th/landing.json';

import commonEn from '../locales/en/common.json';
import headerEn from '../locales/en/header.json';
import landingEn from '../locales/en/landing.json';

const resources = {
  th: {
    common: commonTh,
    header: headerTh,
    landing: landingTh,
  },
  en: {
    common: commonEn,
    header: headerEn,
    landing: landingEn,
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'th',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    }
  });

export default i18n;
