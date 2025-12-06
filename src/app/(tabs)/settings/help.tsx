import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, MessageCircle, Mail, FileText, ExternalLink } from 'lucide-react-native';
import { useTheme } from '../../../stores/ThemeContext';
import { useLanguage } from '../../../stores/LanguageContext';
import { colors as themeColors } from '../../../config/theme';

interface HelpItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
  isDark: boolean;
  colors: any;
}

function HelpItem({ icon, title, description, onPress, isDark, colors }: HelpItemProps) {
  return (
    <TouchableOpacity
      style={styles.helpItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.helpIcon, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]}>{icon}</View>
      <View style={styles.helpContent}>
        <Text style={[styles.helpTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{title}</Text>
        <Text style={[styles.helpDescription, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{description}</Text>
      </View>
      <ChevronRight size={20} color={colors.neutral[400]} />
    </TouchableOpacity>
  );
}

export default function HelpScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@gethomenest.com?subject=HomeNest Support Request');
  };

  const handleChat = () => {
    // Would open chat support
  };

  const handleDocs = () => {
    Linking.openURL('https://gethomenest.com/docs');
  };

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
          <Text style={[styles.title, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('help.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('help.contactUs')}</Text>
          <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
            <HelpItem
              icon={<Mail size={20} color={colors.primary[600]} />}
              title={t('help.emailSupport')}
              description={t('help.emailSupportDesc')}
              onPress={handleEmailSupport}
              isDark={isDark}
              colors={colors}
            />
            <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
            <HelpItem
              icon={<MessageCircle size={20} color={colors.success[600]} />}
              title={t('help.liveChat')}
              description={t('help.liveChatDesc')}
              onPress={handleChat}
              isDark={isDark}
              colors={colors}
            />
          </View>
        </View>

        {/* Resources Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('help.resources')}</Text>
          <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
            <HelpItem
              icon={<FileText size={20} color={isDark ? colors.neutral[400] : colors.neutral[600]} />}
              title={t('help.documentation')}
              description={t('help.documentationDesc')}
              onPress={handleDocs}
              isDark={isDark}
              colors={colors}
            />
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('help.faq')}</Text>
          <View style={[styles.faqCard, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
            <View style={styles.faqItem}>
              <Text style={[styles.faqQuestion, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('help.faqCreateProject')}</Text>
              <Text style={[styles.faqAnswer, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                {t('help.faqCreateProjectAnswer')}
              </Text>
            </View>
            <View style={[styles.faqDivider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
            <View style={styles.faqItem}>
              <Text style={[styles.faqQuestion, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('help.faqInviteTeam')}</Text>
              <Text style={[styles.faqAnswer, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                {t('help.faqInviteTeamAnswer')}
              </Text>
            </View>
            <View style={[styles.faqDivider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
            <View style={styles.faqItem}>
              <Text style={[styles.faqQuestion, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('help.faqTrackExpenses')}</Text>
              <Text style={[styles.faqAnswer, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                {t('help.faqTrackExpensesAnswer')}
              </Text>
            </View>
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
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  helpIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: themeColors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: themeColors.neutral[900],
  },
  helpDescription: {
    fontSize: 14,
    color: themeColors.neutral[500],
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: themeColors.neutral[100],
    marginLeft: 68,
  },
  faqCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: themeColors.neutral[200],
    padding: 16,
  },
  faqItem: {
    paddingVertical: 8,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: themeColors.neutral[900],
    marginBottom: 6,
  },
  faqAnswer: {
    fontSize: 14,
    color: themeColors.neutral[600],
    lineHeight: 20,
  },
  faqDivider: {
    height: 1,
    backgroundColor: themeColors.neutral[100],
    marginVertical: 12,
  },
});
