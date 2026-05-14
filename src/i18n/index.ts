import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import 'intl-pluralrules';
import en from './locales/en.json';
import ta from './locales/ta.json';

let initialized = false;

export const initI18n = (language: 'ta' | 'en' = 'ta') => {
  if (initialized) {
    if (i18n.language !== language) i18n.changeLanguage(language);
    return;
  }
  initialized = true;

  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      ta: { translation: ta },
    },
    lng: language,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    returnNull: false,
    compatibilityJSON: 'v4',
  });
};

export { i18n };
export default i18n;
