import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../../../stores/ThemeContext';
import { useLanguage } from '../../../stores/LanguageContext';
import { colors as themeColors, typography } from '../../../config/theme';

export default function PrivacyScreen() {
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
          <Text style={[styles.title, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('privacy.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.lastUpdated, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('privacy.lastUpdated')}</Text>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('privacy.introduction')}</Text>
            <Text style={[styles.paragraph, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
              {t('privacy.introText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('privacy.infoCollected')}</Text>
            <Text style={[styles.paragraph, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
              {t('privacy.infoCollectedText')}
            </Text>
            <Text style={[styles.bulletPoint, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>• {t('privacy.accountInfo')}</Text>
            <Text style={[styles.bulletPoint, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>• {t('privacy.projectData')}</Text>
            <Text style={[styles.bulletPoint, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>• {t('privacy.supplierInfo')}</Text>
            <Text style={[styles.bulletPoint, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>• {t('privacy.photosDocuments')}</Text>
            <Text style={[styles.bulletPoint, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>• {t('privacy.teamData')}</Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('privacy.howWeUse')}</Text>
            <Text style={[styles.paragraph, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
              {t('privacy.howWeUseText')}
            </Text>
            <Text style={[styles.bulletPoint, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>• {t('privacy.provideServices')}</Text>
            <Text style={[styles.bulletPoint, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>• {t('privacy.sendNotifications')}</Text>
            <Text style={[styles.bulletPoint, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>• {t('privacy.respondRequests')}</Text>
            <Text style={[styles.bulletPoint, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>• {t('privacy.improveApp')}</Text>
            <Text style={[styles.bulletPoint, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>• {t('privacy.enableCollaboration')}</Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('privacy.dataSecurity')}</Text>
            <Text style={[styles.paragraph, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
              {t('privacy.dataSecurityText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('privacy.yourRights')}</Text>
            <Text style={[styles.paragraph, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
              {t('privacy.yourRightsText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('privacy.dataController')}</Text>
            <Text style={[styles.paragraph, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
              {t('privacy.dataControllerText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('privacy.contactUs')}</Text>
            <Text style={[styles.paragraph, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
              {t('privacy.contactUsText')}
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
