import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { useAuth } from '../../stores/AuthContext';
import { useTheme } from '../../stores/ThemeContext';
import { useLanguage } from '../../stores/LanguageContext';
import { colors } from '../../config/theme';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Alert.alert(t('common.error'), t('errors.pleaseEnterEmail'));
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert(t('common.error'), t('errors.pleaseEnterValidEmail'));
      return;
    }

    setLoading(true);
    try {
      const { error } = await resetPassword(email);

      if (error) {
        Alert.alert(t('common.error'), error.message);
      } else {
        setSent(true);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.successContainer}>
            <View style={[styles.successIcon, isDark && styles.successIconDark]}>
              <Mail size={32} color="#22C55E" />
            </View>
            <Text style={[styles.successTitle, isDark && styles.successTitleDark]}>
              {t('auth.checkEmail')}
            </Text>
            <Text style={[styles.successText, isDark && styles.successTextDark]}>
              {t('auth.resetInstructions')}{'\n'}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace('/(auth)/login')}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{t('auth.backToLogin')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Back button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={isDark ? '#FAFAFA' : '#262626'} />
            </TouchableOpacity>

            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../main_logo_transparent.png')}
                style={styles.logo}
                resizeMode="contain"
                tintColor={isDark ? '#FFFFFF' : undefined}
              />
            </View>

            {/* Header */}
            <Text style={[styles.title, isDark && styles.titleDark]}>
              {t('auth.resetPassword')}
            </Text>
            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
              {t('auth.resetSubtitle')}
            </Text>

            {/* Form */}
            <View style={styles.form}>
              <TextInput
                style={[
                  styles.input,
                  isDark && styles.inputDark,
                ]}
                placeholder={t('auth.email')}
                placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleReset}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>
                  {loading ? t('auth.sendingLink') : t('auth.sendResetLink')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Back to login */}
            <View style={styles.footer}>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.footerLink}>{t('auth.backToLoginLink')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 32,
  },
  backButton: {
    marginTop: 8,
    marginBottom: 24,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 180,
    height: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#262626',
    textAlign: 'center',
    marginBottom: 8,
  },
  titleDark: {
    color: '#FAFAFA',
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E8E',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  subtitleDark: {
    color: '#A8A8A8',
  },
  form: {
    gap: 12,
  },
  input: {
    height: 50,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#DBDBDB',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#262626',
  },
  inputDark: {
    backgroundColor: '#262626',
    borderColor: '#363636',
    color: '#FAFAFA',
  },
  button: {
    height: 50,
    backgroundColor: colors.primary[600],
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerLink: {
    fontSize: 14,
    color: colors.primary[600],
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successIconDark: {
    backgroundColor: '#14532D',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#262626',
    marginBottom: 12,
  },
  successTitleDark: {
    color: '#FAFAFA',
  },
  successText: {
    fontSize: 15,
    color: '#8E8E8E',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  successTextDark: {
    color: '#A8A8A8',
  },
  emailHighlight: {
    fontWeight: '600',
    color: '#262626',
  },
});
