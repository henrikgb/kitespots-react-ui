import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpApi) // use HttpApi for backend loading
  .use(LanguageDetector) // use LanguageDetector to detect the user language
  .use(initReactI18next) // init i18next with the plugin for react
  .init({
    lng: "nb",
    supportedLngs: ['en', 'nb'],  // add supported languages here
    fallbackLng: {
      'nb': ['en'],
      'default': ['en']
    },
    debug: false, // set to false in production
    detection: {
      order: ['queryString', 'cookie', 'localStorage', 'sessionStorage', 'navigator'],
      caches: ['localStorage', 'cookie'],
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // path to your translation files
    },
  });

export default i18n;
