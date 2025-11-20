import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import commonTh from '../locales/th/common.json';
import headerTh from '../locales/th/header.json';
import landingTh from '../locales/th/landing.json';
import footerTh from '../locales/th/footer.json';
import skillsTh from '../locales/th/skills.json';
import loginTh from '../locales/th/login.json';
import signupTh from '../locales/th/signup.json';
import profileTh from '../locales/th/profile.json';
import parentdashboardTh from '../locales/th/parentdashboard.json';
import aiTh from '../locales/th/ai.json';
import exercisesTh from '../locales/th/exercises.json';
import wordproblemsTh from '../locales/th/wordproblems.json';
import stemTh from '../locales/th/stem.json';

import commonEn from '../locales/en/common.json';
import headerEn from '../locales/en/header.json';
import landingEn from '../locales/en/landing.json';
import footerEn from '../locales/en/footer.json';
import skillsEn from '../locales/en/skills.json';
import loginEn from '../locales/en/login.json';
import signupEn from '../locales/en/signup.json';
import profileEn from '../locales/en/profile.json';
import parentdashboardEn from '../locales/en/parentdashboard.json';
import aiEn from '../locales/en/ai.json';
import exercisesEn from '../locales/en/exercises.json';
import wordproblemsEn from '../locales/en/wordproblems.json';
import stemEn from '../locales/en/stem.json';

const resources = {
  th: {
    common: commonTh,
    header: headerTh,
    landing: landingTh,
    footer: footerTh,
    skills: skillsTh,
    login: loginTh,
    signup: signupTh,
    profile: profileTh,
    parentdashboard: parentdashboardTh,
    ai: aiTh,
    exercises: exercisesTh,
    wordproblems: wordproblemsTh,
    stem: stemTh,
  },
  en: {
    common: commonEn,
    header: headerEn,
    landing: landingEn,
    footer: footerEn,
    skills: skillsEn,
    login: loginEn,
    signup: signupEn,
    profile: profileEn,
    parentdashboard: parentdashboardEn,
    ai: aiEn,
    exercises: exercisesEn,
    wordproblems: wordproblemsEn,
    stem: stemEn,
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
