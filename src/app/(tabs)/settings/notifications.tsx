import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../../../stores/ThemeContext';
import { useLanguage } from '../../../stores/LanguageContext';
import { colors as themeColors } from '../../../config/theme';

interface ToggleItemProps {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  isDark: boolean;
  colors: any;
}

function ToggleItem({ title, description, value, onValueChange, isDark, colors }: ToggleItemProps) {
  return (
    <View style={styles.toggleItem}>
      <View style={styles.toggleContent}>
        <Text style={[styles.toggleTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{title}</Text>
        <Text style={[styles.toggleDescription, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: isDark ? colors.neutral[700] : colors.neutral[200], true: colors.primary[500] }}
        thumbColor="#fff"
      />
    </View>
  );
}

export default function NotificationsScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [stageUpdates, setStageUpdates] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [teamUpdates, setTeamUpdates] = useState(false);

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
          <Text style={[styles.title, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>Notifications</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* General Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>General</Text>
          <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
            <ToggleItem
              title="Push Notifications"
              description="Receive notifications on your device"
              value={pushEnabled}
              onValueChange={setPushEnabled}
              isDark={isDark}
              colors={colors}
            />
            <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
            <ToggleItem
              title="Email Notifications"
              description="Receive updates via email"
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              isDark={isDark}
              colors={colors}
            />
          </View>
        </View>

        {/* Activity Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>Activity</Text>
          <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
            <ToggleItem
              title="Task Reminders"
              description="Get reminded about upcoming tasks"
              value={taskReminders}
              onValueChange={setTaskReminders}
              isDark={isDark}
              colors={colors}
            />
            <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
            <ToggleItem
              title="Stage Updates"
              description="When a project stage changes status"
              value={stageUpdates}
              onValueChange={setStageUpdates}
              isDark={isDark}
              colors={colors}
            />
            <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
            <ToggleItem
              title="Budget Alerts"
              description="When spending approaches budget limits"
              value={budgetAlerts}
              onValueChange={setBudgetAlerts}
              isDark={isDark}
              colors={colors}
            />
            <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
            <ToggleItem
              title="Team Updates"
              description="When team members make changes"
              value={teamUpdates}
              onValueChange={setTeamUpdates}
              isDark={isDark}
              colors={colors}
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
    marginLeft: 16,
  },
});
