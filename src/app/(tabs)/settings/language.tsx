import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Check } from 'lucide-react-native';
import { useTheme } from '../../../stores/ThemeContext';
import { useLanguage } from '../../../stores/LanguageContext';
import { typography } from '../../../config/theme';

type Language = 'en' | 'pl';

interface LanguageItemProps {
  code: Language;
  name: string;
  nativeName: string;
  selected: boolean;
  onPress: () => void;
  isDark: boolean;
}

function LanguageItem({ code, name, nativeName, selected, onPress, isDark }: LanguageItemProps) {
  const { colors } = useTheme();

  // Flag emojis
  const flags: Record<Language, string> = {
    en: '🇬🇧',
    pl: '🇵🇱',
  };

  return (
    <TouchableOpacity
      style={[
        styles.languageItem,
        selected && { backgroundColor: colors.primary[isDark ? 900 : 50] },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.flag}>{flags[code]}</Text>
      <View style={styles.languageContent}>
        <Text style={[styles.languageName, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
          {nativeName}
        </Text>
        <Text style={[styles.languageNative, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
          {name}
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

export default function LanguageScreen() {
  const { isDark, colors } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const languages: { code: Language; name: string; nativeName: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  ];

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
            {t('language.title')}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Language Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
            {t('language.select')}
          </Text>
          <View style={[
            styles.card,
            {
              backgroundColor: isDark ? colors.neutral[800] : '#fff',
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
            }
          ]}>
            {languages.map((lang, index) => (
              <View key={lang.code}>
                {index > 0 && (
                  <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
                )}
                <LanguageItem
                  code={lang.code}
                  name={lang.name}
                  nativeName={lang.nativeName}
                  selected={language === lang.code}
                  onPress={() => setLanguage(lang.code)}
                  isDark={isDark}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Info */}
        <Text style={[styles.infoText, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>
          {t('language.infoText')}
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
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  flag: {
    fontSize: 28,
  },
  languageContent: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  languageNative: {
    fontSize: 14,
    fontFamily: typography.fontFamily.body,
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
    marginLeft: 56,
  },
  infoText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.body,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
