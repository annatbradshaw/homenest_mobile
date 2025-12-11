import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Settings,
  Truck,
  FolderKanban,
  ChevronRight,
  User,
  HelpCircle,
  LogOut,
} from 'lucide-react-native';
import { useAuth } from '../../stores/AuthContext';
import { useTheme } from '../../stores/ThemeContext';
import { useLanguage } from '../../stores/LanguageContext';
import { typography } from '../../config/theme';
import { Avatar } from '../../components/ui';

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  color?: string;
  isDark: boolean;
}

function MenuItem({ icon, title, subtitle, onPress, color, isDark }: MenuItemProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.menuItem, { borderBottomColor: isDark ? colors.neutral[700] : colors.neutral[100] }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.menuIcon,
        { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] },
        color && { backgroundColor: color + (isDark ? '30' : '15') }
      ]}>
        {icon}
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.menuSubtitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
            {subtitle}
          </Text>
        )}
      </View>
      <ChevronRight size={20} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const { user, profile, signOut } = useAuth();
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();

  const fullName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`
    : user?.email?.split('@')[0] || 'User';

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
            {t('tabs.more')}
          </Text>
        </View>

        {/* Profile Section */}
        <TouchableOpacity
          style={[
            styles.profileCard,
            {
              backgroundColor: isDark ? colors.neutral[800] : '#fff',
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
            }
          ]}
          onPress={() => router.push('/(tabs)/settings')}
          activeOpacity={0.7}
        >
          <Avatar
            source={profile?.avatar_url}
            name={fullName}
            size="md"
          />
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

        {/* Menu Items */}
        <View style={[
          styles.menuSection,
          {
            backgroundColor: isDark ? colors.neutral[800] : '#fff',
            borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
          }
        ]}>
          <MenuItem
            icon={<FolderKanban size={20} color={colors.primary[600]} />}
            title={t('projects.title')}
            subtitle={t('projects.title')}
            onPress={() => router.push('/(tabs)/projects')}
            color={colors.primary[600]}
            isDark={isDark}
          />
          <MenuItem
            icon={<Truck size={20} color={colors.accent[600]} />}
            title={t('suppliers.title')}
            subtitle={t('suppliers.title')}
            onPress={() => router.push('/(tabs)/suppliers')}
            color={colors.accent[600]}
            isDark={isDark}
          />
          <MenuItem
            icon={<Settings size={20} color={isDark ? colors.neutral[300] : colors.neutral[600]} />}
            title={t('settings.title')}
            subtitle={t('settings.preferences')}
            onPress={() => router.push('/(tabs)/settings')}
            color={colors.neutral[600]}
            isDark={isDark}
          />
        </View>

        {/* Support Section */}
        <View style={[
          styles.menuSection,
          {
            backgroundColor: isDark ? colors.neutral[800] : '#fff',
            borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
          }
        ]}>
          <MenuItem
            icon={<HelpCircle size={20} color={isDark ? colors.neutral[300] : colors.neutral[600]} />}
            title={t('settings.helpSupport')}
            onPress={() => router.push('/(tabs)/settings/help')}
            color={colors.neutral[600]}
            isDark={isDark}
          />
        </View>

        {/* Sign Out */}
        <View style={[
          styles.menuSection,
          {
            backgroundColor: isDark ? colors.neutral[800] : '#fff',
            borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
          }
        ]}>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <View style={[
              styles.menuIcon,
              { backgroundColor: isDark ? `${colors.danger[500]}25` : colors.danger[50] }
            ]}>
              <LogOut size={20} color={colors.danger[500]} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: colors.danger[500] }]}>
                {t('settings.signOut')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={[styles.version, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>
          {t('settings.version')}
        </Text>

        {/* Logo */}
        <View style={styles.logoContainer}>
          {isDark ? (
            <Image
              source={require('../../../main_logo_transparent.png')}
              style={[styles.logo, { tintColor: '#FFFFFF' }]}
              resizeMode="contain"
            />
          ) : (
            <Image
              source={require('../../../main_logo_transparent.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          )}
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: typography.fontFamily.displayMedium,
    letterSpacing: -0.5,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    gap: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontFamily: typography.fontFamily.bodySemibold,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: typography.fontFamily.body,
    marginTop: 2,
  },
  menuSection: {
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  menuSubtitle: {
    fontSize: 13,
    fontFamily: typography.fontFamily.body,
    marginTop: 2,
  },
  version: {
    fontSize: 13,
    fontFamily: typography.fontFamily.body,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 140,
    height: 40,
  },
});
