import React, { createContext, useContext, useCallback, useMemo, ReactNode } from 'react';
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY, CurrencyInfo } from '../constants/currencies';
import { usePreferences } from './PreferencesContext';

// Re-export for backward compatibility
export { SUPPORTED_CURRENCIES, CurrencyInfo } from '../constants/currencies';

interface CurrencyContextType {
  currency: CurrencyInfo;
  setCurrency: (currency: CurrencyInfo) => Promise<void>;
  formatAmount: (amount: number) => string;
  formatCompact: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const { preferences, updatePreferences, isLoading } = usePreferences();

  // Get currency from preferences
  const currency = useMemo(() => {
    const found = SUPPORTED_CURRENCIES.find(c => c.code === preferences.currency);
    return found || DEFAULT_CURRENCY;
  }, [preferences.currency]);

  const setCurrency = useCallback(async (newCurrency: CurrencyInfo) => {
    await updatePreferences({
      currency: newCurrency.code,
      currencySymbol: newCurrency.symbol,
    });
  }, [updatePreferences]);

  const formatAmount = useCallback((amount: number): string => {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }, [currency]);

  const formatCompact = useCallback((amount: number): string => {
    if (amount >= 1000000) {
      return `${currency.symbol}${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${currency.symbol}${(amount / 1000).toFixed(1)}K`;
    }
    return `${currency.symbol}${amount.toFixed(0)}`;
  }, [currency]);

  // Don't render until preferences are loaded
  if (isLoading) {
    return null;
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount, formatCompact }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
