import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../../../stores/ThemeContext';
import { useLanguage } from '../../../stores/LanguageContext';
import { colors as themeColors, typography } from '../../../config/theme';

export default function TermsScreen() {
  const { isDark, colors } = useTheme();
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
          <Text style={[styles.title, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('terms.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.lastUpdated, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('terms.lastUpdated')}</Text>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('terms.agreement')}</Text>
            <Text style={[styles.paragraph, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
              {t('terms.agreementText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('terms.serviceDescription')}</Text>
            <Text style={[styles.paragraph, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
              {t('terms.serviceDescriptionText')}
            </Text>
            <Text style={[styles.bulletPoint, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>{t('terms.feature1')}</Text>
            <Text style={[styles.bulletPoint, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>{t('terms.feature2')}</Text>
            <Text style={[styles.bulletPoint, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>{t('terms.feature3')}</Text>
            <Text style={[styles.bulletPoint, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>{t('terms.feature4')}</Text>
            <Text style={[styles.bulletPoint, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>{t('terms.feature5')}</Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('terms.eligibility')}</Text>
            <Text style={[styles.paragraph, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
              {t('terms.eligibilityText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('terms.userContent')}</Text>
            <Text style={[styles.paragraph, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
              {t('terms.userContentText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('terms.acceptableUse')}</Text>
            <Text style={[styles.paragraph, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
              {t('terms.acceptableUseText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('terms.intellectualProperty')}</Text>
            <Text style={[styles.paragraph, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
              {t('terms.intellectualPropertyText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('terms.disclaimer')}</Text>
            <Text style={[styles.paragraph, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
              {t('terms.disclaimerText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('terms.limitation')}</Text>
            <Text style={[styles.paragraph, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
              {t('terms.limitationText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('terms.termination')}</Text>
            <Text style={[styles.paragraph, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
              {t('terms.terminationText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('terms.governingLaw')}</Text>
            <Text style={[styles.paragraph, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
              {t('terms.governingLawText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('terms.contactUs')}</Text>
            <Text style={[styles.paragraph, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
              {t('terms.contactUsText')}
            </Text>
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
    fontFamily: typography.fontFamily.bodyMedium,
    color: themeColors.neutral[900],
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 14,
    fontFamily: typography.fontFamily.body,
    color: themeColors.neutral[500],
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: typography.fontFamily.bodySemibold,
    color: themeColors.neutral[900],
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    fontFamily: typography.fontFamily.body,
    color: themeColors.neutral[600],
    lineHeight: 24,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 15,
    fontFamily: typography.fontFamily.body,
    color: themeColors.neutral[600],
    lineHeight: 24,
    paddingLeft: 8,
  },
});
