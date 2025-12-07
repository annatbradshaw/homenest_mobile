import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Linking, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Bell, Mail, Clock, CheckCircle2, Calendar, DollarSign, AlertTriangle, CheckSquare } from 'lucide-react-native';
import { useTheme } from '../../../stores/ThemeContext';
import { useLanguage } from '../../../stores/LanguageContext';
import { usePreferences } from '../../../stores/PreferencesContext';
import { usePushNotifications } from '../../../hooks/usePushNotifications';
import { colors as themeColors } from '../../../config/theme';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '../../../types/preferences';

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

interface NumberInputItemProps {
  title: string;
  description: string;
  value: number;
  onValueChange: (value: number) => void;
  isDark: boolean;
  colors: typeof themeColors;
  disabled?: boolean;
  suffix?: string;
  min?: number;
  max?: number;
}

function NumberInputItem({ title, description, value, onValueChange, isDark, colors, disabled, suffix, min = 1, max = 100 }: NumberInputItemProps) {
  const handleChange = (text: string) => {
    const num = parseInt(text, 10);
    if (!isNaN(num) && num >= min && num <= max) {
      onValueChange(num);
    } else if (text === '') {
      onValueChange(min);
    }
  };

  return (
    <View style={[styles.toggleItem, disabled && styles.toggleItemDisabled]}>
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
      <View style={styles.numberInputContainer}>
        <TextInput
          style={[
            styles.numberInput,
            {
              backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100],
              color: isDark ? colors.neutral[50] : colors.neutral[900],
              borderColor: isDark ? colors.neutral[600] : colors.neutral[200],
            },
            disabled && { opacity: 0.5 }
          ]}
          value={String(value)}
          onChangeText={handleChange}
          keyboardType="number-pad"
          editable={!disabled}
          selectTextOnFocus
        />
        {suffix && (
          <Text style={[
            styles.numberSuffix,
            { color: isDark ? colors.neutral[400] : colors.neutral[500] },
            disabled && { opacity: 0.5 }
          ]}>
            {suffix}
          </Text>
        )}
      </View>
    </View>
  );
}

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

  const notificationPrefs = preferences.notifications ?? DEFAULT_NOTIFICATION_PREFERENCES;

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

  const handleTodoReminderDaysChange = async (value: number) => {
    await updatePreferences({
      notifications: { ...notificationPrefs, todoReminderDaysBefore: value },
    });
  };

  const handleOverdueRemindersToggle = async (value: boolean) => {
    await updatePreferences({
      notifications: { ...notificationPrefs, overdueReminders: value },
    });
  };

  const handleOverdueFrequencyChange = async (value: number) => {
    await updatePreferences({
      notifications: { ...notificationPrefs, overdueReminderFrequency: value },
    });
  };

  const handleStageStartingToggle = async (value: boolean) => {
    await updatePreferences({
      notifications: { ...notificationPrefs, stageStarting: value, stageUpdates: value || notificationPrefs.stageCompleted },
    });
  };

  const handleStageStartingDaysChange = async (value: number) => {
    await updatePreferences({
      notifications: { ...notificationPrefs, stageStartingDaysBefore: value },
    });
  };

  const handleStageCompletedToggle = async (value: boolean) => {
    await updatePreferences({
      notifications: { ...notificationPrefs, stageCompleted: value, stageUpdates: value || notificationPrefs.stageStarting },
    });
  };

  const handleBudgetWarningToggle = async (value: boolean) => {
    await updatePreferences({
      notifications: { ...notificationPrefs, budgetWarning: value, budgetAlerts: value || notificationPrefs.budgetExceeded },
    });
  };

  const handleBudgetWarningThresholdChange = async (value: number) => {
    await updatePreferences({
      notifications: { ...notificationPrefs, budgetWarningThreshold: value },
    });
  };

  const handleBudgetExceededToggle = async (value: boolean) => {
    await updatePreferences({
      notifications: { ...notificationPrefs, budgetExceeded: value, budgetAlerts: value || notificationPrefs.budgetWarning },
    });
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

        {/* Task Reminders Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
            {t('notifications.taskReminders')}
          </Text>
          <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
            <ToggleItem
              title={t('notifications.deadlineReminders')}
              description={t('notifications.deadlineRemindersDesc')}
              value={notificationPrefs.todoReminders}
              onValueChange={handleTodoRemindersToggle}
              isDark={isDark}
              colors={colors}
              disabled={channelsDisabled}
              icon={<Clock size={20} color={colors.primary[500]} />}
            />
            {notificationPrefs.todoReminders && !channelsDisabled && (
              <>
                <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
                <NumberInputItem
                  title={t('notifications.remindDaysBefore')}
                  description={t('notifications.remindDaysBeforeDesc')}
                  value={notificationPrefs.todoReminderDaysBefore ?? 1}
                  onValueChange={handleTodoReminderDaysChange}
                  isDark={isDark}
                  colors={colors}
                  suffix={t('notifications.days')}
                  min={1}
                  max={14}
                />
              </>
            )}
            <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
            <ToggleItem
              title={t('notifications.overdueReminders')}
              description={t('notifications.overdueRemindersDesc')}
              value={notificationPrefs.overdueReminders}
              onValueChange={handleOverdueRemindersToggle}
              isDark={isDark}
              colors={colors}
              disabled={channelsDisabled}
              icon={<AlertTriangle size={20} color={colors.danger[500]} />}
            />
            {notificationPrefs.overdueReminders && !channelsDisabled && (
              <>
                <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
                <NumberInputItem
                  title={t('notifications.reminderFrequency')}
                  description={t('notifications.reminderFrequencyDesc')}
                  value={notificationPrefs.overdueReminderFrequency ?? 1}
                  onValueChange={handleOverdueFrequencyChange}
                  isDark={isDark}
                  colors={colors}
                  suffix={t('notifications.days')}
                  min={1}
                  max={7}
                />
              </>
            )}
          </View>
        </View>

        {/* Stage Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
            {t('notifications.stageNotifications')}
          </Text>
          <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
            <ToggleItem
              title={t('notifications.stageStartingSoon')}
              description={t('notifications.stageStartingSoonDesc')}
              value={notificationPrefs.stageStarting}
              onValueChange={handleStageStartingToggle}
              isDark={isDark}
              colors={colors}
              disabled={channelsDisabled}
              icon={<Calendar size={20} color={colors.primary[500]} />}
            />
            {notificationPrefs.stageStarting && !channelsDisabled && (
              <>
                <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
                <NumberInputItem
                  title={t('notifications.notifyDaysBefore')}
                  description={t('notifications.notifyDaysBeforeDesc')}
                  value={notificationPrefs.stageStartingDaysBefore ?? 3}
                  onValueChange={handleStageStartingDaysChange}
                  isDark={isDark}
                  colors={colors}
                  suffix={t('notifications.days')}
                  min={1}
                  max={30}
                />
              </>
            )}
            <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
            <ToggleItem
              title={t('notifications.stageCompleted')}
              description={t('notifications.stageCompletedDesc')}
              value={notificationPrefs.stageCompleted}
              onValueChange={handleStageCompletedToggle}
              isDark={isDark}
              colors={colors}
              disabled={channelsDisabled}
              icon={<CheckSquare size={20} color={colors.success[500]} />}
            />
          </View>
        </View>

        {/* Budget Alerts Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
            {t('notifications.budgetNotifications')}
          </Text>
          <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
            <ToggleItem
              title={t('notifications.budgetWarning')}
              description={t('notifications.budgetWarningDesc')}
              value={notificationPrefs.budgetWarning}
              onValueChange={handleBudgetWarningToggle}
              isDark={isDark}
              colors={colors}
              disabled={channelsDisabled}
              icon={<AlertTriangle size={20} color={colors.warning[500]} />}
            />
            {notificationPrefs.budgetWarning && !channelsDisabled && (
              <>
                <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
                <NumberInputItem
                  title={t('notifications.warningThreshold')}
                  description={t('notifications.warningThresholdDesc')}
                  value={notificationPrefs.budgetWarningThreshold ?? 80}
                  onValueChange={handleBudgetWarningThresholdChange}
                  isDark={isDark}
                  colors={colors}
                  suffix="%"
                  min={50}
                  max={99}
                />
              </>
            )}
            <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
            <ToggleItem
              title={t('notifications.budgetExceeded')}
              description={t('notifications.budgetExceededDesc')}
              value={notificationPrefs.budgetExceeded}
              onValueChange={handleBudgetExceededToggle}
              isDark={isDark}
              colors={colors}
              disabled={channelsDisabled}
              icon={<DollarSign size={20} color={colors.danger[500]} />}
            />
          </View>
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
  divider: {
    height: 1,
    backgroundColor: themeColors.neutral[100],
    marginLeft: 64,
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  numberInput: {
    width: 56,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  numberSuffix: {
    fontSize: 14,
    fontWeight: '500',
  },
});
