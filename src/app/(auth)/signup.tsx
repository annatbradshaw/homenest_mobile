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
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, X } from 'lucide-react-native';
import { useAuth } from '../../stores/AuthContext';
import { useTheme } from '../../stores/ThemeContext';
import { useLanguage } from '../../stores/LanguageContext';
import { colors } from '../../config/theme';

export default function SignupScreen() {
  const { signUp } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const PASSWORD_REQUIREMENTS = [
    { label: t('auth.passwordRequirements.minLength'), test: (p: string) => p.length >= 8 },
    { label: t('auth.passwordRequirements.uppercase'), test: (p: string) => /[A-Z]/.test(p) },
    { label: t('auth.passwordRequirements.lowercase'), test: (p: string) => /[a-z]/.test(p) },
    { label: t('auth.passwordRequirements.number'), test: (p: string) => /[0-9]/.test(p) },
  ];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert(t('common.error'), t('errors.fillAllFields'));
      return;
    }

    if (password.length < 8) {
      Alert.alert(t('common.error'), t('errors.passwordTooShort'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('common.error'), t('errors.passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password);

      if (error) {
        Alert.alert(t('auth.signUpFailed'), error.message);
      } else {
        Alert.alert(
          t('auth.accountCreated'),
          t('auth.verifyEmail'),
          [{ text: t('common.ok'), onPress: () => router.replace('/(auth)/login') }]
        );
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

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
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../main_logo_transparent.png')}
                style={styles.logo}
                resizeMode="contain"
                tintColor={isDark ? '#FFFFFF' : undefined}
              />
            </View>

            {/* Tagline */}
            <Text style={[styles.tagline, isDark && styles.taglineDark]}>
              {t('auth.tagline')}
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

              <TextInput
                style={[
                  styles.input,
                  isDark && styles.inputDark,
                ]}
                placeholder={t('auth.password')}
                placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="new-password"
              />

              {/* Password Requirements - show when typing */}
              {password.length > 0 && (
                <View style={styles.requirements}>
                  {PASSWORD_REQUIREMENTS.map((req, index) => {
                    const isMet = req.test(password);
                    return (
                      <View key={index} style={styles.requirement}>
                        {isMet ? (
                          <Check size={14} color="#22C55E" />
                        ) : (
                          <X size={14} color={isDark ? '#6B7280' : '#9CA3AF'} />
                        )}
                        <Text
                          style={[
                            styles.requirementText,
                            isDark && styles.requirementTextDark,
                            isMet && styles.requirementMet,
                          ]}
                        >
                          {req.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}

              <TextInput
                style={[
                  styles.input,
                  isDark && styles.inputDark,
                ]}
                placeholder={t('auth.confirmPassword')}
                placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoComplete="new-password"
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSignup}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>
                  {loading ? t('auth.creatingAccount') : t('auth.signUp')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Terms */}
            <Text style={[styles.terms, isDark && styles.termsDark]}>
              {t('auth.termsText')}{' '}
              <Text style={styles.termsLink}>{t('auth.terms')}</Text> {t('auth.and')}{' '}
              <Text style={styles.termsLink}>{t('auth.privacyPolicy')}</Text>
            </Text>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, isDark && styles.dividerDark]} />
              <Text style={[styles.dividerText, isDark && styles.dividerTextDark]}>{t('common.or')}</Text>
              <View style={[styles.divider, isDark && styles.dividerDark]} />
            </View>

            {/* Login link */}
            <View style={styles.footer}>
              <Text style={[styles.footerText, isDark && styles.footerTextDark]}>
                {t('auth.hasAccount')}{' '}
              </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>{t('auth.logIn')}</Text>
                </TouchableOpacity>
              </Link>
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
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 200,
    height: 56,
  },
  tagline: {
    fontSize: 16,
    color: '#8E8E8E',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  taglineDark: {
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
  requirements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  requirementText: {
    fontSize: 12,
    color: '#8E8E8E',
  },
  requirementTextDark: {
    color: '#A8A8A8',
  },
  requirementMet: {
    color: '#22C55E',
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
  terms: {
    fontSize: 12,
    color: '#8E8E8E',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  termsDark: {
    color: '#A8A8A8',
  },
  termsLink: {
    color: colors.primary[600],
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#DBDBDB',
  },
  dividerDark: {
    backgroundColor: '#363636',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#8E8E8E',
    fontSize: 13,
    fontWeight: '600',
  },
  dividerTextDark: {
    color: '#A8A8A8',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#262626',
  },
  footerTextDark: {
    color: '#FAFAFA',
  },
  footerLink: {
    fontSize: 14,
    color: colors.primary[600],
    fontWeight: '600',
  },
});
