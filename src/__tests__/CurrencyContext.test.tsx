import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { CurrencyProvider, useCurrency, SUPPORTED_CURRENCIES } from '../stores/CurrencyContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Wrapper component for hooks
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CurrencyProvider>{children}</CurrencyProvider>
);

describe('CurrencyContext', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('Currency Selection', () => {
    it('should default to USD', async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.currency.code).toBe('USD');
      });
    });

    it('should change currency when setCurrency is called', async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.currency.code).toBe('USD');
      });

      const eurCurrency = SUPPORTED_CURRENCIES.find(c => c.code === 'EUR')!;
      await act(async () => {
        await result.current.setCurrency(eurCurrency);
      });

      expect(result.current.currency.code).toBe('EUR');
      expect(result.current.currency.symbol).toBe('€');
    });

    it('should persist currency to AsyncStorage', async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.currency.code).toBe('USD');
      });

      const plnCurrency = SUPPORTED_CURRENCIES.find(c => c.code === 'PLN')!;
      await act(async () => {
        await result.current.setCurrency(plnCurrency);
      });

      const savedCurrency = await AsyncStorage.getItem('@homenest_currency');
      expect(savedCurrency).toBe('PLN');
    });

    it('should load saved currency from AsyncStorage', async () => {
      // Pre-set currency in storage
      await AsyncStorage.setItem('@homenest_currency', 'GBP');

      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.currency.code).toBe('GBP');
        expect(result.current.currency.symbol).toBe('£');
      });
    });
  });

  describe('Format Amount', () => {
    it('should format amounts with USD symbol', async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.currency.code).toBe('USD');
      });

      const formatted = result.current.formatAmount(1234.56);
      expect(formatted).toContain('1,234');
      expect(formatted).toContain('$');
    });

    it('should format amounts with EUR symbol', async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.currency.code).toBe('USD');
      });

      const eurCurrency = SUPPORTED_CURRENCIES.find(c => c.code === 'EUR')!;
      await act(async () => {
        await result.current.setCurrency(eurCurrency);
      });

      const formatted = result.current.formatAmount(1234.56);
      expect(formatted).toContain('€');
    });

    it('should format amounts with PLN symbol', async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.currency.code).toBe('USD');
      });

      const plnCurrency = SUPPORTED_CURRENCIES.find(c => c.code === 'PLN')!;
      await act(async () => {
        await result.current.setCurrency(plnCurrency);
      });

      const formatted = result.current.formatAmount(1234.56);
      expect(formatted).toContain('zł');
    });

    it('should handle zero amounts', async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.formatAmount).toBeDefined();
      });

      const formatted = result.current.formatAmount(0);
      expect(formatted).toContain('0');
    });

    it('should handle negative amounts', async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.formatAmount).toBeDefined();
      });

      const formatted = result.current.formatAmount(-500);
      expect(formatted).toContain('500');
    });

    it('should handle large amounts', async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.formatAmount).toBeDefined();
      });

      const formatted = result.current.formatAmount(1000000);
      expect(formatted).toContain('1,000,000');
    });
  });

  describe('Format Compact', () => {
    it('should format small amounts without abbreviation', async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.formatCompact).toBeDefined();
      });

      const formatted = result.current.formatCompact(500);
      expect(formatted).toContain('500');
    });

    it('should format thousands with K suffix', async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.formatCompact).toBeDefined();
      });

      const formatted = result.current.formatCompact(5000);
      expect(formatted.toLowerCase()).toMatch(/5.*k/i);
    });

    it('should format millions with M suffix', async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.formatCompact).toBeDefined();
      });

      const formatted = result.current.formatCompact(5000000);
      expect(formatted.toLowerCase()).toMatch(/5.*m/i);
    });
  });

  describe('SUPPORTED_CURRENCIES constant', () => {
    it('should have multiple currencies', () => {
      expect(SUPPORTED_CURRENCIES.length).toBeGreaterThan(5);
    });

    it('should include common currencies', () => {
      const codes = SUPPORTED_CURRENCIES.map(c => c.code);
      expect(codes).toContain('USD');
      expect(codes).toContain('EUR');
      expect(codes).toContain('GBP');
      expect(codes).toContain('PLN');
    });

    it('should have required properties for all currencies', () => {
      SUPPORTED_CURRENCIES.forEach(currency => {
        expect(currency.code).toBeTruthy();
        expect(currency.symbol).toBeTruthy();
        expect(currency.name).toBeTruthy();
        expect(currency.locale).toBeTruthy();
      });
    });

    it('should have unique currency codes', () => {
      const codes = SUPPORTED_CURRENCIES.map(c => c.code);
      const uniqueCodes = [...new Set(codes)];
      expect(codes.length).toBe(uniqueCodes.length);
    });
  });
});
