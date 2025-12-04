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
import { Mail, Lock, Check, X } from 'lucide-react-native';
import { useAuth } from '../../stores/AuthContext';
import { useTheme } from '../../stores/ThemeContext';
import { Button, Input } from '../../components/ui';
import { colors, typography, spacing } from '../../config/theme';

// Password requirements based on NIST guidelines
const PASSWORD_REQUIREMENTS = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Contains uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Contains lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Contains a number', test: (p: string) => /[0-9]/.test(p) },
];

export default function SignupScreen() {
  const { signUp } = useAuth();
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else {
      const failedRequirements = PASSWORD_REQUIREMENTS.filter((req) => !req.test(password));
      if (failedRequirements.length > 0) {
        newErrors.password = 'Password does not meet requirements';
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const { error } = await signUp(email, password);

      if (error) {
        Alert.alert('Sign Up Failed', error.message);
      } else {
        Alert.alert(
          'Account Created',
          'Please check your email to verify your account.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
        );
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
              <Text style={[styles.title, isDark && styles.titleDark]}>Create Account</Text>
              <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
                Start managing your renovation projects today.
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
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="new-password"
                  error={errors.password}
                  leftIcon={<Lock size={20} color={colors.neutral[400]} />}
                />

                {/* Password requirements */}
                <View style={[styles.requirements, isDark && styles.requirementsDark]}>
                  {PASSWORD_REQUIREMENTS.map((req, index) => {
                    const isMet = req.test(password);
                    return (
                      <View key={index} style={styles.requirement}>
                        <View style={[
                          styles.requirementIcon,
                          isMet && styles.requirementIconMet,
                        ]}>
                          {isMet ? (
                            <Check size={12} color={colors.white} />
                          ) : (
                            <X size={12} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
                          )}
                        </View>
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

                <Input
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoComplete="new-password"
                  error={errors.confirmPassword}
                  leftIcon={<Lock size={20} color={colors.neutral[400]} />}
                />

                <Button
                  title="Create Account"
                  onPress={handleSignup}
                  loading={loading}
                  fullWidth
                  size="lg"
                />
              </View>
            </View>

            {/* Sign in link */}
            <View style={styles.footer}>
              <Text style={[styles.footerText, isDark && styles.footerTextDark]}>
                Already have an account?{' '}
              </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>Sign in</Text>
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
    paddingTop: spacing[4],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  logoContainer: {
    marginBottom: spacing[3],
  },
  logo: {
    width: 160,
    height: 44,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  titleDark: {
    color: colors.neutral[50],
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
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
  requirements: {
    marginBottom: spacing[4],
    marginTop: -spacing[2],
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: spacing[3],
  },
  requirementsDark: {
    backgroundColor: colors.neutral[700],
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  requirementIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  requirementIconMet: {
    backgroundColor: colors.success[500],
  },
  requirementText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[500],
  },
  requirementTextDark: {
    color: colors.neutral[400],
  },
  requirementMet: {
    color: colors.success[600],
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
