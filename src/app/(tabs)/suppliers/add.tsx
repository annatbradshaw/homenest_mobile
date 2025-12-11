import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ChevronLeft,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Star,
  Layers,
} from 'lucide-react-native';
import { useProject } from '../../../stores/ProjectContext';
import { useCreateSupplier } from '../../../hooks/useSuppliers';
import { useStages } from '../../../hooks/useStages';
import { colors as themeColors, typography } from '../../../config/theme';
import { useTheme } from '../../../stores/ThemeContext';
import { useLanguage } from '../../../stores/LanguageContext';

export default function AddSupplierScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const { currentProject } = useProject();
  const createSupplier = useCreateSupplier();
  const { data: stages } = useStages(currentProject?.id);

  // Form state matching platform exactly
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    address: '',
    specialty: '',
    contractValue: '',
    paymentTerms: '',
    rating: '',
    notes: '',
    isActive: true,
    stageIds: [] as string[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStageToggle = (stageId: string) => {
    setFormData(prev => ({
      ...prev,
      stageIds: prev.stageIds.includes(stageId)
        ? prev.stageIds.filter(id => id !== stageId)
        : [...prev.stageIds, stageId],
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert(t('common.error'), t('errors.nameRequired'));
      return;
    }

    if (!currentProject?.id) {
      Alert.alert(t('common.error'), t('errors.noProjectSelected'));
      return;
    }

    setIsSubmitting(true);
    try {
      await createSupplier.mutateAsync({
        project_id: currentProject.id,
        name: formData.name.trim(),
        company: formData.company.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
        specialty: formData.specialty.trim() || undefined,
        contract_value: formData.contractValue ? parseFloat(formData.contractValue) : undefined,
        payment_terms: formData.paymentTerms.trim() || undefined,
        rating: formData.rating ? parseInt(formData.rating) : undefined,
        stage_ids: formData.stageIds.length > 0 ? formData.stageIds : undefined,
        notes: formData.notes.trim() || undefined,
        is_active: formData.isActive,
      });
      router.back();
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.failedCreateSupplier'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={isDark ? colors.neutral[50] : colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('suppliers.addSupplier')}</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSubmitting}
          style={styles.saveButtonContainer}
        >
          <Text style={[styles.saveButton, isSubmitting && { color: isDark ? colors.neutral[600] : colors.neutral[400] }]}>
            {isSubmitting ? t('common.creating') : t('common.create')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.basicInfo')}</Text>
          <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
            <View style={styles.inputRow}>
              <View style={styles.inputIcon}>
                <User size={18} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
              </View>
              <TextInput
                style={[styles.input, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}
                value={formData.name}
                onChangeText={(value) => updateField('name', value)}
                placeholder={t('forms.namePlaceholder')}
                placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
            <View style={styles.inputRow}>
              <View style={styles.inputIcon}>
                <Building2 size={18} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
              </View>
              <TextInput
                style={[styles.input, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}
                value={formData.company}
                onChangeText={(value) => updateField('company', value)}
                placeholder={t('forms.companyPlaceholder')}
                placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
              />
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.contactInfo')}</Text>
          <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
            <View style={styles.inputRow}>
              <View style={styles.inputIcon}>
                <Phone size={18} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
              </View>
              <TextInput
                style={[styles.input, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}
                value={formData.phone}
                onChangeText={(value) => updateField('phone', value)}
                placeholder={t('forms.phonePlaceholder')}
                placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                keyboardType="phone-pad"
              />
            </View>
            <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
            <View style={styles.inputRow}>
              <View style={styles.inputIcon}>
                <Mail size={18} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
              </View>
              <TextInput
                style={[styles.input, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}
                value={formData.email}
                onChangeText={(value) => updateField('email', value)}
                placeholder={t('forms.emailPlaceholder')}
                placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
            <View style={styles.inputRow}>
              <View style={styles.inputIcon}>
                <MapPin size={18} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
              </View>
              <TextInput
                style={[styles.input, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}
                value={formData.address}
                onChangeText={(value) => updateField('address', value)}
                placeholder={t('forms.addressPlaceholder')}
                placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
              />
            </View>
          </View>
        </View>

        {/* Professional Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.professionalInfo')}</Text>
          <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { paddingLeft: 16, color: isDark ? colors.neutral[50] : colors.neutral[900] }]}
                value={formData.specialty}
                onChangeText={(value) => updateField('specialty', value)}
                placeholder={t('forms.specialtyPlaceholder')}
                placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
            <View style={styles.inputRow}>
              <View style={styles.inputIcon}>
                <DollarSign size={18} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
              </View>
              <TextInput
                style={[styles.input, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}
                value={formData.contractValue}
                onChangeText={(value) => updateField('contractValue', value)}
                placeholder={t('forms.contractValuePlaceholder')}
                placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>

        {/* Payment Terms and Rating */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.paymentRating')}</Text>
          <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { paddingLeft: 16, color: isDark ? colors.neutral[50] : colors.neutral[900] }]}
                value={formData.paymentTerms}
                onChangeText={(value) => updateField('paymentTerms', value)}
                placeholder={t('forms.paymentTermsPlaceholder')}
                placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
            <View style={styles.ratingRow}>
              <Text style={[styles.ratingLabel, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('forms.rating')}</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => updateField('rating', formData.rating === String(star) ? '' : String(star))}
                    style={styles.starButton}
                  >
                    <Star
                      size={24}
                      color={formData.rating && parseInt(formData.rating) >= star ? colors.accent[500] : (isDark ? colors.neutral[600] : colors.neutral[300])}
                      fill={formData.rating && parseInt(formData.rating) >= star ? colors.accent[500] : 'transparent'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Status */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.status')}</Text>
          <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
            <View style={styles.toggleRow}>
              <Text style={[styles.toggleLabel, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('forms.activeSupplier')}</Text>
              <Switch
                value={formData.isActive}
                onValueChange={(value) => updateField('isActive', value)}
                trackColor={{ false: isDark ? colors.neutral[700] : colors.neutral[200], true: colors.primary[500] }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Assigned Stages */}
        {stages && stages.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
              <Layers size={14} color={isDark ? colors.neutral[400] : colors.neutral[500]} /> {t('forms.assignedStages')}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>
              {t('forms.selectStagesHint')}
            </Text>
            <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
              {stages.map((stage, index) => (
                <View key={stage.id}>
                  {index > 0 && <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />}
                  <View style={styles.stageRow}>
                    <View style={styles.stageInfo}>
                      <Text style={[styles.stageName, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{stage.name}</Text>
                      <Text style={[styles.stageCategory, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                        {stage.category?.replace('-', ' ')}
                      </Text>
                    </View>
                    <Switch
                      value={formData.stageIds.includes(stage.id)}
                      onValueChange={() => handleStageToggle(stage.id)}
                      trackColor={{ false: isDark ? colors.neutral[700] : colors.neutral[200], true: colors.primary[500] }}
                      thumbColor="#fff"
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Notes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.notes')}</Text>
          <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
            <TextInput
              style={[styles.textArea, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}
              value={formData.notes}
              onChangeText={(value) => updateField('notes', value)}
              placeholder={t('forms.notesPlaceholder')}
              placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerTitle: {
    fontSize: 18,
    fontFamily: typography.fontFamily.bodyMedium,
    color: themeColors.neutral[900],
  },
  saveButtonContainer: {
    paddingHorizontal: 4,
  },
  saveButton: {
    fontSize: 16,
    fontFamily: typography.fontFamily.bodySemibold,
    color: themeColors.primary[600],
  },
  saveButtonDisabled: {
    color: themeColors.neutral[400],
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bodySemibold,
    color: themeColors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: typography.fontFamily.body,
    color: themeColors.neutral[400],
    marginTop: -8,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: themeColors.neutral[200],
    overflow: 'hidden',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputIcon: {
    width: 32,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: typography.fontFamily.body,
    color: themeColors.neutral[900],
  },
  divider: {
    height: 1,
    backgroundColor: themeColors.neutral[100],
    marginLeft: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontFamily: typography.fontFamily.body,
    color: themeColors.neutral[900],
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  ratingLabel: {
    fontSize: 16,
    fontFamily: typography.fontFamily.body,
    color: themeColors.neutral[900],
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  starButton: {
    padding: 4,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  stageInfo: {
    flex: 1,
  },
  stageName: {
    fontSize: 15,
    fontFamily: typography.fontFamily.bodyMedium,
    color: themeColors.neutral[900],
  },
  stageCategory: {
    fontSize: 13,
    fontFamily: typography.fontFamily.body,
    color: themeColors.neutral[500],
    marginTop: 2,
    textTransform: 'capitalize',
  },
  textArea: {
    padding: 16,
    fontSize: 16,
    fontFamily: typography.fontFamily.body,
    color: themeColors.neutral[900],
    minHeight: 100,
  },
});
