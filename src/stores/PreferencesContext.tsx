import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { UserPreferences, DEFAULT_PREFERENCES, migrateNotificationPreferences } from '../types/preferences';
import { getLocales } from 'expo-localization';

const PREFERENCES_STORAGE_KEY = '@homenest_preferences';

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

// Get device defaults
function getDeviceDefaults(): Partial<UserPreferences> {
  const deviceLocales = getLocales();
  const languageCode = deviceLocales[0]?.languageCode?.toLowerCase() || 'en';
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return {
    language: languageCode === 'pl' ? 'pl' : 'en',
    timezone,
    // Use DMY for European locales, YMD for Asian, MDY for US
    dateFormat: languageCode === 'pl' ? 'dmy' : 'mdy',
    // Default currency based on language
    currency: languageCode === 'pl' ? 'PLN' : 'USD',
    currencySymbol: languageCode === 'pl' ? 'zł' : '$',
  };
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    ...DEFAULT_PREFERENCES,
    ...getDeviceDefaults(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Load preferences on mount and auth change
  useEffect(() => {
    loadPreferences();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const newUserId = session?.user?.id || null;
      setUserId(newUserId);
      setIsAuthenticated(!!session);

      if (event === 'SIGNED_IN' && newUserId) {
        // User just signed in - load preferences from DB
        await loadFromDatabase(newUserId);
      } else if (event === 'SIGNED_OUT') {
        // User signed out - keep local preferences but clear user ID
        setUserId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load preferences from AsyncStorage (fast, local) and then from DB (authoritative)
  const loadPreferences = async () => {
    try {
      // First, load from local storage (fast)
      const localData = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (localData) {
        const parsed = JSON.parse(localData) as Partial<UserPreferences>;
        setPreferences(prev => ({ ...prev, ...parsed }));
      }

      // Then check if user is authenticated and load from DB
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setUserId(session.user.id);
        setIsAuthenticated(true);
        await loadFromDatabase(session.user.id);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load preferences from Supabase database
  const loadFromDatabase = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('preferences')
        .eq('id', uid)
        .single();

      if (error) {
        console.error('Failed to load preferences from DB:', error);
        return;
      }

      if (data?.preferences) {
        const dbPrefs = data.preferences as Partial<UserPreferences>;
        // Migrate notification preferences from legacy format if needed
        const notifications = migrateNotificationPreferences(
          dbPrefs.notifications as Record<string, unknown> | undefined
        );
        const merged = {
          ...DEFAULT_PREFERENCES,
          ...getDeviceDefaults(),
          ...dbPrefs,
          notifications,
        };
        setPreferences(merged);
        // Update local cache
        await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(merged));

        // If migration happened, save updated preferences back to DB
        if (dbPrefs.notifications && !('pushEnabled' in dbPrefs.notifications)) {
          await supabase
            .from('user_profiles')
            .update({ preferences: merged })
            .eq('id', uid);
        }
      }
    } catch (error) {
      console.error('Failed to load preferences from DB:', error);
    }
  };

  // Save preferences to both AsyncStorage and Supabase
  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);

    try {
      // Always save to local storage
      await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(newPreferences));

      // If authenticated, also save to database
      if (userId) {
        const { error } = await supabase
          .from('user_profiles')
          .update({ preferences: newPreferences })
          .eq('id', userId);

        if (error) {
          console.error('Failed to save preferences to DB:', error);
        }
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }, [preferences, userId]);

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updatePreferences,
        isLoading,
        isAuthenticated,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}

export default PreferencesContext;
