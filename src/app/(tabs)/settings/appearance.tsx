import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Sun, Moon, Smartphone, Check } from 'lucide-react-native';
import { useTheme } from '../../../stores/ThemeContext';
import { useLanguage } from '../../../stores/LanguageContext';

type AppearanceMode = 'light' | 'dark' | 'system';

interface OptionItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
  isDark: boolean;
}

function OptionItem({ icon, title, description, selected, onPress, isDark }: OptionItemProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.optionItem,
        selected && { backgroundColor: colors.primary[isDark ? 900 : 50] },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.optionIcon,
        { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] },
        selected && { backgroundColor: colors.primary[isDark ? 800 : 100] },
      ]}>
        {icon}
      </View>
      <View style={styles.optionContent}>
        <Text style={[styles.optionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
          {title}
        </Text>
        <Text style={[styles.optionDescription, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
          {description}
        </Text>
      </View>
      {selected && (
        <View style={[styles.checkIcon, { backgroundColor: colors.primary[500] }]}>
          <Check size={16} color="#fff" strokeWidth={3} />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function AppearanceScreen() {
  const { mode, setMode, isDark, colors } = useTheme();
  const { t } = useLanguage();

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
            {t('appearance.title')}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
            {t('appearance.theme')}
          </Text>
          <View style={[
            styles.card,
            {
              backgroundColor: isDark ? colors.neutral[800] : '#fff',
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
            }
          ]}>
            <OptionItem
              icon={<Sun size={20} color={mode === 'light' ? colors.primary[600] : (isDark ? colors.neutral[400] : colors.neutral[500])} />}
              title={t('appearance.light')}
              description={t('appearance.lightDesc')}
              selected={mode === 'light'}
              onPress={() => setMode('light')}
              isDark={isDark}
            />
            <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
            <OptionItem
              icon={<Moon size={20} color={mode === 'dark' ? colors.primary[600] : (isDark ? colors.neutral[400] : colors.neutral[500])} />}
              title={t('appearance.dark')}
              description={t('appearance.darkDesc')}
              selected={mode === 'dark'}
              onPress={() => setMode('dark')}
              isDark={isDark}
            />
            <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
            <OptionItem
              icon={<Smartphone size={20} color={mode === 'system' ? colors.primary[600] : (isDark ? colors.neutral[400] : colors.neutral[500])} />}
              title={t('appearance.system')}
              description={t('appearance.systemDesc')}
              selected={mode === 'system'}
              onPress={() => setMode('system')}
              isDark={isDark}
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    marginLeft: 68,
  },
});
