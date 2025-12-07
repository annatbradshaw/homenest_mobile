// User preferences stored in database

// Reminder timing options
export type ReminderTiming = '1day' | '3days' | '1week' | '2weeks';

// New notification preferences structure
export interface NotificationPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  // Task/Todo notifications
  todoReminders: boolean;
  todoReminderDaysBefore: number; // Days before due date to notify
  overdueReminders: boolean; // Remind about overdue tasks until completed
  overdueReminderFrequency: number; // How often to remind about overdue tasks (in days)
  // Granular stage notifications
  stageUpdates: boolean; // Legacy - kept for backwards compatibility
  stageStarting: boolean;
  stageStartingDaysBefore: number; // Days before stage starts to notify
  stageCompleted: boolean;
  // Granular budget notifications
  budgetAlerts: boolean; // Legacy - kept for backwards compatibility
  budgetWarning: boolean;
  budgetWarningThreshold: number; // Percentage threshold (e.g., 80 = 80%)
  budgetExceeded: boolean;
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
  todoReminderDaysBefore: 1,
  overdueReminders: true,
  overdueReminderFrequency: 1, // Daily by default
  stageUpdates: true,
  stageStarting: true,
  stageStartingDaysBefore: 3,
  stageCompleted: true,
  budgetAlerts: true,
  budgetWarning: true,
  budgetWarningThreshold: 80,
  budgetExceeded: true,
  reminderTiming: '1day',
};

// Migration helper for existing users with old preference format
export function migrateNotificationPreferences(
  old: Record<string, unknown> | undefined
): NotificationPreferences {
  if (!old) return DEFAULT_NOTIFICATION_PREFERENCES;

  // Start with defaults
  const result = { ...DEFAULT_NOTIFICATION_PREFERENCES };

  // Check if already migrated (has new granular fields)
  if ('stageStarting' in old && 'budgetWarning' in old) {
    return old as unknown as NotificationPreferences;
  }

  // Partial migration - has some new fields but not granular ones
  if ('pushEnabled' in old && 'reminderTiming' in old) {
    const partial = old as Partial<NotificationPreferences>;
    return {
      ...result,
      pushEnabled: partial.pushEnabled ?? result.pushEnabled,
      emailEnabled: partial.emailEnabled ?? result.emailEnabled,
      todoReminders: partial.todoReminders ?? result.todoReminders,
      stageUpdates: partial.stageUpdates ?? result.stageUpdates,
      stageStarting: partial.stageUpdates ?? result.stageStarting,
      stageCompleted: partial.stageUpdates ?? result.stageCompleted,
      budgetAlerts: partial.budgetAlerts ?? result.budgetAlerts,
      budgetWarning: partial.budgetAlerts ?? result.budgetWarning,
      budgetExceeded: partial.budgetAlerts ?? result.budgetExceeded,
      reminderTiming: partial.reminderTiming ?? result.reminderTiming,
    };
  }

  // Migrate from legacy format
  const legacy = old as LegacyNotificationPreferences;
  return {
    ...result,
    pushEnabled: legacy.push ?? true,
    emailEnabled: legacy.email ?? true,
    todoReminders: legacy.deadlines ?? true,
    stageUpdates: true,
    stageStarting: true,
    stageCompleted: true,
    budgetAlerts: legacy.budgetAlerts ?? true,
    budgetWarning: legacy.budgetAlerts ?? true,
    budgetExceeded: legacy.budgetAlerts ?? true,
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
