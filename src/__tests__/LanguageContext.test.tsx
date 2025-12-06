import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { LanguageProvider, useLanguage, DATE_FORMATS } from '../stores/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Wrapper component for hooks
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe('LanguageContext', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('Language', () => {
    it('should default to device language (English)', async () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      await waitFor(() => {
        expect(result.current.language).toBe('en');
      });
    });

    it('should change language when setLanguage is called', async () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      await waitFor(() => {
        expect(result.current.language).toBe('en');
      });

      await act(async () => {
        await result.current.setLanguage('pl');
      });

      expect(result.current.language).toBe('pl');
    });

    it('should persist language to AsyncStorage', async () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      await waitFor(() => {
        expect(result.current.language).toBe('en');
      });

      await act(async () => {
        await result.current.setLanguage('pl');
      });

      const savedLang = await AsyncStorage.getItem('@homenest_language');
      expect(savedLang).toBe('pl');
    });

    it('should provide translation function', async () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      await waitFor(() => {
        expect(result.current.t).toBeDefined();
        expect(typeof result.current.t).toBe('function');
      });
    });
  });

  describe('Date Format', () => {
    it('should default to MDY format', async () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      await waitFor(() => {
        expect(result.current.dateFormat.id).toBe('mdy');
      });
    });

    it('should change date format when setDateFormat is called', async () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      await waitFor(() => {
        expect(result.current.dateFormat.id).toBe('mdy');
      });

      await act(async () => {
        await result.current.setDateFormat('dmy');
      });

      expect(result.current.dateFormat.id).toBe('dmy');
      expect(result.current.dateFormat.label).toBe('DD/MM/YYYY');
    });

    it('should persist date format to AsyncStorage', async () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      await waitFor(() => {
        expect(result.current.dateFormat.id).toBe('mdy');
      });

      await act(async () => {
        await result.current.setDateFormat('ymd');
      });

      const savedFormat = await AsyncStorage.getItem('@homenest_date_format');
      expect(savedFormat).toBe('ymd');
    });

    it('should format dates correctly with MDY format', async () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      await waitFor(() => {
        expect(result.current.dateFormat.id).toBe('mdy');
      });

      const testDate = new Date(2025, 11, 6); // December 6, 2025
      const shortFormatted = result.current.formatDate(testDate, 'short');
      const longFormatted = result.current.formatDate(testDate, 'long');

      expect(shortFormatted).toBe('12/06/2025');
      expect(longFormatted).toContain('December');
      expect(longFormatted).toContain('6');
      expect(longFormatted).toContain('2025');
    });

    it('should format dates correctly with DMY format', async () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      await waitFor(() => {
        expect(result.current.dateFormat.id).toBe('mdy');
      });

      await act(async () => {
        await result.current.setDateFormat('dmy');
      });

      const testDate = new Date(2025, 11, 6); // December 6, 2025
      const shortFormatted = result.current.formatDate(testDate, 'short');

      expect(shortFormatted).toBe('06/12/2025');
    });

    it('should format dates correctly with YMD format', async () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      await waitFor(() => {
        expect(result.current.dateFormat.id).toBe('mdy');
      });

      await act(async () => {
        await result.current.setDateFormat('ymd');
      });

      const testDate = new Date(2025, 11, 6); // December 6, 2025
      const shortFormatted = result.current.formatDate(testDate, 'short');

      expect(shortFormatted).toBe('2025-12-06');
    });

    it('should accept string dates', async () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      await waitFor(() => {
        expect(result.current.formatDate).toBeDefined();
      });

      const formatted = result.current.formatDate('2025-12-06', 'short');
      expect(formatted).toBeTruthy();
    });
  });

  describe('DATE_FORMATS constant', () => {
    it('should have 3 format options', () => {
      expect(DATE_FORMATS).toHaveLength(3);
    });

    it('should have correct format IDs', () => {
      const ids = DATE_FORMATS.map(f => f.id);
      expect(ids).toContain('mdy');
      expect(ids).toContain('dmy');
      expect(ids).toContain('ymd');
    });

    it('should have labels for all formats', () => {
      DATE_FORMATS.forEach(format => {
        expect(format.label).toBeTruthy();
        expect(format.example).toBeTruthy();
        expect(format.shortFormat).toBeTruthy();
        expect(format.longFormat).toBeTruthy();
      });
    });
  });
});
