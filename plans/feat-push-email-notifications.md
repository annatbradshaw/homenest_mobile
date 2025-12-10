# feat: Push and Email Notification System

## Overview

Implement a customizable notification system for HomeNest Mobile that supports both push and email channels, allowing users to control notification types and reminder timing for deadlines.

## Problem Statement

Users need to stay informed about:
- **Todo deadlines** approaching (assigned tasks, due dates)
- **Stage updates** (stage starting, stage completed)
- **Budget alerts** (spending thresholds exceeded)

Currently, the app has basic notification preferences in `user_profiles.preferences` with boolean flags (`push`, `email`, `deadlines`, `budgetAlerts`) but no infrastructure to actually send notifications.

## Proposed Solution

Build a notification system with:
1. **Database tables** for push tokens and notification history (audit trail)
2. **Enhanced preferences** with reminder timing options (1d/3d/1w/2w)
3. **Expo Push Notifications** for mobile push
4. **Resend** for branded HTML transactional emails
5. **Scheduled jobs** for deadline reminders using pg_cron

## Technical Approach

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Native App                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ usePushNotifs   │  │ PreferencesCtx  │  │ Settings Screen │  │
│  │ (expo-notifs)   │  │ (enhanced)      │  │ (connected)     │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
└───────────┼────────────────────┼────────────────────┼───────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Supabase                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ push_tokens │  │notifications│  │ user_profiles.preferences│  │
│  │   (new)     │  │ (audit log) │  │     (enhanced)          │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
│         │                │                     │                 │
│         ▼                ▼                     │                 │
│  ┌─────────────────────────────────────┐      │                 │
│  │   send-notification (Edge Function) │      │                 │
│  │   - Handles both push & email       │      │                 │
│  │   - Expo API + Resend integration   │      │                 │
│  └─────────────────────────────────────┘      │                 │
│         ▲                                     │                 │
│         │                                     │                 │
│  ┌──────┴──────────────────────────────┐     │                 │
│  │  pg_cron + Database Triggers        │◄────┘                 │
│  │  - check_deadline_reminders()       │                       │
│  │  - check_stage_reminders()          │                       │
│  │  - budget alert trigger             │                       │
│  └─────────────────────────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

### Database Schema

#### `push_tokens` table

```sql
-- push_tokens.sql
CREATE TABLE public.push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, token)
);

-- Indexes
CREATE INDEX idx_push_tokens_user_active ON push_tokens(user_id) WHERE is_active = true;

-- RLS
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tokens"
  ON push_tokens FOR ALL
  USING (auth.uid() = user_id);
```

#### `notifications` table (audit log)

```sql
-- notifications.sql
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed');
CREATE TYPE notification_channel AS ENUM ('push', 'email');
CREATE TYPE notification_type AS ENUM (
  'todo_due_reminder',
  'stage_starting',
  'stage_completed',
  'budget_warning',
  'budget_exceeded'
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Content
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',

  -- Delivery
  channel notification_channel NOT NULL,
  status notification_status DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error_message TEXT,

  -- References (for audit/debugging)
  related_type TEXT, -- 'todo', 'stage', 'project'
  related_id UUID,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- Prevent duplicate notifications (race condition protection)
CREATE UNIQUE INDEX idx_notifications_no_duplicates
  ON notifications (user_id, type, related_id, channel, (created_at::date))
  WHERE created_at > NOW() - INTERVAL '1 day';

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);
```

#### Enhanced Preferences Schema

```typescript
// src/types/preferences.ts

// Reminder timing options
export type ReminderTiming = '1day' | '3days' | '1week' | '2weeks';

export interface NotificationPreferences {
  // Global channel toggles
  pushEnabled: boolean;
  emailEnabled: boolean;

  // Per-type toggles (simpler flat structure)
  todoReminders: boolean;
  stageUpdates: boolean;
  budgetAlerts: boolean;

  // Reminder timing
  reminderTiming: ReminderTiming;
}

// Default preferences for new users
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  pushEnabled: true,
  emailEnabled: true,
  todoReminders: true,
  stageUpdates: true,
  budgetAlerts: true,
  reminderTiming: '1day',
};

// Migration helper for existing users (old format -> new format)
export function migrateNotificationPreferences(
  old: Record<string, unknown> | undefined
): NotificationPreferences {
  if (!old) {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }

  // Already new format
  if ('pushEnabled' in old && 'reminderTiming' in old) {
    return old as NotificationPreferences;
  }

  // Migrate from legacy format: { push, email, deadlines, budgetAlerts }
  const legacy = old as {
    push?: boolean;
    email?: boolean;
    deadlines?: boolean;
    budgetAlerts?: boolean;
  };

  return {
    pushEnabled: legacy.push ?? true,
    emailEnabled: legacy.email ?? true,
    todoReminders: legacy.deadlines ?? true,
    stageUpdates: true,
    budgetAlerts: legacy.budgetAlerts ?? true,
    reminderTiming: '1day',
  };
}

// Helper to convert timing to hours
export function reminderTimingToHours(timing: ReminderTiming): number {
  const map: Record<ReminderTiming, number> = {
    '1day': 24,
    '3days': 72,
    '1week': 168,
    '2weeks': 336,
  };
  return map[timing];
}
```

