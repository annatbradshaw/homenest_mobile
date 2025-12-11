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
  TextInput,
} from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../stores/AuthContext';
import { useTheme } from '../../stores/ThemeContext';
import { useLanguage } from '../../stores/LanguageContext';
import { colors, typography, spacing } from '../../config/theme';
import { NestIcon } from '../../components/graphics';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('common.error'), t('errors.fillAllFields'));
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        Alert.alert(t('auth.loginFailed'), error.message);
      } else {
        router.replace('/');
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
              <NestIcon
                size={56}
                color={isDark ? colors.neutral[300] : colors.primary[500]}
                accentColor={isDark ? colors.accent[400] : colors.accent[500]}
              />
              <Text style={[styles.logoText, { color: isDark ? colors.neutral[300] : colors.primary[600] }]}>
                HomeNest
              </Text>
            </View>

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
                autoComplete="password"
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>
                  {loading ? t('auth.signingIn') : t('auth.logIn')}
                </Text>
              </TouchableOpacity>

              <Link href="/(auth)/forgot-password" asChild>
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={[styles.forgotPasswordText, isDark && styles.forgotPasswordTextDark]}>
                    {t('auth.forgotPassword')}
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, isDark && styles.dividerDark]} />
              <Text style={[styles.dividerText, isDark && styles.dividerTextDark]}>{t('common.or')}</Text>
              <View style={[styles.divider, isDark && styles.dividerDark]} />
            </View>

            {/* Sign up link */}
            <View style={styles.footer}>
              <Text style={[styles.footerText, isDark && styles.footerTextDark]}>
                {t('auth.noAccount')}{' '}
              </Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>{t('auth.signUp')}</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 12,
  },
  logoText: {
    fontSize: 32,
    fontFamily: typography.fontFamily.displayMedium,
    letterSpacing: -0.5,
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
  forgotPassword: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  forgotPasswordText: {
    color: colors.primary[600],
    fontSize: 14,
    fontWeight: '500',
  },
  forgotPasswordTextDark: {
    color: colors.primary[400],
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
