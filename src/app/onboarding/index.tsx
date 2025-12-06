import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Building2, FolderOpen, ArrowRight, Check, Home } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../stores/AuthContext';
import { useLanguage } from '../../stores/LanguageContext';
import { Button, Input, Card } from '../../components/ui';
import { colors, typography, spacing } from '../../config/theme';

type Step = 'organization' | 'project';

export default function OnboardingScreen() {
  const { user, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>('organization');
  const [loading, setLoading] = useState(false);

  // Organization form
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [orgDescription, setOrgDescription] = useState('');

  // Project form
  const [projectName, setProjectName] = useState('');
  const [projectAddress, setProjectAddress] = useState('');
  const [projectBudget, setProjectBudget] = useState('');

  const [errors, setErrors] = useState<{
    orgName?: string;
    orgSlug?: string;
    projectName?: string;
  }>({});

  // Auto-generate slug from name
  const handleOrgNameChange = (name: string) => {
    setOrgName(name);
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    setOrgSlug(slug);
  };

  const validateOrg = () => {
    const newErrors: typeof errors = {};
    if (!orgName.trim()) {
      newErrors.orgName = t('errors.orgNameRequired');
    }
    if (!orgSlug.trim()) {
      newErrors.orgSlug = t('errors.slugRequired');
    } else if (!/^[a-z0-9-]+$/.test(orgSlug)) {
      newErrors.orgSlug = t('errors.invalidSlug');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateProject = () => {
    const newErrors: typeof errors = {};
    if (!projectName.trim()) {
      newErrors.projectName = t('errors.projectNameRequired');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateOrganization = async () => {
    if (!validateOrg()) return;
    setStep('project');
  };

  const handleComplete = async () => {
    if (!validateProject()) return;

    setLoading(true);
    try {
      // Create tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: orgName.trim(),
          slug: orgSlug.trim(),
          description: orgDescription.trim() || null,
          created_by: user?.id,
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Create tenant membership
      const { error: membershipError } = await supabase
        .from('tenant_memberships')
        .insert({
          tenant_id: tenant.id,
          user_id: user?.id,
          role: 'owner',
          is_active: true,
          joined_at: new Date().toISOString(),
        });

      if (membershipError) throw membershipError;

      // Create first project
      const { error: projectError } = await supabase.from('projects').insert({
        tenant_id: tenant.id,
        name: projectName.trim(),
        address: projectAddress.trim() || null,
        total_budget: projectBudget ? parseFloat(projectBudget) : null,
        status: 'planning',
        created_by: user?.id,
      });

      if (projectError) throw projectError;

      // Refresh profile to get new memberships
      await refreshProfile();

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      Alert.alert(t('common.error'), error.message || t('errors.failedToComplete'));
    } finally {
      setLoading(false);
    }
  };

  const handleSkipProject = async () => {
    setLoading(true);
    try {
      // Create tenant only
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: orgName.trim(),
          slug: orgSlug.trim(),
          description: orgDescription.trim() || null,
          created_by: user?.id,
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Create tenant membership
      const { error: membershipError } = await supabase
        .from('tenant_memberships')
        .insert({
          tenant_id: tenant.id,
          user_id: user?.id,
          role: 'owner',
          is_active: true,
          joined_at: new Date().toISOString(),
        });

      if (membershipError) throw membershipError;

      // Refresh profile
      await refreshProfile();

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      Alert.alert(t('common.error'), error.message || t('errors.failedToComplete'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress Indicator */}
          <View style={styles.progress}>
            <View style={styles.progressStep}>
              <View
                style={[
                  styles.progressDot,
                  step === 'organization'
                    ? styles.progressDotActive
                    : styles.progressDotComplete,
                ]}
              >
                {step === 'project' ? (
                  <Check size={14} color={colors.white} />
                ) : (
                  <Text style={styles.progressDotText}>1</Text>
                )}
              </View>
              <Text style={styles.progressLabel}>{t('onboarding.organization')}</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressStep}>
              <View
                style={[
                  styles.progressDot,
                  step === 'project' && styles.progressDotActive,
                ]}
              >
                <Text style={styles.progressDotText}>2</Text>
              </View>
              <Text style={styles.progressLabel}>{t('onboarding.firstProject')}</Text>
            </View>
          </View>

          {step === 'organization' ? (
            <>
              {/* Organization Header */}
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <Building2 size={32} color={colors.primary[600]} />
                </View>
                <Text style={styles.title}>{t('onboarding.createOrganization')}</Text>
                <Text style={styles.subtitle}>
                  {t('onboarding.createOrganizationSubtitle')}
                </Text>
              </View>

              {/* Organization Form */}
              <View style={styles.form}>
                <Input
                  label={t('onboarding.organizationName')}
                  placeholder={t('onboarding.organizationNamePlaceholder')}
                  value={orgName}
                  onChangeText={handleOrgNameChange}
                  error={errors.orgName}
                />

                <Input
                  label={t('onboarding.urlSlug')}
                  placeholder={t('onboarding.urlSlugPlaceholder')}
                  value={orgSlug}
                  onChangeText={setOrgSlug}
                  error={errors.orgSlug}
                  autoCapitalize="none"
                  hint={t('onboarding.urlSlugHint')}
                />

                <Input
                  label={t('onboarding.description')}
                  placeholder={t('onboarding.descriptionPlaceholder')}
                  value={orgDescription}
                  onChangeText={setOrgDescription}
                  multiline
                  numberOfLines={3}
                  style={styles.textArea}
                />
              </View>
            </>
          ) : (
            <>
              {/* Project Header */}
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <FolderOpen size={32} color={colors.primary[600]} />
                </View>
                <Text style={styles.title}>{t('onboarding.createFirstProject')}</Text>
                <Text style={styles.subtitle}>
                  {t('onboarding.createFirstProjectSubtitle')}
                </Text>
              </View>

              {/* Project Form */}
              <View style={styles.form}>
                <Input
                  label={t('projects.projectName')}
                  placeholder={t('onboarding.projectNamePlaceholder')}
                  value={projectName}
                  onChangeText={setProjectName}
                  error={errors.projectName}
                />

                <Input
                  label={t('projects.address')}
                  placeholder={t('onboarding.addressPlaceholder')}
                  value={projectAddress}
                  onChangeText={setProjectAddress}
                />

                <Input
                  label={t('projects.totalBudget')}
                  placeholder={t('onboarding.budgetPlaceholder')}
                  value={projectBudget}
                  onChangeText={(text) => setProjectBudget(text.replace(/[^0-9.]/g, ''))}
                  keyboardType="decimal-pad"
                />
              </View>
            </>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {step === 'organization' ? (
            <Button
              title={t('common.continue')}
              onPress={handleCreateOrganization}
              fullWidth
              size="lg"
              rightIcon={<ArrowRight size={20} color={colors.white} />}
            />
          ) : (
            <>
              <Button
                title={t('onboarding.createProject')}
                onPress={handleComplete}
                loading={loading}
                fullWidth
                size="lg"
              />
              <Button
                title={t('common.skipForNow')}
                onPress={handleSkipProject}
                variant="ghost"
                fullWidth
                size="lg"
                disabled={loading}
              />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[6],
    paddingTop: spacing[4],
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[8],
  },
  progressStep: {
    alignItems: 'center',
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  progressDotActive: {
    backgroundColor: colors.primary[600],
  },
  progressDotComplete: {
    backgroundColor: colors.success[500],
  },
  progressDotText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  progressLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[500],
  },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: colors.neutral[200],
    marginHorizontal: spacing[4],
    marginBottom: spacing[6],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },
  form: {
    marginBottom: spacing[6],
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: spacing[3],
  },
  footer: {
    padding: spacing[4],
    gap: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
});
