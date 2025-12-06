// User preferences stored in database

// Reminder timing options
export type ReminderTiming = '1day' | '3days' | '1week' | '2weeks';

// New notification preferences structure
export interface NotificationPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  todoReminders: boolean;
  stageUpdates: boolean;
  budgetAlerts: boolean;
  reminderTiming: ReminderTiming;
}

// Legacy notification preferences (for migration)
interface LegacyNotificationPreferences {
  push?: boolean;
  email?: boolean;
  deadlines?: boolean;
  budgetAlerts?: boolean;
}

// Default notification preferences
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  pushEnabled: true,
  emailEnabled: true,
  todoReminders: true,
  stageUpdates: true,
  budgetAlerts: true,
  reminderTiming: '1day',
};

// Migration helper for existing users with old preference format
export function migrateNotificationPreferences(
  old: Record<string, unknown> | undefined
): NotificationPreferences {
  if (!old) return DEFAULT_NOTIFICATION_PREFERENCES;

  // Already migrated - has new fields
  if ('pushEnabled' in old && 'reminderTiming' in old) {
    return old as NotificationPreferences;
  }

  // Migrate from legacy format
  const legacy = old as LegacyNotificationPreferences;
  return {
    pushEnabled: legacy.push ?? true,
    emailEnabled: legacy.email ?? true,
    todoReminders: legacy.deadlines ?? true,
    stageUpdates: true,
    budgetAlerts: legacy.budgetAlerts ?? true,
    reminderTiming: '1day',
  };
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
  notifications: DEFAULT_NOTIFICATION_PREFERENCES,
};