### Implementation Phases

#### Phase 1: Database & Types

**Tasks:**
- [ ] Create `push_tokens` table migration via Supabase MCP
- [ ] Create `notifications` table migration via Supabase MCP
- [ ] Update TypeScript types with migration helper
- [ ] Generate Supabase database types

**Files to create/modify:**

```typescript
// src/types/notifications.ts
import type { Database } from './supabase';

export type NotificationType = Database['public']['Enums']['notification_type'];
export type NotificationChannel = Database['public']['Enums']['notification_channel'];
export type NotificationStatus = Database['public']['Enums']['notification_status'];

export type Notification = Database['public']['Tables']['notifications']['Row'];
export type PushToken = Database['public']['Tables']['push_tokens']['Row'];
```

**Success criteria:**
- Tables created with proper RLS and indexes
- Types generated from database schema
- Migration helper tested

#### Phase 2: Push Token Management

**Tasks:**
- [ ] Install `expo-notifications` and `expo-device`
- [ ] Create `usePushNotifications` hook
- [ ] Register token on login, cleanup on logout
- [ ] Handle token refresh

**Files to create:**

```typescript
// src/hooks/usePushNotifications.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/stores/AuthContext';
import { supabase } from '@/lib/supabase';

// Configure notification handler (call early in app lifecycle)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface UsePushNotificationsResult {
  token: string | null;
  permissionStatus: Notifications.PermissionStatus | null;
  requestPermission: () => Promise<boolean>;
  error: string | null;
}

export function usePushNotifications(): UsePushNotificationsResult {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  const registerToken = useCallback(async (userId: string) => {
    try {
      if (!Device.isDevice) {
        setError('Push notifications require a physical device');
        return null;
      }

      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);

      if (status !== 'granted') {
        return null;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        setError('Missing EAS project ID');
        return null;
      }

      const { data: tokenData } = await Notifications.getExpoPushTokenAsync({ projectId });

      // Store in Supabase
      const { error: upsertError } = await supabase.from('push_tokens').upsert(
        {
          user_id: userId,
          token: tokenData,
          platform: Platform.OS as 'ios' | 'android',
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,token' }
      );

      if (upsertError) {
        console.error('Failed to store push token:', upsertError);
        setError(upsertError.message);
        return null;
      }

      setToken(tokenData);
      setError(null);
      return tokenData;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Push registration failed:', message);
      setError(message);
      return null;
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!Device.isDevice) {
      setError('Push notifications require a physical device');
      return false;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionStatus(status);

    if (status === 'granted' && user?.id) {
      await registerToken(user.id);
      return true;
    }

    return status === 'granted';
  }, [user?.id, registerToken]);

  // Register on login
  useEffect(() => {
    if (!user?.id) {
      setToken(null);
      return;
    }

    registerToken(user.id);

    // Handle foreground notifications
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification.request.content.title);
    });

    // Handle notification taps
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const url = response.notification.request.content.data?.url;
      if (typeof url === 'string') {
        router.push(url);
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [user?.id, registerToken]);

  // Cleanup token on logout
  useEffect(() => {
    return () => {
      if (token && user?.id) {
        // Mark token as inactive on unmount (logout)
        supabase
          .from('push_tokens')
          .update({ is_active: false })
          .eq('user_id', user.id)
          .eq('token', token)
          .then(({ error }) => {
            if (error) console.error('Failed to deactivate token:', error);
          });
      }
    };
  }, [token, user?.id]);

  return { token, permissionStatus, requestPermission, error };
}
```

