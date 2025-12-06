/**
 * Tests for constants and data structures
 * These tests validate data integrity and catch real bugs
 */

import { format, parse } from 'date-fns';
import { DATE_FORMATS } from '../constants/dateFormats';
import { SUPPORTED_CURRENCIES } from '../constants/currencies';

// Comprehensive list of valid ISO 4217 currency codes
// Source: https://en.wikipedia.org/wiki/ISO_4217
const ISO_4217_CODES = [
  'AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN',
  'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BRL',
  'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHF', 'CLP', 'CNY',
  'COP', 'CRC', 'CUC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD',
  'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP', 'GEL', 'GGP', 'GHS',
  'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF',
  'IDR', 'ILS', 'IMP', 'INR', 'IQD', 'IRR', 'ISK', 'JEP', 'JMD', 'JOD',
  'JPY', 'KES', 'KGS', 'KHR', 'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT',
  'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD',
  'MMK', 'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MYR', 'MZN',
  'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK',
  'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR',
  'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLL', 'SOS', 'SPL', 'SRD',
  'STN', 'SVC', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY',
  'TTD', 'TVD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'UYU', 'UZS', 'VEF',
  'VND', 'VUV', 'WST', 'XAF', 'XCD', 'XDR', 'XOF', 'XPF', 'YER', 'ZAR',
  'ZMW', 'ZWD'
];

// Valid BCP 47 locale patterns
const LOCALE_PATTERN = /^[a-z]{2}(-[A-Z]{2})?$/;

describe('DATE_FORMATS', () => {
  const testDate = new Date(2025, 11, 6); // December 6, 2025

  it('should have at least 3 format options covering major conventions', () => {
    expect(DATE_FORMATS.length).toBeGreaterThanOrEqual(3);

    // Must have the 3 major date format conventions
    const ids = DATE_FORMATS.map(f => f.id);
    expect(ids).toContain('mdy'); // US style
    expect(ids).toContain('dmy'); // European style
    expect(ids).toContain('ymd'); // ISO style
  });

  it('should have unique IDs', () => {
    const ids = DATE_FORMATS.map(f => f.id);
    const uniqueIds = [...new Set(ids)];
    expect(ids.length).toBe(uniqueIds.length);
  });

  it('should have all required properties with non-empty values', () => {
    DATE_FORMATS.forEach(fmt => {
      expect(fmt.id).toBeTruthy();
      expect(fmt.label).toBeTruthy();
      expect(fmt.example).toBeTruthy();
      expect(fmt.shortFormat).toBeTruthy();
      expect(fmt.longFormat).toBeTruthy();
    });
  });

  it('should have valid date-fns format strings that actually work', () => {
    DATE_FORMATS.forEach(fmt => {
      // These should not throw - if they do, the format string is invalid
      expect(() => format(testDate, fmt.shortFormat)).not.toThrow();
      expect(() => format(testDate, fmt.longFormat)).not.toThrow();
    });
  });

  it('should have examples that match the short format pattern', () => {
    DATE_FORMATS.forEach(fmt => {
      const formatted = format(testDate, fmt.shortFormat);
      // The example should be the same as formatting our test date
      // (since examples use Dec 6, 2025 which is our test date)
      expect(fmt.example).toBe(formatted);
    });
  });

  it('should have label that describes the format correctly', () => {
    DATE_FORMATS.forEach(fmt => {
      // Label should contain format indicators
      expect(fmt.label).toMatch(/[MDY]/);

      // MDY format should have month first
      if (fmt.id === 'mdy') {
        expect(fmt.shortFormat.indexOf('MM')).toBeLessThan(fmt.shortFormat.indexOf('dd'));
      }
      // DMY format should have day first
      if (fmt.id === 'dmy') {
        expect(fmt.shortFormat.indexOf('dd')).toBeLessThan(fmt.shortFormat.indexOf('MM'));
      }
      // YMD format should have year first
      if (fmt.id === 'ymd') {
        expect(fmt.shortFormat.indexOf('yyyy')).toBe(0);
      }
    });
  });

  it('should produce different outputs for different formats', () => {
    const outputs = DATE_FORMATS.map(fmt => format(testDate, fmt.shortFormat));
    const uniqueOutputs = [...new Set(outputs)];
    expect(outputs.length).toBe(uniqueOutputs.length);
  });
});

describe('SUPPORTED_CURRENCIES', () => {
  it('should have essential currencies for a home renovation app', () => {
    const codes = SUPPORTED_CURRENCIES.map(c => c.code);

    // Must have major world currencies
    expect(codes).toContain('USD');
    expect(codes).toContain('EUR');
    expect(codes).toContain('GBP');
    expect(codes).toContain('PLN'); // App supports Polish
  });

  it('should have unique currency codes', () => {
    const codes = SUPPORTED_CURRENCIES.map(c => c.code);
    const uniqueCodes = [...new Set(codes)];
    expect(codes.length).toBe(uniqueCodes.length);
  });

  it('should only use valid ISO 4217 currency codes', () => {
    SUPPORTED_CURRENCIES.forEach(currency => {
      expect(ISO_4217_CODES).toContain(currency.code);
    });
  });

  it('should have 3-letter uppercase currency codes per ISO 4217', () => {
    SUPPORTED_CURRENCIES.forEach(currency => {
      expect(currency.code).toMatch(/^[A-Z]{3}$/);
    });
  });

  it('should have non-empty symbols', () => {
    SUPPORTED_CURRENCIES.forEach(currency => {
      expect(currency.symbol.length).toBeGreaterThan(0);
    });
  });

  it('should have valid BCP 47 locale strings', () => {
    SUPPORTED_CURRENCIES.forEach(currency => {
      expect(currency.locale).toMatch(LOCALE_PATTERN);
    });
  });

  it('should have locales that work with Intl.NumberFormat', () => {
    SUPPORTED_CURRENCIES.forEach(currency => {
      // This should not throw if the locale is valid
      expect(() => {
        new Intl.NumberFormat(currency.locale, {
          style: 'currency',
          currency: currency.code,
        }).format(1234.56);
      }).not.toThrow();
    });
  });

  it('should format amounts correctly with Intl.NumberFormat', () => {
    const usd = SUPPORTED_CURRENCIES.find(c => c.code === 'USD');
    expect(usd).toBeDefined();

    const formatted = new Intl.NumberFormat(usd!.locale, {
      style: 'currency',
      currency: usd!.code,
    }).format(1234.56);

    // Should contain the dollar sign and the number
    expect(formatted).toContain('$');
    expect(formatted).toMatch(/1.*234/); // thousands separator might vary
  });

  it('should have consistent symbol/code relationships', () => {
    // Validate known currency symbols
    const knownSymbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'PLN': 'zł',
    };

    Object.entries(knownSymbols).forEach(([code, symbol]) => {
      const currency = SUPPORTED_CURRENCIES.find(c => c.code === code);
      if (currency) {
        expect(currency.symbol).toBe(symbol);
      }
    });
  });

  it('should have human-readable names', () => {
    SUPPORTED_CURRENCIES.forEach(currency => {
      // Name should be readable (contains letters, not just code)
      expect(currency.name.length).toBeGreaterThan(3);
      expect(currency.name).not.toBe(currency.code);
    });
  });
});
