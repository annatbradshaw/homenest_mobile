// User preferences stored in database
export interface NotificationPreferences {
  push: boolean;
  email: boolean;
  deadlines: boolean;
  budgetAlerts: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  currencySymbol: string;
  language: 'en' | 'pl';
  timezone: string;
  dateFormat: 'mdy' | 'dmy' | 'ymd';
  notifications: NotificationPreferences;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  currency: 'USD',
  currencySymbol: '$',
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dateFormat: 'mdy',
  notifications: {
    push: true,
    email: true,
    deadlines: true,
    budgetAlerts: true,
  },
};
