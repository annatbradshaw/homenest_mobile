import {
  formatCurrency,
  formatCompactCurrency,
  formatDate,
  formatShortDate,
  formatPercentage,
  calculatePercentage,
  formatFileSize,
  formatPhoneNumber,
  formatFullName,
  getInitials,
  formatStatus,
  getBudgetStatus,
} from '../utils/formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('should format USD currency', () => {
      const result = formatCurrency(1234.56, 'USD', 'en-US');
      expect(result).toContain('$');
      expect(result).toContain('1,234');
    });

    it('should format EUR currency', () => {
      const result = formatCurrency(1234.56, 'EUR', 'de-DE');
      expect(result).toContain('€');
    });

    it('should format PLN currency', () => {
      const result = formatCurrency(1234.56, 'PLN', 'pl-PL');
      expect(result).toContain('zł');
    });

    it('should handle zero', () => {
      const result = formatCurrency(0, 'USD', 'en-US');
      expect(result).toContain('$');
      expect(result).toContain('0');
    });

    it('should handle large numbers', () => {
      const result = formatCurrency(1000000, 'USD', 'en-US');
      expect(result).toContain('1,000,000');
    });
  });

  describe('formatCompactCurrency', () => {
    it('should format small amounts without suffix', () => {
      expect(formatCompactCurrency(500)).toBe('$500');
    });

    it('should format thousands with K suffix', () => {
      expect(formatCompactCurrency(5000)).toBe('$5.0K');
    });

    it('should format millions with M suffix', () => {
      expect(formatCompactCurrency(5000000)).toBe('$5.0M');
    });

    it('should handle decimal thousands', () => {
      expect(formatCompactCurrency(15500)).toBe('$15.5K');
    });
  });

  describe('formatDate', () => {
    it('should format date with default format', () => {
      const date = new Date(2025, 11, 6); // December 6, 2025
      const result = formatDate(date);
      expect(result).toBe('Dec 6, 2025');
    });

    it('should format date with custom format', () => {
      const date = new Date(2025, 11, 6);
      const result = formatDate(date, 'yyyy-MM-dd');
      expect(result).toBe('2025-12-06');
    });

    it('should accept string dates', () => {
      const result = formatDate('2025-12-06');
      expect(result).toContain('2025');
    });
  });

  describe('formatShortDate', () => {
    it('should format date as short', () => {
      const date = new Date(2025, 11, 6);
      const result = formatShortDate(date);
      expect(result).toBe('Dec 6');
    });
  });

  describe('formatPercentage', () => {
    it('should format whole numbers', () => {
      expect(formatPercentage(75)).toBe('75%');
    });

    it('should format with decimals', () => {
      expect(formatPercentage(75.5, 1)).toBe('75.5%');
    });

    it('should format zero', () => {
      expect(formatPercentage(0)).toBe('0%');
    });

    it('should format over 100%', () => {
      expect(formatPercentage(125)).toBe('125%');
    });
  });

  describe('calculatePercentage', () => {
    it('should calculate correct percentage', () => {
      expect(calculatePercentage(50, 100)).toBe(50);
    });

    it('should handle zero total', () => {
      expect(calculatePercentage(50, 0)).toBe(0);
    });

    it('should handle over 100%', () => {
      expect(calculatePercentage(150, 100)).toBe(150);
    });

    it('should handle decimal results', () => {
      expect(calculatePercentage(1, 3)).toBeCloseTo(33.33, 1);
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should handle zero', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format 10-digit US number', () => {
      expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
    });

    it('should format 11-digit US number with country code', () => {
      expect(formatPhoneNumber('11234567890')).toBe('+1 (123) 456-7890');
    });

    it('should handle already formatted numbers', () => {
      const input = '(123) 456-7890';
      expect(formatPhoneNumber(input)).toBe('(123) 456-7890');
    });

    it('should return original for invalid formats', () => {
      expect(formatPhoneNumber('12345')).toBe('12345');
    });
  });

  describe('formatFullName', () => {
    it('should combine first and last name', () => {
      expect(formatFullName('John', 'Doe')).toBe('John Doe');
    });

    it('should handle first name only', () => {
      expect(formatFullName('John', null)).toBe('John');
    });

    it('should handle last name only', () => {
      expect(formatFullName(null, 'Doe')).toBe('Doe');
    });

    it('should return Unknown for no names', () => {
      expect(formatFullName(null, null)).toBe('Unknown');
    });
  });

  describe('getInitials', () => {
    it('should get initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });

    it('should handle single name', () => {
      expect(getInitials('John')).toBe('JO');
    });

    it('should handle multiple names', () => {
      expect(getInitials('John Michael Doe')).toBe('JD');
    });

    it('should return ? for empty name', () => {
      expect(getInitials('')).toBe('?');
    });

    it('should uppercase initials', () => {
      expect(getInitials('john doe')).toBe('JD');
    });
  });

  describe('formatStatus', () => {
    it('should format hyphenated status', () => {
      expect(formatStatus('in-progress')).toBe('In Progress');
    });

    it('should format single word status', () => {
      expect(formatStatus('completed')).toBe('Completed');
    });

    it('should handle multiple hyphens', () => {
      expect(formatStatus('on-hold-pending')).toBe('On Hold Pending');
    });
  });

  describe('getBudgetStatus', () => {
    it('should return under when below 80%', () => {
      expect(getBudgetStatus(50, 100)).toBe('under');
    });

    it('should return near when between 80-100%', () => {
      expect(getBudgetStatus(85, 100)).toBe('near');
    });

    it('should return over when above 100%', () => {
      expect(getBudgetStatus(110, 100)).toBe('over');
    });

    it('should handle zero budget', () => {
      expect(getBudgetStatus(50, 0)).toBe('under');
    });
  });
});
