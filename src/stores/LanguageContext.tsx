import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { getLocales } from 'expo-localization';
import i18n from '../i18n';
import { format as dateFnsFormat, Locale } from 'date-fns';
import { enUS, pl } from 'date-fns/locale';
import { DATE_FORMATS, DateFormatType, DateFormatOption } from '../constants/dateFormats';
import { usePreferences } from './PreferencesContext';

// Re-export for backward compatibility
export { DATE_FORMATS, DateFormatType, DateFormatOption } from '../constants/dateFormats';

type Language = 'en' | 'pl';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (scope: string, options?: Record<string, unknown>) => string;
  deviceLanguage: Language;
  dateLocale: Locale;
  dateFormat: DateFormatOption;
  setDateFormat: (format: DateFormatType) => Promise<void>;
  formatDate: (date: Date | string, style?: 'short' | 'long') => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Get supported language from device locale
function getSupportedLanguage(languageCode: string): Language {
  const lang = languageCode.toLowerCase();
  if (lang === 'pl') return 'pl';
  return 'en'; // Default to English
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { preferences, updatePreferences, isLoading } = usePreferences();

  const deviceLocales = getLocales();
  const deviceLang = getSupportedLanguage(deviceLocales[0]?.languageCode || 'en');

  // Get language from preferences
  const language = preferences.language;

  // Update i18n locale when language changes
  useMemo(() => {
    i18n.locale = language;
  }, [language]);

  // Save and update language
  const setLanguage = useCallback(async (newLang: Language) => {
    i18n.locale = newLang;
    await updatePreferences({ language: newLang });
  }, [updatePreferences]);

  // Save and update date format
  const setDateFormat = useCallback(async (formatId: DateFormatType) => {
    await updatePreferences({ dateFormat: formatId });
  }, [updatePreferences]);

  // Translation function bound to current locale
  const t = useCallback(
    (scope: string, options?: Record<string, unknown>): string => {
      return i18n.t(scope, options) as string;
    },
    [language] // Re-create when language changes
  );

  // Get date-fns locale based on current language
  const dateLocale = useMemo(() => {
    const localeMap: Record<Language, Locale> = {
      en: enUS,
      pl: pl,
    };
    return localeMap[language];
  }, [language]);

  // Get current date format option
  const dateFormat = useMemo(() => {
    return DATE_FORMATS.find(f => f.id === preferences.dateFormat) || DATE_FORMATS[0];
  }, [preferences.dateFormat]);

  // Format date with current locale and format preference
  const formatDate = useCallback(
    (date: Date | string, style: 'short' | 'long' = 'long'): string => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const formatStr = style === 'short' ? dateFormat.shortFormat : dateFormat.longFormat;
      return dateFnsFormat(dateObj, formatStr, { locale: dateLocale });
    },
    [dateLocale, dateFormat]
  );

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    deviceLanguage: deviceLang,
    dateLocale,
    dateFormat,
    setDateFormat,
    formatDate,
  };

  // Don't render until preferences are loaded
  if (isLoading) {
    return null;
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Direct translation function for use outside of React components
export function t(scope: string, options?: Record<string, unknown>): string {
  return i18n.t(scope, options) as string;
}

export default LanguageContext;