**Success criteria:**
- Tokens stored in database on login
- Tokens deactivated on logout
- Deep linking works on notification tap

#### Phase 3: Notification Preferences UI

**Tasks:**
- [ ] Update PreferencesContext with notification migration
- [ ] Connect settings screen to preferences
- [ ] Add timing selector (1d/3d/1w/2w)
- [ ] Add translations

**Files to modify:**

```typescript
// src/app/(tabs)/settings/notifications.tsx
import { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { usePreferences } from '@/stores/PreferencesContext';
import { useTranslation } from '@/hooks/useTranslation';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useTheme } from '@/stores/ThemeContext';
import type { ReminderTiming, NotificationPreferences } from '@/types/preferences';

const TIMING_OPTIONS: { value: ReminderTiming; label: string }[] = [
  { value: '1day', label: '1 day before' },
  { value: '3days', label: '3 days before' },
  { value: '1week', label: '1 week before' },
  { value: '2weeks', label: '2 weeks before' },
];

export default function NotificationSettings() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { preferences, updatePreferences } = usePreferences();
  const { permissionStatus, requestPermission } = usePushNotifications();
  const [saving, setSaving] = useState(false);

  const notifications = preferences.notifications;

  const handleToggle = useCallback(
    async (key: keyof NotificationPreferences, value: boolean) => {
      setSaving(true);
      try {
        await updatePreferences({
          notifications: { ...notifications, [key]: value },
        });
      } finally {
        setSaving(false);
      }
    },
    [notifications, updatePreferences]
  );

  const handleTimingChange = useCallback(
    async (timing: ReminderTiming) => {
      setSaving(true);
      try {
        await updatePreferences({
          notifications: { ...notifications, reminderTiming: timing },
        });
      } finally {
        setSaving(false);
      }
    },
    [notifications, updatePreferences]
  );

  const handleEnablePush = useCallback(async () => {
    const granted = await requestPermission();
    if (granted) {
      handleToggle('pushEnabled', true);
    }
  }, [requestPermission, handleToggle]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Channels Section */}
      <SettingSection title={t('settings.notifications.channels')}>
        <ToggleRow
          label={t('settings.notifications.push')}
          description={t('settings.notifications.pushDescription')}
          value={notifications.pushEnabled}
          onValueChange={(v) => (v ? handleEnablePush() : handleToggle('pushEnabled', false))}
          disabled={saving}
        />
        <ToggleRow
          label={t('settings.notifications.email')}
          description={t('settings.notifications.emailDescription')}
          value={notifications.emailEnabled}
          onValueChange={(v) => handleToggle('emailEnabled', v)}
          disabled={saving}
        />
      </SettingSection>

      {/* Notification Types Section */}
      <SettingSection title={t('settings.notifications.types')}>
        <ToggleRow
          label={t('settings.notifications.todoReminders')}
          description={t('settings.notifications.todoRemindersDescription')}
          value={notifications.todoReminders}
          onValueChange={(v) => handleToggle('todoReminders', v)}
          disabled={saving}
        />
        <ToggleRow
          label={t('settings.notifications.stageUpdates')}
          description={t('settings.notifications.stageUpdatesDescription')}
          value={notifications.stageUpdates}
          onValueChange={(v) => handleToggle('stageUpdates', v)}
          disabled={saving}
        />
        <ToggleRow
          label={t('settings.notifications.budgetAlerts')}
          description={t('settings.notifications.budgetAlertsDescription')}
          value={notifications.budgetAlerts}
          onValueChange={(v) => handleToggle('budgetAlerts', v)}
          disabled={saving}
        />
      </SettingSection>

      {/* Reminder Timing Section */}
      <SettingSection title={t('settings.notifications.reminderTiming')}>
        <TimingPicker
          options={TIMING_OPTIONS}
          selected={notifications.reminderTiming}
          onSelect={handleTimingChange}
          disabled={saving}
        />
      </SettingSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

**Success criteria:**
- Preferences persist to database
- Migration works for existing users
- UI responsive during saves

#### Phase 4: Edge Function for Sending Notifications

**Tasks:**
- [ ] Create single `send-notification` Edge Function
- [ ] Handle both push and email channels
- [ ] Implement HTML email templates with branding
- [ ] Add HTML escaping for security
- [ ] Handle invalid token cleanup
- [ ] Set up secrets

**Files to create:**

```typescript
// supabase/functions/send-notification/index.ts
import { createClient } from 'npm:@supabase/supabase-js@2';
import { Resend } from 'npm:resend@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface NotificationPayload {
  user_id: string;
  type: string;
  title: string;
  body: string;
  channel: 'push' | 'email';
  data?: Record<string, unknown>;
  notification_id: string;
}

