import { useEffect, useRef, useState, useCallback } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../stores/AuthContext';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotificationState {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: string | null;
  permissionStatus: Notifications.PermissionStatus | null;
}

export function usePushNotifications() {
  const router = useRouter();
  const { user } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus | null>(null);

  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();
  const appState = useRef(AppState.currentState);

  // Register for push notifications
  const registerForPushNotifications = useCallback(async (): Promise<string | null> => {
    if (!Device.isDevice) {
      setError('Push notifications require a physical device');
      return null;
    }

    try {
      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setPermissionStatus(finalStatus);

      if (finalStatus !== 'granted') {
        setError('Permission not granted for push notifications');
        return null;
      }

      // Get Expo push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

      if (!projectId) {
        setError('No project ID found. Please configure EAS.');
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      const token = tokenData.data;

      // Configure Android channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'HomeNest Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6366f1',
        });
      }

      setExpoPushToken(token);
      setError(null);
      return token;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get push token';
      setError(message);
      return null;
    }
  }, []);

  // Save token to database
  const saveTokenToDatabase = useCallback(async (token: string) => {
    if (!user?.id) return;

    try {
      const platform = Platform.OS as 'ios' | 'android';

      // Upsert token (insert or update if exists)
      const { error: upsertError } = await supabase
        .from('push_tokens')
        .upsert(
          {
            user_id: user.id,
            token,
            platform,
            is_active: true,
          },
          {
            onConflict: 'user_id,token',
          }
        );

      if (upsertError) {
        console.error('Failed to save push token:', upsertError);
      }
    } catch (err) {
      console.error('Error saving push token:', err);
    }
  }, [user?.id]);

  // Deactivate token when user logs out
  const deactivateToken = useCallback(async () => {
    if (!user?.id || !expoPushToken) return;

    try {
      await supabase
        .from('push_tokens')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('token', expoPushToken);
    } catch (err) {
      console.error('Error deactivating push token:', err);
    }
  }, [user?.id, expoPushToken]);

  // Handle notification response (when user taps notification)
  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;

    // Navigate based on notification type
    if (data?.type && data?.relatedId) {
      switch (data.type) {
        case 'todo_due_reminder':
        case 'todo_overdue':
          if (data.projectId) {
            router.push(`/(tabs)/projects/${data.projectId}?tab=todos&todoId=${data.relatedId}`);
          }
          break;
        case 'stage_starting':
        case 'stage_completed':
          if (data.projectId) {
            router.push(`/(tabs)/projects/${data.projectId}?tab=stages&stageId=${data.relatedId}`);
          }
          break;
        case 'budget_warning':
        case 'budget_exceeded':
          if (data.projectId) {
            router.push(`/(tabs)/projects/${data.projectId}?tab=budget`);
          }
          break;
        default:
          // Navigate to notifications or home
          router.push('/(tabs)');
      }
    }
  }, [router]);

  // Initialize push notifications
  useEffect(() => {
    if (!user?.id) return;

    const setup = async () => {
      const token = await registerForPushNotifications();
      if (token) {
        await saveTokenToDatabase(token);
      }
    };

    setup();

    // Listen for incoming notifications while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    // Listen for notification taps
    responseListener.current = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

    // Handle app state changes to re-register token
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // Re-check permissions when app comes to foreground
        const { status } = await Notifications.getPermissionsAsync();
        setPermissionStatus(status);
      }
      appState.current = nextAppState;
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
      appStateSubscription.remove();
    };
  }, [user?.id, registerForPushNotifications, saveTokenToDatabase, handleNotificationResponse]);

  // Request permissions manually (for settings screen)
  const requestPermissions = useCallback(async () => {
    const token = await registerForPushNotifications();
    if (token) {
      await saveTokenToDatabase(token);
    }
    return token !== null;
  }, [registerForPushNotifications, saveTokenToDatabase]);

  // Get current badge count
  const getBadgeCount = useCallback(async () => {
    return await Notifications.getBadgeCountAsync();
  }, []);

  // Set badge count
  const setBadgeCount = useCallback(async (count: number) => {
    await Notifications.setBadgeCountAsync(count);
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    await Notifications.dismissAllNotificationsAsync();
    await Notifications.setBadgeCountAsync(0);
  }, []);

  return {
    expoPushToken,
    notification,
    error,
    permissionStatus,
    requestPermissions,
    deactivateToken,
    getBadgeCount,
    setBadgeCount,
    clearAllNotifications,
  };
}

export default usePushNotifications;
