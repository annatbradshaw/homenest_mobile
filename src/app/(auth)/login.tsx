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
} from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock } from 'lucide-react-native';
import { useAuth } from '../../stores/AuthContext';
import { useTheme } from '../../stores/ThemeContext';
import { Button, Input } from '../../components/ui';
import { colors, typography, spacing } from '../../config/theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const { error } = await signIn(email, password);

      if (error) {
        Alert.alert('Login Failed', error.message);
      } else {
        router.replace('/');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Decorative gradient background */}
      <LinearGradient
        colors={isDark
          ? [colors.primary[900], 'transparent']
          : [colors.primary[100], 'transparent']
        }
        style={styles.gradientBackground}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Decorative circles */}
      <View style={[styles.decorativeCircle1, isDark && styles.decorativeCircleDark]} />
      <View style={[styles.decorativeCircle2, isDark && styles.decorativeCircleDark]} />

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
            {/* Logo/Brand */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../../main_logo_transparent.png')}
                  style={styles.logo}
                  resizeMode="contain"
                  tintColor={isDark ? '#FFFFFF' : undefined}
                />
              </View>
              <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
                Welcome back! Sign in to continue.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={[styles.formCard, isDark && styles.formCardDark]}>
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  error={errors.email}
                  leftIcon={<Mail size={20} color={colors.neutral[400]} />}
                />

                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password"
                  error={errors.password}
                  leftIcon={<Lock size={20} color={colors.neutral[400]} />}
                />

                <TouchableOpacity style={styles.forgotPassword}>
                  <Link href="/(auth)/forgot-password" asChild>
                    <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                  </Link>
                </TouchableOpacity>

                <Button
                  title="Sign In"
                  onPress={handleLogin}
                  loading={loading}
                  fullWidth
                  size="lg"
                />
              </View>
            </View>

            {/* Sign up link */}
            <View style={styles.footer}>
              <Text style={[styles.footerText, isDark && styles.footerTextDark]}>
                Don't have an account?{' '}
              </Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>Sign up</Text>
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
    backgroundColor: colors.white,
  },
  containerDark: {
    backgroundColor: colors.neutral[900],
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary[100],
    opacity: 0.5,
  },
  decorativeCircle2: {
    position: 'absolute',
    top: 100,
    left: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.accent[100],
    opacity: 0.3,
  },
  decorativeCircleDark: {
    opacity: 0.1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing[6],
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  logoContainer: {
    marginBottom: spacing[4],
  },
  logo: {
    width: 180,
    height: 50,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[500],
    textAlign: 'center',
  },
  subtitleDark: {
    color: colors.neutral[400],
  },
  form: {
    marginBottom: spacing[6],
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing[5],
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  formCardDark: {
    backgroundColor: colors.neutral[800],
    shadowOpacity: 0.3,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing[5],
    marginTop: -spacing[1],
  },
  forgotPasswordText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[600],
  },
  footerTextDark: {
    color: colors.neutral[400],
  },
  footerLink: {
    fontSize: typography.fontSize.base,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
  },
});
