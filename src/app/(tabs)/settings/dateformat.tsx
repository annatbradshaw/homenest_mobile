import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Check, Calendar } from 'lucide-react-native';
import { useTheme } from '../../../stores/ThemeContext';
import { useLanguage, DATE_FORMATS, DateFormatOption } from '../../../stores/LanguageContext';

export default function DateFormatScreen() {
  const { isDark, colors } = useTheme();
  const { t, dateFormat, setDateFormat, formatDate } = useLanguage();

  const handleSelectFormat = async (selected: DateFormatOption) => {
    await setDateFormat(selected.id);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={isDark ? colors.neutral[50] : colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
          {t('settings.dateFormat')}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Info Text */}
        <Text style={[styles.infoText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
          {t('dateFormat.infoText')}
        </Text>

        {/* Format List */}
        <View style={[
          styles.formatList,
          {
            backgroundColor: isDark ? colors.neutral[800] : '#fff',
            borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
          }
        ]}>
          {DATE_FORMATS.map((item, index) => {
            const isSelected = dateFormat.id === item.id;
            const isLast = index === DATE_FORMATS.length - 1;

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.formatItem,
                  !isLast && [styles.formatItemBorder, { borderBottomColor: isDark ? colors.neutral[700] : colors.neutral[100] }],
                ]}
                onPress={() => handleSelectFormat(item)}
                activeOpacity={0.7}
              >
                <View style={styles.formatInfo}>
                  <View style={[
                    styles.iconContainer,
                    { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }
                  ]}>
                    <Calendar size={20} color={isDark ? colors.neutral[300] : colors.neutral[600]} />
                  </View>
                  <View style={styles.formatDetails}>
                    <Text style={[styles.formatLabel, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.formatExample, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                      {item.example}
                    </Text>
                  </View>
                </View>
                {isSelected && (
                  <View style={[styles.checkCircle, { backgroundColor: colors.primary[600] }]}>
                    <Check size={14} color="#fff" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Live Example */}
        <View style={styles.exampleSection}>
          <Text style={[styles.exampleLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
            {t('dateFormat.example')}
          </Text>
          <Text style={[styles.exampleValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
            {formatDate(new Date(), 'long')}
          </Text>
          <Text style={[styles.exampleShort, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
            {formatDate(new Date(), 'short')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  formatList: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  formatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  formatItemBorder: {
    borderBottomWidth: 1,
  },
  formatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formatDetails: {
    gap: 2,
  },
  formatLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  formatExample: {
    fontSize: 14,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exampleSection: {
    marginTop: 24,
    alignItems: 'center',
    paddingBottom: 32,
  },
  exampleLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  exampleValue: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  exampleShort: {
    fontSize: 16,
  },
});
