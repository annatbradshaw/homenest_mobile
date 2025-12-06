import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, Bell, Mail, Clock, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '../../../stores/ThemeContext';
import { useLanguage } from '../../../stores/LanguageContext';
import { usePreferences } from '../../../stores/PreferencesContext';
import { usePushNotifications } from '../../../hooks/usePushNotifications';
import { colors as themeColors } from '../../../config/theme';
import { ReminderTiming } from '../../../types/preferences';

interface ToggleItemProps {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  isDark: boolean;
  colors: typeof themeColors;
  disabled?: boolean;
  icon?: React.ReactNode;
}

function ToggleItem({ title, description, value, onValueChange, isDark, colors, disabled, icon }: ToggleItemProps) {
  return (
    <View style={[styles.toggleItem, disabled && styles.toggleItemDisabled]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <View style={styles.toggleContent}>
        <Text style={[
          styles.toggleTitle,
          { color: isDark ? colors.neutral[50] : colors.neutral[900] },
          disabled && { opacity: 0.5 }
        ]}>
          {title}
        </Text>
        <Text style={[
          styles.toggleDescription,
          { color: isDark ? colors.neutral[400] : colors.neutral[500] },
          disabled && { opacity: 0.5 }
        ]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: isDark ? colors.neutral[700] : colors.neutral[200], true: colors.primary[500] }}
        thumbColor="#fff"
        disabled={disabled}
      />
    </View>
  );
}

interface SelectItemProps {
  title: string;
  value: string;
  onPress: () => void;
  isDark: boolean;
  colors: typeof themeColors;
  icon?: React.ReactNode;
}

