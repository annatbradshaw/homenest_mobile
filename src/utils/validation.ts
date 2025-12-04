// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password validation (NIST-compliant)
export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain a number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Phone number validation
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
}

// URL validation
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Slug validation
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

// Required field validation
export function isNotEmpty(value: string | null | undefined): boolean {
  return value !== null && value !== undefined && value.trim().length > 0;
}

// Number range validation
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

// Date validation
export function isValidDate(date: string): boolean {
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
}

export function isFutureDate(date: string): boolean {
  const parsed = new Date(date);
  return parsed > new Date();
}

export function isPastDate(date: string): boolean {
  const parsed = new Date(date);
  return parsed < new Date();
}

// Budget validation
export function isValidBudget(value: string | number): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num >= 0;
}

// File validation
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function isValidFileType(mimeType: string): boolean {
  return ALLOWED_FILE_TYPES.includes(mimeType);
}

export function isValidFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}

export interface FileValidation {
  isValid: boolean;
  errors: string[];
}

export function validateFile(mimeType: string, size: number): FileValidation {
  const errors: string[] = [];

  if (!isValidFileType(mimeType)) {
    errors.push('File type not supported. Allowed: PDF, JPG, PNG, GIF, WebP');
  }
  if (!isValidFileSize(size)) {
    errors.push('File size exceeds 10MB limit');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Rating validation
export function isValidRating(rating: number): boolean {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating);
}
