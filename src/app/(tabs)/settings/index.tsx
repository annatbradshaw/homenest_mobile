import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  User,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  ChevronLeft,
  Globe,
  DollarSign,
  Users,
  Calendar,
  FileText,
} from 'lucide-react-native';
import { useAuth } from '../../../stores/AuthContext';
import { useTheme } from '../../../stores/ThemeContext';
import { useLanguage } from '../../../stores/LanguageContext';
import { useCurrency } from '../../../stores/CurrencyContext';
import { typography } from '../../../config/theme';

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  danger?: boolean;
  isDark: boolean;
}

function SettingItem({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  danger = false,
  isDark,
}: SettingItemProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.settingIcon,
        { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] },
        danger && { backgroundColor: isDark ? `${colors.danger[500]}25` : colors.danger[50] },
      ]}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={[
          styles.settingTitle,
          { color: isDark ? colors.neutral[50] : colors.neutral[900] },
          danger && { color: colors.danger[500] },
        ]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {showChevron && <ChevronRight size={20} color={isDark ? colors.neutral[500] : colors.neutral[400]} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { user, profile, signOut } = useAuth();
  const { isDark, mode, colors } = useTheme();
  const { t, language, dateFormat } = useLanguage();
  const { currency } = useCurrency();

  const handleSignOut = () => {
    Alert.alert(t('settings.signOut'), t('settings.signOutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.signOut'),
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const fullName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`
    : user?.email || 'User';

  // Get display values for appearance and language
  const appearanceLabel = mode === 'light'
    ? t('appearance.light')
    : mode === 'dark'
      ? t('appearance.dark')
      : t('appearance.system');

  const languageLabel = language === 'pl' ? 'Polski' : 'English';

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
          <Text style={[styles.title, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
            {t('settings.title')}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Profile Card */}
        <TouchableOpacity
          style={[
            styles.profileCard,
            {
              backgroundColor: isDark ? colors.neutral[800] : '#fff',
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
            }
          ]}
          onPress={() => router.push('/(tabs)/settings/profile')}
          activeOpacity={0.7}
        >
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary[isDark ? 900 : 100] }]}>
            <Text style={[styles.avatarText, { color: colors.primary[600] }]}>
              {fullName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
              {fullName}
            </Text>
            <Text style={[styles.profileEmail, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
              {user?.email}
            </Text>
          </View>
          <ChevronRight size={20} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
        </TouchableOpacity>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
            {t('settings.preferences')}
          </Text>
          <View style={[
            styles.settingsCard,
            {
              backgroundColor: isDark ? colors.neutral[800] : '#fff',
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
            }
          ]}>
            <SettingItem
              icon={<Bell size={20} color={colors.primary[600]} />}
              title={t('settings.notifications')}
              subtitle={t('settings.notificationsDesc')}
              onPress={() => router.push('/(tabs)/settings/notifications')}
              isDark={isDark}
            />
            <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
            <SettingItem
              icon={<Moon size={20} color={isDark ? colors.neutral[300] : colors.neutral[600]} />}
              title={t('settings.appearance')}
              subtitle={appearanceLabel}
              onPress={() => router.push('/(tabs)/settings/appearance')}
              isDark={isDark}
            />
            <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
            <SettingItem
              icon={<Globe size={20} color={isDark ? colors.neutral[300] : colors.neutral[600]} />}
              title={t('settings.language')}
              subtitle={languageLabel}
              onPress={() => router.push('/(tabs)/settings/language')}
              isDark={isDark}
            />
            <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
            <SettingItem
              icon={<DollarSign size={20} color={isDark ? colors.neutral[300] : colors.neutral[600]} />}
              title={t('settings.currency')}
              subtitle={`${currency.code} (${currency.symbol})`}
              onPress={() => router.push('/(tabs)/settings/currency')}
              isDark={isDark}
            />
            <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
            <SettingItem
              icon={<Calendar size={20} color={isDark ? colors.neutral[300] : colors.neutral[600]} />}
              title={t('settings.dateFormat')}
              subtitle={dateFormat.label}
              onPress={() => router.push('/(tabs)/settings/dateformat')}
              isDark={isDark}
            />
          </View>
        </View>

        {/* Team Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
            {t('settings.team')}
          </Text>
          <View style={[
            styles.settingsCard,
            {
              backgroundColor: isDark ? colors.neutral[800] : '#fff',
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
            }
          ]}>
            <SettingItem
              icon={<Users size={20} color={colors.primary[600]} />}
              title={t('settings.teamMembers')}
              subtitle={t('settings.teamMembersDesc')}
              onPress={() => router.push('/(tabs)/settings/team')}
              isDark={isDark}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
            {t('settings.support')}
          </Text>
          <View style={[
            styles.settingsCard,
            {
              backgroundColor: isDark ? colors.neutral[800] : '#fff',
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
            }
          ]}>
            <SettingItem
              icon={<HelpCircle size={20} color={isDark ? colors.neutral[300] : colors.neutral[600]} />}
              title={t('settings.helpSupport')}
              onPress={() => router.push('/(tabs)/settings/help')}
              isDark={isDark}
            />
            <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
            <SettingItem
              icon={<Shield size={20} color={isDark ? colors.neutral[300] : colors.neutral[600]} />}
              title={t('settings.privacyPolicy')}
              onPress={() => router.push('/(tabs)/settings/privacy')}
              isDark={isDark}
            />
            <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
            <SettingItem
              icon={<FileText size={20} color={isDark ? colors.neutral[300] : colors.neutral[600]} />}
              title={t('settings.termsOfService')}
              onPress={() => router.push('/(tabs)/settings/terms')}
              isDark={isDark}
            />
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <View style={[
            styles.settingsCard,
            {
              backgroundColor: isDark ? colors.neutral[800] : '#fff',
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
            }
          ]}>
            <SettingItem
              icon={<LogOut size={20} color={colors.danger[500]} />}
              title={t('settings.signOut')}
              onPress={handleSignOut}
              showChevron={false}
              danger
              isDark={isDark}
            />
          </View>
        </View>

        {/* App Version */}
        <Text style={[styles.version, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>
          {t('settings.version')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontFamily: typography.fontFamily.bodyMedium,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    gap: 12,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontFamily: typography.fontFamily.bodySemibold,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: typography.fontFamily.bodySemibold,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: typography.fontFamily.body,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bodySemibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  settingsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: typography.fontFamily.body,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 68,
  },
  version: {
    fontSize: 13,
    fontFamily: typography.fontFamily.body,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
});
