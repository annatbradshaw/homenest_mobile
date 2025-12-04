import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import en from './translations/en';
import pl from './translations/pl';

// Create i18n instance
const i18n = new I18n({
  en,
  pl,
});

// Get device locale
const deviceLocales = getLocales();
const deviceLanguage = deviceLocales[0]?.languageCode || 'en';

// Set default locale from device
i18n.locale = deviceLanguage;
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export default i18n;

export type TranslationKeys = typeof en;