// HTML escape to prevent XSS
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function buildEmailTemplate(title: string, body: string, ctaUrl?: string): string {
  const safeTitle = escapeHtml(title);
  const safeBody = escapeHtml(body);
  const unsubscribeUrl = 'https://app.homenest.app/settings/notifications';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
    }
    .wrapper {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white;
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    }
    .content {
      padding: 32px 24px;
    }
    .content h2 {
      margin: 0 0 16px;
      font-size: 20px;
      color: #111827;
    }
    .content p {
      margin: 0 0 24px;
      color: #4b5563;
    }
    .button {
      display: inline-block;
      background: #2563eb;
      color: white !important;
      padding: 14px 28px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
    }
    .footer {
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .footer a {
      color: #2563eb;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>HomeNest</h1>
      </div>
      <div class="content">
        <h2>${safeTitle}</h2>
        <p>${safeBody}</p>
        ${ctaUrl ? `<a href="${ctaUrl}" class="button">View Details</a>` : ''}
      </div>
      <div class="footer">
        <p>You received this email because you have notifications enabled.</p>
        <p><a href="${unsubscribeUrl}">Manage notification preferences</a> | <a href="${unsubscribeUrl}?unsubscribe=email">Unsubscribe from emails</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function sendPush(payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
  // Get user's active push tokens
  const { data: tokens, error: tokenError } = await supabase
    .from('push_tokens')
    .select('id, token')
    .eq('user_id', payload.user_id)
    .eq('is_active', true);

  if (tokenError) {
    return { success: false, error: tokenError.message };
  }

  const validTokens = tokens?.filter((t) => t.token && typeof t.token === 'string') ?? [];

  if (validTokens.length === 0) {
    return { success: false, error: 'No active push tokens' };
  }

  // Send via Expo Push API
  const messages = validTokens.map((t) => ({
    to: t.token,
    sound: 'default' as const,
    title: payload.title,
    body: payload.body,
    data: payload.data ?? {},
  }));

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('EXPO_ACCESS_TOKEN')}`,
    },
    body: JSON.stringify(messages),
  });

  if (!response.ok) {
    return { success: false, error: `Expo API error: ${response.status}` };
  }

  const result = await response.json();

  // Cleanup invalid tokens
  if (Array.isArray(result.data)) {
    const invalidTokenIds = result.data
      .map((item: { status: string; details?: { error?: string } }, index: number) => {
        if (item.status === 'error' && item.details?.error === 'DeviceNotRegistered') {
          return validTokens[index]?.id;
        }
        return null;
      })
      .filter((id: string | null): id is string => id !== null);

    if (invalidTokenIds.length > 0) {
      await supabase.from('push_tokens').update({ is_active: false }).in('id', invalidTokenIds);
    }
  }

  return { success: true };
}

async function sendEmail(payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
  // Get user email
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(payload.user_id);

  if (userError || !userData.user?.email) {
    return { success: false, error: userError?.message ?? 'No email address' };
  }

  const ctaUrl = payload.data?.url ? `homenest://${payload.data.url}` : undefined;
  const html = buildEmailTemplate(payload.title, payload.body, ctaUrl);

  const { error: emailError } = await resend.emails.send({
    from: 'HomeNest <notifications@homenest.app>',
    to: userData.user.email,
    subject: payload.title,
    html,
  });

  if (emailError) {
    return { success: false, error: emailError.message };
  }

  return { success: true };
}

Deno.serve(async (req) => {
  try {
    const payload: NotificationPayload = await req.json();

    // Validate required fields
    if (!payload.user_id || !payload.title || !payload.body || !payload.channel || !payload.notification_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = payload.channel === 'push'
      ? await sendPush(payload)
      : await sendEmail(payload);

    // Update notification status
    await supabase
      .from('notifications')
      .update({
        status: result.success ? 'sent' : 'failed',
        sent_at: result.success ? new Date().toISOString() : null,
        error_message: result.error ?? null,
      })
      .eq('id', payload.notification_id);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('send-notification error:', message);

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

**Deployment:**
```bash
# Set secrets
supabase secrets set EXPO_ACCESS_TOKEN=your_expo_token
supabase secrets set RESEND_API_KEY=re_xxx

# Deploy
supabase functions deploy send-notification
```

**Success criteria:**
- Push notifications delivered via Expo
- Branded HTML emails sent via Resend
- Invalid tokens automatically cleaned up
- Notification status tracked in database

#### Phase 5: Scheduled Reminder Jobs

**Tasks:**
- [ ] Enable pg_cron extension
- [ ] Create `check_todo_reminders()` function
- [ ] Create `check_stage_reminders()` function
- [ ] Set up hourly cron job
- [ ] Use pg_net to call Edge Function

**SQL to create:**

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Helper function to call send-notification Edge Function
CREATE OR REPLACE FUNCTION public.call_send_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_body TEXT,
  p_channel notification_channel,
  p_related_type TEXT,
  p_related_id UUID,
  p_data JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
  v_service_role_key TEXT;
  v_supabase_url TEXT;
BEGIN
  -- Insert notification record
  INSERT INTO notifications (user_id, type, title, body, channel, related_type, related_id, data)
  VALUES (p_user_id, p_type, p_title, p_body, p_channel, p_related_type, p_related_id, p_data)
  RETURNING id INTO v_notification_id;

  -- Get secrets (set via Supabase dashboard or vault)
  v_supabase_url := current_setting('app.settings.supabase_url', true);
  v_service_role_key := current_setting('app.settings.service_role_key', true);

  -- Call Edge Function via pg_net
  PERFORM net.http_post(
    url := v_supabase_url || '/functions/v1/send-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_service_role_key
    ),
    body := jsonb_build_object(
      'user_id', p_user_id,
      'type', p_type,
      'title', p_title,
      'body', p_body,
      'channel', p_channel,
      'data', p_data,
      'notification_id', v_notification_id
    )
  );

  RETURN v_notification_id;
END;
$$;

-- Check todo deadline reminders
CREATE OR REPLACE FUNCTION public.check_todo_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  todo_record RECORD;
  user_prefs JSONB;
  reminder_hours INTEGER;
BEGIN
  FOR todo_record IN
    SELECT
      t.id,
      t.title,
      t.due_date,
      t.assigned_to,
      up.preferences
    FROM todos t
    JOIN user_profiles up ON up.id = t.assigned_to
    WHERE t.due_date IS NOT NULL
      AND t.status NOT IN ('completed', 'cancelled')
      AND t.due_date > NOW()
      AND t.due_date <= NOW() + INTERVAL '14 days'
  LOOP
    user_prefs := todo_record.preferences->'notifications';

    -- Skip if todo reminders disabled
    IF NOT COALESCE((user_prefs->>'todoReminders')::boolean, true) THEN
      CONTINUE;
    END IF;

    -- Get reminder hours from preference
    reminder_hours := CASE COALESCE(user_prefs->>'reminderTiming', '1day')
      WHEN '1day' THEN 24
      WHEN '3days' THEN 72
      WHEN '1week' THEN 168
      WHEN '2weeks' THEN 336
      ELSE 24
    END;

    -- Check if within reminder window (using interval multiplication for safety)
    IF todo_record.due_date <= NOW() + (reminder_hours * INTERVAL '1 hour')
       AND todo_record.due_date > NOW() + ((reminder_hours - 1) * INTERVAL '1 hour') THEN

      -- Send push if enabled (duplicate prevention via unique index)
      IF COALESCE((user_prefs->>'pushEnabled')::boolean, true) THEN
        BEGIN
          PERFORM call_send_notification(
            todo_record.assigned_to,
            'todo_due_reminder',
            'Task Due Soon',
            'Your task "' || todo_record.title || '" is due soon',
            'push',
            'todo',
            todo_record.id,
            jsonb_build_object('url', 'todos/' || todo_record.id)
          );
        EXCEPTION WHEN unique_violation THEN
          -- Duplicate, skip
          NULL;
        END;
      END IF;

      -- Send email if enabled
      IF COALESCE((user_prefs->>'emailEnabled')::boolean, true) THEN
        BEGIN
          PERFORM call_send_notification(
            todo_record.assigned_to,
            'todo_due_reminder',
            'Task Due Soon',
            'Your task "' || todo_record.title || '" is due soon',
            'email',
            'todo',
            todo_record.id,
            jsonb_build_object('url', 'todos/' || todo_record.id)
          );
        EXCEPTION WHEN unique_violation THEN
          NULL;
        END;
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- Check stage reminders (stages starting soon)
CREATE OR REPLACE FUNCTION public.check_stage_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stage_record RECORD;
  user_prefs JSONB;
  reminder_hours INTEGER;
BEGIN
  FOR stage_record IN
    SELECT
      s.id,
      s.name,
      s.planned_start_date,
      s.project_id,
      p.created_by,
      up.preferences
    FROM stages s
    JOIN projects p ON p.id = s.project_id
    JOIN user_profiles up ON up.id = p.created_by
    WHERE s.planned_start_date IS NOT NULL
      AND s.status = 'not-started'
      AND s.planned_start_date > NOW()
      AND s.planned_start_date <= NOW() + INTERVAL '14 days'
  LOOP
    user_prefs := stage_record.preferences->'notifications';

    IF NOT COALESCE((user_prefs->>'stageUpdates')::boolean, true) THEN
      CONTINUE;
    END IF;

    reminder_hours := CASE COALESCE(user_prefs->>'reminderTiming', '1day')
      WHEN '1day' THEN 24
      WHEN '3days' THEN 72
      WHEN '1week' THEN 168
      WHEN '2weeks' THEN 336
      ELSE 24
    END;

    IF stage_record.planned_start_date <= NOW() + (reminder_hours * INTERVAL '1 hour')
       AND stage_record.planned_start_date > NOW() + ((reminder_hours - 1) * INTERVAL '1 hour') THEN

      IF COALESCE((user_prefs->>'pushEnabled')::boolean, true) THEN
        BEGIN
          PERFORM call_send_notification(
            stage_record.created_by,
            'stage_starting',
            'Stage Starting Soon',
            'Stage "' || stage_record.name || '" is scheduled to start soon',
            'push',
            'stage',
            stage_record.id,
            jsonb_build_object('url', 'projects/' || stage_record.project_id)
          );
        EXCEPTION WHEN unique_violation THEN
          NULL;
        END;
      END IF;

      IF COALESCE((user_prefs->>'emailEnabled')::boolean, true) THEN
        BEGIN
          PERFORM call_send_notification(
            stage_record.created_by,
            'stage_starting',
            'Stage Starting Soon',
            'Stage "' || stage_record.name || '" is scheduled to start soon',
            'email',
            'stage',
            stage_record.id,
            jsonb_build_object('url', 'projects/' || stage_record.project_id)
          );
        EXCEPTION WHEN unique_violation THEN
          NULL;
        END;
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- Schedule hourly cron jobs
SELECT cron.schedule('check-todo-reminders', '0 * * * *', 'SELECT public.check_todo_reminders()');
SELECT cron.schedule('check-stage-reminders', '15 * * * *', 'SELECT public.check_stage_reminders()');
```

**Success criteria:**
- Reminders sent at configured timing (1d/3d/1w/2w)
- No duplicate notifications (unique index prevents)
- Stage start reminders working

#### Phase 6: Budget Alert Trigger

**Tasks:**
- [ ] Create trigger on expenses table
- [ ] Alert at 80% and 100% thresholds
- [ ] Respect user preferences

**SQL to create:**

```sql
-- Budget alert trigger
CREATE OR REPLACE FUNCTION public.check_budget_alert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_record RECORD;
  user_prefs JSONB;
  utilization NUMERIC;
  alert_type notification_type;
BEGIN
  -- Get project with owner preferences
  SELECT
    p.id,
    p.name,
    p.total_budget,
    p.actual_spent,
    p.created_by,
    up.preferences
  INTO project_record
  FROM projects p
  JOIN user_profiles up ON up.id = p.created_by
  WHERE p.id = NEW.project_id;

  IF project_record IS NULL OR project_record.total_budget <= 0 THEN
    RETURN NEW;
  END IF;

  -- Calculate utilization
  utilization := (project_record.actual_spent / project_record.total_budget) * 100;

  -- Determine alert type
  IF utilization >= 100 THEN
    alert_type := 'budget_exceeded';
  ELSIF utilization >= 80 THEN
    alert_type := 'budget_warning';
  ELSE
    RETURN NEW;
  END IF;

  user_prefs := project_record.preferences->'notifications';

  -- Check if budget alerts enabled
  IF NOT COALESCE((user_prefs->>'budgetAlerts')::boolean, true) THEN
    RETURN NEW;
  END IF;

  -- Send notifications (duplicate prevention via unique index)
  IF COALESCE((user_prefs->>'pushEnabled')::boolean, true) THEN
    BEGIN
      PERFORM call_send_notification(
        project_record.created_by,
        alert_type,
        CASE alert_type
          WHEN 'budget_exceeded' THEN 'Budget Exceeded!'
          ELSE 'Budget Warning'
        END,
        'Project "' || project_record.name || '" is at ' || ROUND(utilization) || '% of budget',
        'push',
        'project',
        project_record.id,
        jsonb_build_object('url', 'projects/' || project_record.id)
      );
    EXCEPTION WHEN unique_violation THEN
      NULL;
    END;
  END IF;

  IF COALESCE((user_prefs->>'emailEnabled')::boolean, true) THEN
    BEGIN
      PERFORM call_send_notification(
        project_record.created_by,
        alert_type,
        CASE alert_type
          WHEN 'budget_exceeded' THEN 'Budget Exceeded!'
          ELSE 'Budget Warning'
        END,
        'Project "' || project_record.name || '" is at ' || ROUND(utilization) || '% of budget',
        'email',
        'project',
        project_record.id,
        jsonb_build_object('url', 'projects/' || project_record.id)
      );
    EXCEPTION WHEN unique_violation THEN
      NULL;
    END;
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger
CREATE TRIGGER expense_budget_alert
AFTER INSERT OR UPDATE ON expenses
FOR EACH ROW
EXECUTE FUNCTION check_budget_alert();
```

**Success criteria:**
- Alerts at 80% and 100% thresholds
- One alert per threshold per day max
- User preferences respected

## Acceptance Criteria

### Functional Requirements

- [ ] Users can enable/disable push notifications globally
- [ ] Users can enable/disable email notifications globally
- [ ] Users can toggle notification types: todo reminders, stage updates, budget alerts
- [ ] Users can select reminder timing: 1 day, 3 days, 1 week, or 2 weeks
- [ ] Push notifications delivered to user's registered device(s)
- [ ] Branded HTML email notifications with unsubscribe link
- [ ] Budget alerts at 80% and 100% thresholds
- [ ] Stage start reminders based on planned_start_date
- [ ] Tapping notification opens relevant screen in app
- [ ] Notification history stored for audit

### Non-Functional Requirements

- [ ] No duplicate notifications within 24 hours (unique index enforced)
- [ ] Invalid push tokens automatically cleaned up
- [ ] Preferences migrate gracefully from old format
- [ ] Graceful degradation when push permissions denied

### Testing Requirements

- [ ] Unit tests for preference migration function
- [ ] Unit tests for reminderTimingToHours helper
- [ ] Integration test for usePushNotifications hook
- [ ] Manual testing on iOS and Android devices
- [ ] Verify email HTML renders correctly in major email clients

## Dependencies & Prerequisites

1. **Expo Push Notifications** - EAS project ID: `275075db-7eb6-4f19-a34c-772bb5b9a3ac`
2. **Resend Account** - API key and verified sending domain (homenest.app)
3. **Supabase Extensions** - pg_cron and pg_net enabled
4. **Physical device** - Push notifications don't work in simulators

## Risk Analysis & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Push token invalidation | Users miss notifications | Auto-cleanup via DeviceNotRegistered detection |
| Email deliverability | Notifications go to spam | Resend + verified domain + proper SPF/DKIM |
| Rate limiting (Expo) | Delayed notifications | Batch sends, respect 600/sec limit |
| Permission denial | No push notifications | Email fallback, "enable in settings" prompt |
| Race conditions | Duplicate notifications | Unique partial index on notifications table |

## References

### Internal References
- Preferences type: `src/types/preferences.ts:1-33`
- Preferences context: `src/stores/PreferencesContext.tsx:1-164`
- Current notifications UI: `src/app/(tabs)/settings/notifications.tsx:1-207`
- Supabase client: `src/lib/supabase.ts:1-177`

### External References
- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo Push Notifications Setup](https://docs.expo.dev/push-notifications/push-notifications-setup/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Resend Supabase Integration](https://resend.com/supabase)
- [pg_cron Extension](https://supabase.com/docs/guides/database/extensions/pg_cron)
- [pg_net Extension](https://supabase.com/docs/guides/database/extensions/pgnet)

---

*Plan created: 2025-12-06*
*Updated: 2025-12-06 (incorporated reviewer feedback)*
