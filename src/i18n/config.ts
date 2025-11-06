import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import commonTh from '../locales/th/common.json';
import headerTh from '../locales/th/header.json';

import commonEn from '../locales/en/common.json';
import headerEn from '../locales/en/header.json';

const resources = {
  th: {
    common: commonTh,
    header: headerTh,
  },
  en: {
    common: commonEn,
    header: headerEn,
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
