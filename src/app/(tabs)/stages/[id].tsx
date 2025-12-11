import { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { ConfettiCelebration } from '../../../components/animations';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ChevronLeft,
  Calendar,
  DollarSign,
  Users,
  Check,
  Clock,
  Circle,
  Trash2,
  Tag,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  ListTodo,
  X,
} from 'lucide-react-native';
import { useStages, useUpdateStage, useDeleteStage } from '../../../hooks/useStages';
import { useSuppliers } from '../../../hooks/useSuppliers';
import { useTodos } from '../../../hooks/useTodos';
import { useExpenses } from '../../../hooks/useExpenses';
import { useProject } from '../../../stores/ProjectContext';
import { useTheme } from '../../../stores/ThemeContext';
import { useLanguage } from '../../../stores/LanguageContext';
import { colors as themeColors, typography } from '../../../config/theme';
import { StageStatus, StageCategory } from '../../../types/database';
import { useCurrency } from '../../../stores/CurrencyContext';

type DateField = 'planned_start_date' | 'planned_end_date' | 'actual_start_date' | 'actual_end_date';

export default function StageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentProject } = useProject();
  const { isDark, colors } = useTheme();
  const { t, formatDate } = useLanguage();
  const { formatAmount } = useCurrency();

  const CATEGORY_OPTIONS: { label: string; value: StageCategory }[] = [
    { label: t('stages.categories.siteWork'), value: 'site-work' },
    { label: t('stages.categories.structure'), value: 'structure' },
    { label: t('stages.categories.utilities'), value: 'utilities' },
    { label: t('stages.categories.interior'), value: 'interior' },
    { label: t('stages.categories.exterior'), value: 'exterior' },
    { label: t('stages.categories.finishing'), value: 'finishing' },
    { label: t('stages.categories.other'), value: 'other' },
  ];

  const STATUS_OPTIONS: { label: string; value: StageStatus; icon: any }[] = [
    { label: t('stages.notStarted'), value: 'not-started', icon: Circle },
    { label: t('stages.inProgress'), value: 'in-progress', icon: Clock },
    { label: t('stages.completed'), value: 'completed', icon: Check },
  ];

  const { data: stages } = useStages(currentProject?.id);
  const { data: suppliers } = useSuppliers(currentProject?.id);
  const { data: todos } = useTodos(currentProject?.id);
  const { data: expenses } = useExpenses(currentProject?.id);
  const updateStage = useUpdateStage();
  const deleteStage = useDeleteStage();

  const stage = stages?.find(s => s.id === id);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'other' as StageCategory,
    status: 'not-started' as StageStatus,
    planned_start_date: '',
    planned_end_date: '',
    actual_start_date: '',
    actual_end_date: '',
    estimated_cost: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDateField, setActiveDateField] = useState<DateField>('planned_start_date');

  // Update form data when stage loads
  useEffect(() => {
    if (stage) {
      setFormData({
        name: stage.name || '',
        description: stage.description || '',
        category: stage.category || 'other',
        status: stage.status || 'not-started',
        planned_start_date: stage.planned_start_date || '',
        planned_end_date: stage.planned_end_date || '',
        actual_start_date: stage.actual_start_date || '',
        actual_end_date: stage.actual_end_date || '',
        estimated_cost: stage.estimated_cost?.toString() || '',
      });
    }
  }, [stage]);

  // Get related tasks for this stage
  const relatedTasks = useMemo(() => {
    if (!todos || !stage) return [];
    return todos.filter(t => t.stage_id === stage.id);
  }, [todos, stage]);

  // Get expenses for this stage
  const stageExpenses = useMemo(() => {
    if (!expenses || !stage) return [];
    return expenses.filter(e => e.stage_id === stage.id);
  }, [expenses, stage]);

  const actualCost = useMemo(() => {
    return stageExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [stageExpenses]);

  const assignedSuppliers = suppliers?.filter(s =>
    stage?.assigned_suppliers?.includes(s.id)
  ) || [];

  if (!stage) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={isDark ? colors.neutral[50] : colors.neutral[900]} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('forms.stage')}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('errors.stageNotFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const openDatePicker = (field: DateField) => {
    setActiveDateField(field);
    setShowDatePicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, [activeDateField]: dateString }));
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert(t('common.error'), t('errors.nameRequired'));
      return;
    }
    try {
      const wasNotCompleted = stage?.status !== 'completed';
      const isNowCompleted = formData.status === 'completed';

      const estimatedCost = formData.estimated_cost ? parseFloat(formData.estimated_cost) : null;
      await updateStage.mutateAsync({
        id: stage.id,
        updates: {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          category: formData.category,
          status: formData.status,
          planned_start_date: formData.planned_start_date || null,
          planned_end_date: formData.planned_end_date || null,
          actual_start_date: formData.actual_start_date || null,
          actual_end_date: formData.actual_end_date || null,
          estimated_cost: estimatedCost,
        },
      });
      setIsEditing(false);

      // Trigger confetti when stage is marked as completed
      if (wasNotCompleted && isNowCompleted) {
        setShowConfetti(true);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.failedUpdateStage'));
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    setFormData({
      name: stage.name || '',
      description: stage.description || '',
      category: stage.category || 'other',
      status: stage.status || 'not-started',
      planned_start_date: stage.planned_start_date || '',
      planned_end_date: stage.planned_end_date || '',
      actual_start_date: stage.actual_start_date || '',
      actual_end_date: stage.actual_end_date || '',
      estimated_cost: stage.estimated_cost?.toString() || '',
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      t('alerts.deleteStageTitle'),
      t('alerts.deleteStageMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStage.mutateAsync(stage.id);
              router.back();
            } catch (error) {
              Alert.alert(t('common.error'), t('errors.failedDeleteStage'));
            }
          },
        },
      ]
    );
  };

  const getStatusStyle = (status: StageStatus) => {
    if (isDark) {
      switch (status) {
        case 'completed':
          return { bg: `${colors.success[500]}25`, text: colors.success[400] };
        case 'in-progress':
          return { bg: `${colors.primary[500]}25`, text: colors.primary[400] };
        default:
          return { bg: colors.neutral[800], text: colors.neutral[400] };
      }
    }
    switch (status) {
      case 'completed':
        return { bg: colors.success[50], text: colors.success[600] };
      case 'in-progress':
        return { bg: colors.primary[50], text: colors.primary[600] };
      default:
        return { bg: colors.neutral[100], text: colors.neutral[600] };
    }
  };

  // EDIT MODE VIEW
  if (isEditing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCancel}>
              <Text style={{ color: colors.neutral[500], fontSize: 16 }}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('forms.editStage')}</Text>
            <TouchableOpacity onPress={handleSave} disabled={updateStage.isPending}>
              <Text style={{ color: colors.primary[600], fontSize: 16, fontWeight: '600' }}>
                {updateStage.isPending ? t('common.saving') : t('common.save')}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Basic Info */}
            <View style={styles.formSection}>
              <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.basicInfo')}</Text>

              <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>{t('forms.stageNameRequired')}</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200], color: isDark ? colors.neutral[50] : colors.neutral[900] }]}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder={t('forms.stageNamePlaceholder')}
                placeholderTextColor={colors.neutral[400]}
              />

              <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>{t('stages.description')}</Text>
              <TextInput
                style={[styles.textInput, styles.textArea, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200], color: isDark ? colors.neutral[50] : colors.neutral[900] }]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder={t('forms.stageDescPlaceholder')}
                placeholderTextColor={colors.neutral[400]}
                multiline
                numberOfLines={3}
              />

              <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>{t('stages.category')}</Text>
              <View style={styles.optionsGrid}>
                {CATEGORY_OPTIONS.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.optionButton,
                      { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] },
                      formData.category === cat.value && { backgroundColor: isDark ? `${colors.primary[500]}20` : colors.primary[50], borderColor: colors.primary[500] },
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                  >
                    <Text style={[
                      styles.optionText,
                      { color: isDark ? colors.neutral[300] : colors.neutral[600] },
                      formData.category === cat.value && { color: colors.primary[600], fontWeight: '600' },
                    ]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>{t('stages.status')}</Text>
              <View style={styles.statusOptions}>
                {STATUS_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isActive = formData.status === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.statusOption,
                        { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] },
                        isActive && { backgroundColor: isDark ? `${colors.primary[500]}20` : colors.primary[50], borderColor: colors.primary[500] },
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, status: option.value }))}
                    >
                      <Icon size={16} color={isActive ? colors.primary[600] : colors.neutral[400]} />
                      <Text style={[
                        styles.statusOptionText,
                        { color: isDark ? colors.neutral[300] : colors.neutral[600] },
                        isActive && { color: colors.primary[600], fontWeight: '600' },
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Planned Timeline */}
            <View style={styles.formSection}>
              <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.plannedTimeline')}</Text>

              <View style={styles.dateRow}>
                <View style={styles.dateField}>
                  <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>{t('stages.startDate')}</Text>
                  <TouchableOpacity
                    style={[styles.dateButton, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}
                    onPress={() => openDatePicker('planned_start_date')}
                  >
                    <Calendar size={16} color={colors.neutral[400]} />
                    <Text style={[formData.planned_start_date ? styles.dateText : styles.datePlaceholder, { color: formData.planned_start_date ? (isDark ? colors.neutral[50] : colors.neutral[900]) : colors.neutral[400] }]}>
                      {formData.planned_start_date ? formatDate(formData.planned_start_date, 'short') : t('common.select')}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.dateField}>
                  <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>{t('stages.endDate')}</Text>
                  <TouchableOpacity
                    style={[styles.dateButton, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}
                    onPress={() => openDatePicker('planned_end_date')}
                  >
                    <Calendar size={16} color={colors.neutral[400]} />
                    <Text style={[formData.planned_end_date ? styles.dateText : styles.datePlaceholder, { color: formData.planned_end_date ? (isDark ? colors.neutral[50] : colors.neutral[900]) : colors.neutral[400] }]}>
                      {formData.planned_end_date ? formatDate(formData.planned_end_date, 'short') : t('common.select')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Actual Timeline */}
            <View style={styles.formSection}>
              <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.actualTimeline')}</Text>

              <View style={styles.dateRow}>
                <View style={styles.dateField}>
                  <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>{t('forms.started')}</Text>
                  <TouchableOpacity
                    style={[styles.dateButton, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}
                    onPress={() => openDatePicker('actual_start_date')}
                  >
                    <Calendar size={16} color={colors.success[500]} />
                    <Text style={[formData.actual_start_date ? styles.dateText : styles.datePlaceholder, { color: formData.actual_start_date ? (isDark ? colors.neutral[50] : colors.neutral[900]) : colors.neutral[400] }]}>
                      {formData.actual_start_date ? formatDate(formData.actual_start_date, 'short') : t('common.select')}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.dateField}>
                  <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>{t('forms.completedOn')}</Text>
                  <TouchableOpacity
                    style={[styles.dateButton, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}
                    onPress={() => openDatePicker('actual_end_date')}
                  >
                    <Calendar size={16} color={colors.success[500]} />
                    <Text style={[formData.actual_end_date ? styles.dateText : styles.datePlaceholder, { color: formData.actual_end_date ? (isDark ? colors.neutral[50] : colors.neutral[900]) : colors.neutral[400] }]}>
                      {formData.actual_end_date ? formatDate(formData.actual_end_date, 'short') : t('common.select')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Budget */}
            <View style={styles.formSection}>
              <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.budget')}</Text>

              <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>{t('forms.estimatedCost')}</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200], color: isDark ? colors.neutral[50] : colors.neutral[900] }]}
                value={formData.estimated_cost}
                onChangeText={(text) => setFormData(prev => ({ ...prev, estimated_cost: text }))}
                placeholder="0.00"
                placeholderTextColor={colors.neutral[400]}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Delete Button */}
            <View style={styles.formSection}>
              <TouchableOpacity style={[styles.deleteButton, { backgroundColor: isDark ? `${colors.danger[500]}15` : colors.danger[50], borderColor: isDark ? colors.danger[800] : colors.danger[200] }]} onPress={handleDelete}>
                <Trash2 size={18} color={isDark ? colors.danger[400] : colors.danger[600]} />
                <Text style={[styles.deleteButtonText, { color: isDark ? colors.danger[400] : colors.danger[600] }]}>{t('forms.deleteStage')}</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>

          {Platform.OS === 'ios' && showDatePicker && (
            <View style={[styles.datePickerContainer, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderTopColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
              <View style={[styles.datePickerHeader, { borderBottomColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={{ color: colors.neutral[500], fontSize: 16 }}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={{ color: colors.primary[600], fontWeight: '600', fontSize: 16 }}>{t('common.done')}</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={formData[activeDateField] ? new Date(formData[activeDateField]) : new Date()}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                textColor={isDark ? '#fff' : '#000'}
                style={{ height: 200 }}
              />
            </View>
          )}
          {Platform.OS === 'android' && showDatePicker && (
            <DateTimePicker
              value={formData[activeDateField] ? new Date(formData[activeDateField]) : new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // NORMAL VIEW MODE
  const statusStyle = getStatusStyle(stage.status);
  const costVariance = stage.estimated_cost ? stage.estimated_cost - actualCost : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={isDark ? colors.neutral[50] : colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('forms.stageDetails')}</Text>
        <TouchableOpacity onPress={() => setIsEditing(true)}>
          <Text style={styles.editButton}>{t('common.edit')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Name & Description */}
        <View style={styles.section}>
          <Text style={[styles.stageName, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{stage.name}</Text>
          {stage.description && (
            <Text style={[styles.stageDescription, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>{stage.description}</Text>
          )}
          <View style={styles.badges}>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {stage.status === 'in-progress' ? t('stages.inProgress') :
                 stage.status === 'completed' ? t('stages.completed') : t('stages.notStarted')}
              </Text>
            </View>
            {stage.category && (
              <View style={[styles.categoryBadge, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                <Tag size={12} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
                <Text style={[styles.categoryText, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>
                  {CATEGORY_OPTIONS.find(c => c.value === stage.category)?.label || stage.category}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Planned Timeline */}
        {(stage.planned_start_date || stage.planned_end_date) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.plannedTimeline')}</Text>
            <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
              <View style={styles.cardRow}>
                <Calendar size={18} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
                <View style={styles.cardRowContent}>
                  <Text style={[styles.cardLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('stages.startDate')}</Text>
                  <Text style={[styles.cardValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
                    {stage.planned_start_date ? formatDate(stage.planned_start_date, 'long') : t('forms.notSet')}
                  </Text>
                </View>
              </View>
              <View style={[styles.cardDivider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
              <View style={styles.cardRow}>
                <Calendar size={18} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
                <View style={styles.cardRowContent}>
                  <Text style={[styles.cardLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('stages.endDate')}</Text>
                  <Text style={[styles.cardValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
                    {stage.planned_end_date ? formatDate(stage.planned_end_date, 'long') : t('forms.notSet')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Actual Timeline */}
        {(stage.actual_start_date || stage.actual_end_date) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.actualTimeline')}</Text>
            <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
              <View style={styles.cardRow}>
                <Calendar size={18} color={colors.success[500]} />
                <View style={styles.cardRowContent}>
                  <Text style={[styles.cardLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.started')}</Text>
                  <Text style={[styles.cardValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
                    {stage.actual_start_date ? formatDate(stage.actual_start_date, 'long') : t('forms.notStartedYet')}
                  </Text>
                </View>
              </View>
              {stage.actual_end_date && (
                <>
                  <View style={[styles.cardDivider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
                  <View style={styles.cardRow}>
                    <Calendar size={18} color={colors.success[500]} />
                    <View style={styles.cardRowContent}>
                      <Text style={[styles.cardLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.completedOn')}</Text>
                      <Text style={[styles.cardValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
                        {formatDate(stage.actual_end_date, 'long')}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* Budget */}
        {(stage.estimated_cost || actualCost > 0) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.budget')}</Text>
            <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
              {stage.estimated_cost && (
                <View style={styles.cardRow}>
                  <DollarSign size={18} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
                  <View style={styles.cardRowContent}>
                    <Text style={[styles.cardLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.estimatedCostLabel')}</Text>
                    <Text style={[styles.cardValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
                      {formatAmount(stage.estimated_cost)}
                    </Text>
                  </View>
                </View>
              )}
              {actualCost > 0 && (
                <>
                  {stage.estimated_cost && <View style={[styles.cardDivider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />}
                  <View style={styles.cardRow}>
                    <DollarSign size={18} color={colors.primary[500]} />
                    <View style={styles.cardRowContent}>
                      <Text style={[styles.cardLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.actualCost')}</Text>
                      <Text style={[styles.cardValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
                        {formatAmount(actualCost)}
                      </Text>
                    </View>
                  </View>
                </>
              )}
              {costVariance !== null && actualCost > 0 && (
                <>
                  <View style={[styles.cardDivider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
                  <View style={styles.cardRow}>
                    {costVariance >= 0 ? (
                      <TrendingDown size={18} color={colors.success[500]} />
                    ) : (
                      <TrendingUp size={18} color={colors.danger[500]} />
                    )}
                    <View style={styles.cardRowContent}>
                      <Text style={[styles.cardLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.variance')}</Text>
                      <Text style={[styles.cardValue, { color: costVariance >= 0 ? colors.success[600] : colors.danger[600] }]}>
                        {costVariance >= 0 ? '-' : '+'}{formatAmount(Math.abs(costVariance))}
                        {costVariance >= 0 ? ` ${t('forms.underBudget')}` : ` ${t('forms.overBudget')}`}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* Assigned Suppliers */}
        {assignedSuppliers.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.assignedSuppliers')}</Text>
            <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
              {assignedSuppliers.map((supplier, index) => (
                <View key={supplier.id}>
                  {index > 0 && <View style={[styles.cardDivider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />}
                  <View style={styles.cardRow}>
                    <Users size={18} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
                    <View style={styles.cardRowContent}>
                      <Text style={[styles.cardValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{supplier.name}</Text>
                      {supplier.company && (
                        <Text style={[styles.cardLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{supplier.company}</Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Related Tasks */}
        {relatedTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.relatedTasks')}</Text>
            <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
              {relatedTasks.map((task, index) => (
                <TouchableOpacity key={task.id} onPress={() => router.push(`/(tabs)/todos/${task.id}`)}>
                  {index > 0 && <View style={[styles.cardDivider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />}
                  <View style={styles.cardRow}>
                    {task.status === 'completed' ? (
                      <CheckCircle2 size={18} color={colors.success[500]} />
                    ) : (
                      <ListTodo size={18} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
                    )}
                    <View style={styles.cardRowContent}>
                      <Text style={[styles.cardValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }, task.status === 'completed' && styles.taskCompleted]}>
                        {task.title}
                      </Text>
                      <Text style={[styles.cardLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                        {task.status === 'completed' ? t('stages.completed') : task.status === 'in-progress' ? t('stages.inProgress') : t('forms.pending')}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Delete Button */}
        <View style={styles.section}>
          <TouchableOpacity style={[styles.deleteButton, { backgroundColor: isDark ? `${colors.danger[500]}15` : colors.danger[50], borderColor: isDark ? colors.danger[800] : colors.danger[200] }]} onPress={handleDelete}>
            <Trash2 size={18} color={isDark ? colors.danger[400] : colors.danger[600]} />
            <Text style={[styles.deleteButtonText, { color: isDark ? colors.danger[400] : colors.danger[600] }]}>{t('forms.deleteStage')}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Confetti celebration when stage is completed */}
      <ConfettiCelebration
        visible={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />
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
  },
  headerSpacer: {
    width: 40,
  },
  editButton: {
    fontSize: 16,
    fontFamily: typography.fontFamily.bodySemibold,
    color: themeColors.primary[600],
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.body,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  formSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bodySemibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  stageName: {
    fontSize: 24,
    fontFamily: typography.fontFamily.displayBold,
    marginBottom: 8,
  },
  stageDescription: {
    fontSize: 16,
    fontFamily: typography.fontFamily.body,
    lineHeight: 24,
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.bodySemibold,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  cardRowContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 13,
    fontFamily: typography.fontFamily.body,
  },
  cardValue: {
    fontSize: 16,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  cardDivider: {
    height: 1,
    marginLeft: 46,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
  },
  deleteButtonText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.bodySemibold,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  // Form styles
  inputLabel: {
    fontSize: 14,
    fontFamily: typography.fontFamily.bodyMedium,
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: typography.fontFamily.body,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  statusOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
  },
  statusOptionText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateField: {
    flex: 1,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dateText: {
    fontSize: 15,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  datePlaceholder: {
    fontSize: 15,
    fontFamily: typography.fontFamily.body,
  },
  datePickerContainer: {
    borderTopWidth: 1,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
});
