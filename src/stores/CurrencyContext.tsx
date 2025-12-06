import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY, CurrencyInfo } from '../constants/currencies';

// Re-export for backward compatibility
export { SUPPORTED_CURRENCIES, CurrencyInfo } from '../constants/currencies';

const CURRENCY_STORAGE_KEY = '@homenest_currency';

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
  const [currency, setCurrencyState] = useState<CurrencyInfo>(DEFAULT_CURRENCY);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved currency on mount
  useEffect(() => {
    loadCurrency();
  }, []);

  const loadCurrency = async () => {
    try {
      const saved = await AsyncStorage.getItem(CURRENCY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CurrencyInfo;
        // Validate it's still a supported currency
        const found = SUPPORTED_CURRENCIES.find(c => c.code === parsed.code);
        if (found) {
          setCurrencyState(found);
        }
      }
    } catch (error) {
      console.error('Failed to load currency preference:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setCurrency = async (newCurrency: CurrencyInfo) => {
    try {
      await AsyncStorage.setItem(CURRENCY_STORAGE_KEY, JSON.stringify(newCurrency));
      setCurrencyState(newCurrency);
    } catch (error) {
      console.error('Failed to save currency preference:', error);
      throw error;
    }
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatCompact = (amount: number): string => {
    if (amount >= 1000000) {
      return `${currency.symbol}${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${currency.symbol}${(amount / 1000).toFixed(1)}K`;
    }
    return `${currency.symbol}${amount.toFixed(0)}`;
  };

  // Don't render until we've loaded the preference
  if (!isLoaded) {
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
