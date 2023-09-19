import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

i18n
  .use(Backend) // load translation using http (default public/assets/locales)
  .use(LanguageDetector) // detect user language
  .use(initReactI18next) // pass the i18n instance to react-i18next.
  .init({
    lng: "nb",
    supportedLngs: ['en', 'nb'],  // add supported languages here
    nonExplicitSupportedLngs: true, // if true will pass eg. en-US if finding en in supportedLngs
    fallbackLng: {
      'nb': ['en'],
      'default': ['en']
    },
    debug: false,
    detection: {
      order: ['queryString', 'cookie'],
      caches: ['cookie'],
    },
    interpolation: {
      escapeValue: false, // not needed for React as it escapes by default
    },
    backend: {
      // for all available options read the backend's repository readme file
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    }
  });

export default i18n;
