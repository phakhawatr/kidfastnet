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
import childprogressTh from '../locales/th/childprogress.json';
import aiTh from '../locales/th/ai.json';
import exercisesTh from '../locales/th/exercises.json';
import wordproblemsTh from '../locales/th/wordproblems.json';
import stemTh from '../locales/th/stem.json';
import codingbasicsTh from '../locales/th/codingbasics.json';
import sciencelabTh from '../locales/th/sciencelab.json';
import engineeringTh from '../locales/th/engineering.json';
import physicslabTh from '../locales/th/physicslab.json';
import chemistrylabTh from '../locales/th/chemistrylab.json';
import biologylabTh from '../locales/th/biologylab.json';
import astronomylabTh from '../locales/th/astronomylab.json';
import stemprogressTh from '../locales/th/stemprogress.json';
import trainingCalendarTh from '../locales/th/trainingCalendar.json';

import commonEn from '../locales/en/common.json';
import headerEn from '../locales/en/header.json';
import landingEn from '../locales/en/landing.json';
import footerEn from '../locales/en/footer.json';
import skillsEn from '../locales/en/skills.json';
import loginEn from '../locales/en/login.json';
import signupEn from '../locales/en/signup.json';
import profileEn from '../locales/en/profile.json';
import parentdashboardEn from '../locales/en/parentdashboard.json';
import childprogressEn from '../locales/en/childprogress.json';
import aiEn from '../locales/en/ai.json';
import exercisesEn from '../locales/en/exercises.json';
import wordproblemsEn from '../locales/en/wordproblems.json';
import stemEn from '../locales/en/stem.json';
import codingbasicsEn from '../locales/en/codingbasics.json';
import sciencelabEn from '../locales/en/sciencelab.json';
import engineeringEn from '../locales/en/engineering.json';
import physicslabEn from '../locales/en/physicslab.json';
import chemistrylabEn from '../locales/en/chemistrylab.json';
import biologylabEn from '../locales/en/biologylab.json';
import astronomylabEn from '../locales/en/astronomylab.json';
import stemprogressEn from '../locales/en/stemprogress.json';
import trainingCalendarEn from '../locales/en/trainingCalendar.json';

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
    childprogress: childprogressTh,
    ai: aiTh,
    exercises: exercisesTh,
    wordproblems: wordproblemsTh,
    stem: stemTh,
    codingbasics: codingbasicsTh,
    sciencelab: sciencelabTh,
    engineering: engineeringTh,
    physicslab: physicslabTh,
    chemistrylab: chemistrylabTh,
    biologylab: biologylabTh,
    astronomylab: astronomylabTh,
    stemprogress: stemprogressTh,
    trainingCalendar: trainingCalendarTh,
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
    childprogress: childprogressEn,
    ai: aiEn,
    exercises: exercisesEn,
    wordproblems: wordproblemsEn,
    stem: stemEn,
    codingbasics: codingbasicsEn,
    sciencelab: sciencelabEn,
    engineering: engineeringEn,
    physicslab: physicslabEn,
    chemistrylab: chemistrylabEn,
    biologylab: biologylabEn,
    astronomylab: astronomylabEn,
    stemprogress: stemprogressEn,
    trainingCalendar: trainingCalendarEn,
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
