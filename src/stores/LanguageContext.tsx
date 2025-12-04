import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import i18n, { TranslationKeys } from '../i18n';

type Language = 'en' | 'pl';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (scope: string, options?: Record<string, unknown>) => string;
  deviceLanguage: Language;
}

const LANGUAGE_STORAGE_KEY = '@homenest_language';

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
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language preference
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLang && ['en', 'pl'].includes(savedLang)) {
          setLanguageState(savedLang as Language);
          i18n.locale = savedLang;
        }
      } catch (error) {
        console.error('Failed to load language preference:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadLanguage();
  }, []);

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

  // Translation function bound to current locale
  const t = useCallback(
    (scope: string, options?: Record<string, unknown>): string => {
      return i18n.t(scope, options) as string;
    },
    [language] // Re-create when language changes
  );

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    deviceLanguage: deviceLang,
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