function SelectItem({ title, value, onPress, isDark, colors, icon }: SelectItemProps) {
  return (
    <TouchableOpacity style={styles.selectItem} onPress={onPress} activeOpacity={0.7}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <View style={styles.selectContent}>
        <Text style={[styles.selectTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
          {title}
        </Text>
      </View>
      <Text style={[styles.selectValue, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
        {value}
      </Text>
      <ChevronRight size={20} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
    </TouchableOpacity>
  );
}

const REMINDER_TIMING_OPTIONS: { value: ReminderTiming; labelKey: string }[] = [
  { value: '1day', labelKey: 'notifications.timing1Day' },
  { value: '3days', labelKey: 'notifications.timing3Days' },
  { value: '1week', labelKey: 'notifications.timing1Week' },
  { value: '2weeks', labelKey: 'notifications.timing2Weeks' },
];

export default function NotificationsScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const { preferences, updatePreferences } = usePreferences();
  const {
    permissionStatus,
    requestPermissions,
    expoPushToken,
    error: pushError
  } = usePushNotifications();

  const notificationPrefs = preferences.notifications ?? {
    pushEnabled: true,
    emailEnabled: true,
    todoReminders: true,
    stageUpdates: true,
    budgetAlerts: true,
    reminderTiming: '1day' as ReminderTiming,
  };

  const handlePushToggle = async (value: boolean) => {
    if (value && permissionStatus !== 'granted') {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(
          t('notifications.permissionRequired'),
          t('notifications.permissionRequiredDesc'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('notifications.openSettings'), onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
    }
    await updatePreferences({
      notifications: { ...notificationPrefs, pushEnabled: value },
    });
  };

  const handleEmailToggle = async (value: boolean) => {
    await updatePreferences({
      notifications: { ...notificationPrefs, emailEnabled: value },
    });
  };

  const handleTodoRemindersToggle = async (value: boolean) => {
    await updatePreferences({
      notifications: { ...notificationPrefs, todoReminders: value },
    });
  };

  const handleStageUpdatesToggle = async (value: boolean) => {
    await updatePreferences({
      notifications: { ...notificationPrefs, stageUpdates: value },
    });
  };

  const handleBudgetAlertsToggle = async (value: boolean) => {
    await updatePreferences({
      notifications: { ...notificationPrefs, budgetAlerts: value },
    });
  };

  const handleTimingPress = () => {
    Alert.alert(
      t('notifications.reminderTiming'),
      t('notifications.reminderTimingDesc'),
      REMINDER_TIMING_OPTIONS.map((option) => ({
        text: t(option.labelKey),
        onPress: async () => {
          await updatePreferences({
            notifications: { ...notificationPrefs, reminderTiming: option.value },
          });
        },
        style: option.value === notificationPrefs.reminderTiming ? 'default' : 'default',
      })).concat([{ text: t('common.cancel'), style: 'cancel', onPress: () => {} }])
    );
  };

  const getTimingLabel = (timing: ReminderTiming) => {
    const option = REMINDER_TIMING_OPTIONS.find((o) => o.value === timing);
    return option ? t(option.labelKey) : timing;
  };

  const channelsDisabled = !notificationPrefs.pushEnabled && !notificationPrefs.emailEnabled;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={isDark ? colors.neutral[50] : colors.neutral[900]} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('notifications.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Status Banner */}
        {permissionStatus === 'granted' && expoPushToken && (
          <View style={[
            styles.statusBanner,
            {
              backgroundColor: isDark ? `${colors.success[500]}20` : colors.success[50],
              borderColor: isDark ? colors.success[700] : colors.success[200]
            }
          ]}>
            <CheckCircle2 size={20} color={isDark ? colors.success[400] : colors.success[600]} />
            <Text style={[styles.statusText, { color: isDark ? colors.success[400] : colors.success[700] }]}>
              {t('notifications.pushEnabled')}
            </Text>
          </View>
        )}

        {pushError && (
          <View style={[
            styles.statusBanner,
            {
              backgroundColor: isDark ? `${colors.danger[500]}20` : colors.danger[50],
              borderColor: isDark ? colors.danger[700] : colors.danger[200]
            }
          ]}>
            <Text style={[styles.statusText, { color: isDark ? colors.danger[400] : colors.danger[700] }]}>
              {pushError}
            </Text>
          </View>
        )}

        {/* Channels Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
            {t('notifications.channels')}
          </Text>
          <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
            <ToggleItem
              title={t('notifications.pushNotifications')}
              description={t('notifications.pushDesc')}
              value={notificationPrefs.pushEnabled}
              onValueChange={handlePushToggle}
              isDark={isDark}
              colors={colors}
              icon={<Bell size={20} color={colors.primary[500]} />}
            />
            <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
            <ToggleItem
              title={t('notifications.emailNotifications')}
              description={t('notifications.emailDesc')}
              value={notificationPrefs.emailEnabled}
              onValueChange={handleEmailToggle}
              isDark={isDark}
              colors={colors}
              icon={<Mail size={20} color={colors.primary[500]} />}
            />
          </View>
        </View>

        {/* Types Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
            {t('notifications.types')}
          </Text>
          <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
            <ToggleItem
              title={t('notifications.taskReminders')}
              description={t('notifications.taskRemindersDesc')}
              value={notificationPrefs.todoReminders}
              onValueChange={handleTodoRemindersToggle}
              isDark={isDark}
              colors={colors}
              disabled={channelsDisabled}
            />
            <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
            <ToggleItem
              title={t('notifications.stageUpdates')}
              description={t('notifications.stageUpdatesDesc')}
              value={notificationPrefs.stageUpdates}
              onValueChange={handleStageUpdatesToggle}
              isDark={isDark}
              colors={colors}
              disabled={channelsDisabled}
            />
            <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
            <ToggleItem
              title={t('notifications.budgetAlerts')}
              description={t('notifications.budgetAlertsDesc')}
              value={notificationPrefs.budgetAlerts}
              onValueChange={handleBudgetAlertsToggle}
              isDark={isDark}
              colors={colors}
              disabled={channelsDisabled}
            />
          </View>
        </View>

        {/* Timing Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
            {t('notifications.timing')}
          </Text>
          <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
            <SelectItem
              title={t('notifications.reminderTiming')}
              value={getTimingLabel(notificationPrefs.reminderTiming)}
              onPress={handleTimingPress}
              isDark={isDark}
              colors={colors}
              icon={<Clock size={20} color={colors.primary[500]} />}
            />
          </View>
          <Text style={[styles.sectionDescription, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
            {t('notifications.timingDescription')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: themeColors.neutral[900],
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: themeColors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 13,
    color: themeColors.neutral[500],
    marginTop: 8,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: themeColors.neutral[200],
    overflow: 'hidden',
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  toggleItemDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: themeColors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleContent: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: themeColors.neutral[900],
  },
  toggleDescription: {
    fontSize: 14,
    color: themeColors.neutral[500],
    marginTop: 2,
  },
  selectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  selectContent: {
    flex: 1,
  },
  selectTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: themeColors.neutral[900],
  },
  selectValue: {
    fontSize: 15,
    color: themeColors.neutral[500],
  },
  divider: {
    height: 1,
    backgroundColor: themeColors.neutral[100],
    marginLeft: 64,
  },
});
