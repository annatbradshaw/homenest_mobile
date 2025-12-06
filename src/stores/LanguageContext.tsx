import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import i18n, { TranslationKeys } from '../i18n';
import { format as dateFnsFormat, Locale } from 'date-fns';
import { enUS, pl } from 'date-fns/locale';
import { DATE_FORMATS, DateFormatType, DateFormatOption } from '../constants/dateFormats';

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

const LANGUAGE_STORAGE_KEY = '@homenest_language';
const DATE_FORMAT_STORAGE_KEY = '@homenest_date_format';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Get supported language from device locale
function getSupportedLanguage(languageCode: string): Language {
  const lang = languageCode.toLowerCase();
  if (lang === 'pl') return 'pl';
  return 'en'; // Default to English
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const deviceLocales = getLocales();
  const deviceLang = getSupportedLanguage(deviceLocales[0]?.languageCode || 'en');

  const [language, setLanguageState] = useState<Language>(deviceLang);
  const [dateFormatId, setDateFormatId] = useState<DateFormatType>('mdy');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved preferences or use defaults
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const [savedLang, savedDateFormat] = await Promise.all([
          AsyncStorage.getItem(LANGUAGE_STORAGE_KEY),
          AsyncStorage.getItem(DATE_FORMAT_STORAGE_KEY),
        ]);

        if (savedLang && ['en', 'pl'].includes(savedLang)) {
          setLanguageState(savedLang as Language);
          i18n.locale = savedLang;
        } else {
          // No saved preference - use device language
          i18n.locale = deviceLang;
        }

        if (savedDateFormat && ['mdy', 'dmy', 'ymd'].includes(savedDateFormat)) {
          setDateFormatId(savedDateFormat as DateFormatType);
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
        // On error, still set device language
        i18n.locale = deviceLang;
      } finally {
        setIsLoading(false);
      }
    };
    loadPreferences();
  }, [deviceLang]);

  // Save and update language
  const setLanguage = useCallback(async (newLang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
      i18n.locale = newLang;
      setLanguageState(newLang);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  }, []);

  // Save and update date format
  const setDateFormat = useCallback(async (formatId: DateFormatType) => {
    try {
      await AsyncStorage.setItem(DATE_FORMAT_STORAGE_KEY, formatId);
      setDateFormatId(formatId);
    } catch (error) {
      console.error('Failed to save date format preference:', error);
    }
  }, []);

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
    return DATE_FORMATS.find(f => f.id === dateFormatId) || DATE_FORMATS[0];
  }, [dateFormatId]);

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

  // Don't render until language is loaded
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
