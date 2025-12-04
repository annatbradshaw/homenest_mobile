import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, lightTheme, darkTheme } from '../config/theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  border: {
    primary: string;
    secondary: string;
  };
  card: {
    background: string;
    border: string;
  };
}

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  theme: ThemeColors;
  setMode: (mode: ThemeMode) => Promise<void>;
  colors: typeof colors;
}

const THEME_STORAGE_KEY = '@homenest_theme_mode';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);

  // Determine if dark mode is active
  const isDark =
    mode === 'dark' || (mode === 'system' && systemColorScheme === 'dark');

  // Get the active theme colors
  const theme: ThemeColors = isDark ? darkTheme : lightTheme;

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
          setModeState(savedMode as ThemeMode);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  // Save and update theme mode
  const setMode = useCallback(async (newMode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
      setModeState(newMode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }, []);

  const value: ThemeContextType = {
    mode,
    isDark,
    theme,
    setMode,
    colors,
  };

  // Don't render children until theme is loaded to prevent flash
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;
