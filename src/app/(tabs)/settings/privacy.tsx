import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../../../stores/ThemeContext';
import { useLanguage } from '../../../stores/LanguageContext';
import { colors as themeColors } from '../../../config/theme';

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
          <Text style={[styles.title, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>Privacy Policy</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.lastUpdated, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>Last updated: December 2024</Text>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>Introduction</Text>
            <Text style={[styles.paragraph, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
              HomeNest ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>Information We Collect</Text>
            <Text style={[styles.paragraph, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
              We collect information you provide directly to us, such as when you create an account, update your profile, or contact us for support.
            </Text>
            <Text style={[styles.bulletPoint, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>• Account information (name, email, phone)</Text>
            <Text style={[styles.bulletPoint, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>• Project data (renovation details, budgets, tasks)</Text>
            <Text style={[styles.bulletPoint, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>• Supplier information you add</Text>
            <Text style={[styles.bulletPoint, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>• Photos and documents you upload</Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>How We Use Your Information</Text>
            <Text style={[styles.paragraph, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
              We use the information we collect to:
            </Text>
            <Text style={[styles.bulletPoint, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>• Provide and maintain our services</Text>
            <Text style={[styles.bulletPoint, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>• Send you notifications and updates</Text>
            <Text style={[styles.bulletPoint, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>• Respond to your requests and support needs</Text>
            <Text style={[styles.bulletPoint, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>• Improve our application</Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>Data Security</Text>
            <Text style={[styles.paragraph, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
              We implement appropriate security measures to protect your personal information. Your data is encrypted in transit and at rest. We use industry-standard security protocols to safeguard your information.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>Your Rights</Text>
            <Text style={[styles.paragraph, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
              You have the right to access, correct, or delete your personal information at any time. You can do this through the app settings or by contacting our support team.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>Contact Us</Text>
            <Text style={[styles.paragraph, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
              If you have questions about this Privacy Policy, please contact us at privacy@homenest.app
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
    fontWeight: '600',
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
    color: themeColors.neutral[500],
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: themeColors.neutral[900],
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    color: themeColors.neutral[600],
    lineHeight: 24,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 15,
    color: themeColors.neutral[600],
    lineHeight: 24,
    paddingLeft: 8,
  },
});
