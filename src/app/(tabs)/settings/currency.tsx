import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Check } from 'lucide-react-native';
import { useTheme } from '../../../stores/ThemeContext';
import { useLanguage } from '../../../stores/LanguageContext';
import { useCurrency, SUPPORTED_CURRENCIES, CurrencyInfo } from '../../../stores/CurrencyContext';

export default function CurrencyScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const { currency, setCurrency } = useCurrency();

  const handleSelectCurrency = async (selected: CurrencyInfo) => {
    await setCurrency(selected);
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
          {t('settings.currency')}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Info Text */}
        <Text style={[styles.infoText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
          {t('currency.infoText')}
        </Text>

        {/* Currency List */}
        <View style={[
          styles.currencyList,
          {
            backgroundColor: isDark ? colors.neutral[800] : '#fff',
            borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
          }
        ]}>
          {SUPPORTED_CURRENCIES.map((item, index) => {
            const isSelected = currency.code === item.code;
            const isLast = index === SUPPORTED_CURRENCIES.length - 1;

            return (
              <TouchableOpacity
                key={item.code}
                style={[
                  styles.currencyItem,
                  !isLast && [styles.currencyItemBorder, { borderBottomColor: isDark ? colors.neutral[700] : colors.neutral[100] }],
                ]}
                onPress={() => handleSelectCurrency(item)}
                activeOpacity={0.7}
              >
                <View style={styles.currencyInfo}>
                  <View style={[
                    styles.symbolContainer,
                    { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }
                  ]}>
                    <Text style={[styles.symbol, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
                      {item.symbol}
                    </Text>
                  </View>
                  <View style={styles.currencyDetails}>
                    <Text style={[styles.currencyName, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.currencyCode, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                      {item.code}
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

        {/* Example */}
        <View style={styles.exampleSection}>
          <Text style={[styles.exampleLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
            {t('currency.example')}
          </Text>
          <Text style={[styles.exampleValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
            {new Intl.NumberFormat(currency.locale, {
              style: 'currency',
              currency: currency.code,
            }).format(12500.50)}
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
  currencyList: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  currencyItemBorder: {
    borderBottomWidth: 1,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  symbolContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    fontSize: 18,
    fontWeight: '600',
  },
  currencyDetails: {
    gap: 2,
  },
  currencyName: {
    fontSize: 16,
    fontWeight: '500',
  },
  currencyCode: {
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
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});
