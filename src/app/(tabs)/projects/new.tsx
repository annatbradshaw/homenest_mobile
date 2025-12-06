import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { X, MapPin, Calendar, DollarSign } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCreateProject } from '../../../hooks/useProjects';
import { Button, Input, Card } from '../../../components/ui';
import { colors as themeColors, typography, spacing } from '../../../config/theme';
import { ProjectStatus } from '../../../types/database';
import { useTheme } from '../../../stores/ThemeContext';
import { useLanguage } from '../../../stores/LanguageContext';

export default function NewProjectScreen() {
  const { isDark, colors } = useTheme();
  const { t, formatDate } = useLanguage();

  // Define options inside component to access translations
  const STATUS_OPTIONS: { label: string; value: ProjectStatus }[] = [
    { label: t('projects.planning'), value: 'planning' },
    { label: t('projects.inProgress'), value: 'in-progress' },
    { label: t('projects.onHold'), value: 'on-hold' },
  ];

  const createProject = useCreateProject();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [status, setStatus] = useState<ProjectStatus>('planning');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showTargetPicker, setShowTargetPicker] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) {
      newErrors.name = t('errors.projectNameRequired');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;

    try {
      const project = await createProject.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        address: address.trim() || undefined,
        total_budget: budget ? parseFloat(budget) : undefined,
        start_date: startDate?.toISOString(),
        target_completion_date: targetDate?.toISOString(),
        status,
      });

      router.replace(`/(tabs)/projects/${project.id}`);
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.failedCreateProject'));
    }
  };

  const formatDateLocal = (date: Date | null) => {
    if (!date) return t('forms.selectDate');
    return formatDate(date, 'long');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <X size={24} color={isDark ? colors.neutral[400] : colors.neutral[700]} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('projects.newProject')}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('forms.basicInfo')}</Text>
            <Input
              label={t('projects.projectName')}
              placeholder={t('projects.projectNamePlaceholder')}
              value={name}
              onChangeText={setName}
              error={errors.name}
            />
            <Input
              label={`${t('forms.descriptionLabel')} (${t('common.optional')})`}
              placeholder={t('forms.descriptionPlaceholder')}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              style={styles.textArea}
            />
            <Input
              label={`${t('projects.address')} (${t('common.optional')})`}
              placeholder={t('projects.addressPlaceholder')}
              value={address}
              onChangeText={setAddress}
              leftIcon={<MapPin size={20} color={isDark ? colors.neutral[500] : colors.neutral[400]} />}
            />
          </View>

          {/* Budget */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('forms.budget')}</Text>
            <Input
              label={`${t('projects.totalBudget')} (${t('common.optional')})`}
              placeholder="0.00"
              value={budget}
              onChangeText={(text) => setBudget(text.replace(/[^0-9.]/g, ''))}
              keyboardType="decimal-pad"
              leftIcon={<DollarSign size={20} color={isDark ? colors.neutral[500] : colors.neutral[400]} />}
            />
          </View>

          {/* Dates */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('forms.timeline')}</Text>

            <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[700] }]}>{t('projects.startDate')} ({t('common.optional')})</Text>
            <TouchableOpacity
              style={[
                styles.dateButton,
                {
                  backgroundColor: isDark ? colors.neutral[800] : '#fff',
                  borderColor: isDark ? colors.neutral[700] : colors.neutral[300]
                }
              ]}
              onPress={() => setShowStartPicker(true)}
            >
              <Calendar size={20} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
              <Text
                style={[
                  styles.dateButtonText,
                  { color: isDark ? colors.neutral[50] : colors.neutral[900] },
                  !startDate && [styles.dateButtonPlaceholder, { color: isDark ? colors.neutral[500] : colors.neutral[400] }],
                ]}
              >
                {formatDateLocal(startDate)}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[700] }]}>{t('projects.targetEndDate')} ({t('common.optional')})</Text>
            <TouchableOpacity
              style={[
                styles.dateButton,
                {
                  backgroundColor: isDark ? colors.neutral[800] : '#fff',
                  borderColor: isDark ? colors.neutral[700] : colors.neutral[300]
                }
              ]}
              onPress={() => setShowTargetPicker(true)}
            >
              <Calendar size={20} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
              <Text
                style={[
                  styles.dateButtonText,
                  { color: isDark ? colors.neutral[50] : colors.neutral[900] },
                  !targetDate && [styles.dateButtonPlaceholder, { color: isDark ? colors.neutral[500] : colors.neutral[400] }],
                ]}
              >
                {formatDateLocal(targetDate)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Status */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('forms.status')}</Text>
            <View style={styles.statusOptions}>
              {STATUS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.statusOption,
                    {
                      backgroundColor: status === option.value ? colors.primary[600] : 'transparent',
                      borderColor: status === option.value ? colors.primary[600] : (isDark ? colors.neutral[700] : colors.neutral[300])
                    }
                  ]}
                  onPress={() => setStatus(option.value)}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      {
                        color: status === option.value
                          ? '#fff'
                          : (isDark ? colors.neutral[400] : colors.neutral[700])
                      }
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
          <Button
            title={t('onboarding.createProject')}
            onPress={handleCreate}
            loading={createProject.isPending}
            fullWidth
            size="lg"
          />
        </View>

        {/* Date Pickers */}
        {showStartPicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            onChange={(event, date) => {
              setShowStartPicker(false);
              if (date) setStartDate(date);
            }}
          />
        )}
        {showTargetPicker && (
          <DateTimePicker
            value={targetDate || new Date()}
            mode="date"
            minimumDate={startDate || new Date()}
            onChange={(event, date) => {
              setShowTargetPicker(false);
              if (date) setTargetDate(date);
            }}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.white,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: themeColors.neutral[200],
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: themeColors.neutral[900],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: themeColors.neutral[900],
    marginBottom: spacing[4],
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: spacing[3],
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: themeColors.neutral[700],
    marginBottom: spacing[1.5],
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    height: 44,
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: themeColors.neutral[300],
    borderRadius: 8,
    backgroundColor: themeColors.white,
    marginBottom: spacing[4],
  },
  dateButtonText: {
    fontSize: typography.fontSize.base,
    color: themeColors.neutral[900],
  },
  dateButtonPlaceholder: {
    color: themeColors.neutral[400],
  },
  statusOptions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  statusOption: {
    flex: 1,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColors.neutral[300],
    alignItems: 'center',
  },
  statusOptionActive: {
    backgroundColor: themeColors.primary[600],
    borderColor: themeColors.primary[600],
  },
  statusOptionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: themeColors.neutral[700],
  },
  statusOptionTextActive: {
    color: themeColors.white,
  },
  footer: {
    padding: spacing[4],
    borderTopWidth: 1,
    borderTopColor: themeColors.neutral[200],
  },
});
