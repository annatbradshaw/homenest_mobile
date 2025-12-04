import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Layers, Check, Plus, X, Calendar, DollarSign, Users, AlertCircle } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useProject } from '../../../stores/ProjectContext';
import { useTheme } from '../../../stores/ThemeContext';
import { useLanguage } from '../../../stores/LanguageContext';
import { useStages, useCreateStage } from '../../../hooks/useStages';
import { colors as themeColors } from '../../../config/theme';
import { useSuppliers } from '../../../hooks/useSuppliers';
import { StageStatus, StageCategory } from '../../../types/database';
import { format, isPast, isToday, parseISO } from 'date-fns';

const STAGE_CATEGORIES: { label: string; value: StageCategory }[] = [
  { label: 'Site Work', value: 'site-work' },
  { label: 'Utilities', value: 'utilities' },
  { label: 'Structure', value: 'structure' },
  { label: 'Interior', value: 'interior' },
  { label: 'Exterior', value: 'exterior' },
  { label: 'Finishing', value: 'finishing' },
  { label: 'Other', value: 'other' },
];

const STATUS_OPTIONS: { label: string; value: StageStatus }[] = [
  { label: 'Not Started', value: 'not-started' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Completed', value: 'completed' },
];

type DateField = 'planned_start_date' | 'planned_end_date';
type ModalView = 'form' | 'suppliers' | 'dependencies';

export default function StagesScreen() {
  const { openAdd } = useLocalSearchParams<{ openAdd?: string }>();
  const { currentProject } = useProject();
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const { data: stages, isLoading, refetch } = useStages(currentProject?.id);
  const { data: suppliers } = useSuppliers(currentProject?.id);
  const createStage = useCreateStage();
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Open modal when navigated with openAdd parameter
  useEffect(() => {
    if (openAdd === 'true') {
      setShowAddModal(true);
      // Clear the parameter from URL
      router.setParams({ openAdd: undefined });
    }
  }, [openAdd]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDateField, setActiveDateField] = useState<DateField>('planned_start_date');
  const [modalView, setModalView] = useState<ModalView>('form');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'other' as StageCategory,
    status: 'not-started' as StageStatus,
    planned_start_date: '',
    planned_end_date: '',
    estimated_cost: '',
    assigned_suppliers: [] as string[],
    dependencies: [] as string[],
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'other',
      status: 'not-started',
      planned_start_date: '',
      planned_end_date: '',
      estimated_cost: '',
      assigned_suppliers: [],
      dependencies: [],
    });
    setModalView('form');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCreateStage = async () => {
    if (!formData.name.trim() || !currentProject) return;
    try {
      const estimatedCost = formData.estimated_cost ? parseFloat(formData.estimated_cost) : undefined;
      await createStage.mutateAsync({
        project_id: currentProject.id,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category,
        status: formData.status,
        planned_start_date: formData.planned_start_date || undefined,
        planned_end_date: formData.planned_end_date || undefined,
        estimated_cost: isNaN(estimatedCost!) ? undefined : estimatedCost,
        assigned_suppliers: formData.assigned_suppliers.length > 0 ? formData.assigned_suppliers : undefined,
        dependencies: formData.dependencies.length > 0 ? formData.dependencies : undefined,
      });
      resetForm();
      setShowAddModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to create stage');
    }
  };

  const openDatePicker = (field: DateField) => {
    setActiveDateField(field);
    setShowDatePicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        [activeDateField]: selectedDate.toISOString().split('T')[0]
      }));
    }
  };

  const handleSupplierToggle = (supplierId: string) => {
    setFormData(prev => ({
      ...prev,
      assigned_suppliers: prev.assigned_suppliers.includes(supplierId)
        ? prev.assigned_suppliers.filter(id => id !== supplierId)
        : [...prev.assigned_suppliers, supplierId]
    }));
  };

  const handleDependencyToggle = (stageId: string) => {
    setFormData(prev => ({
      ...prev,
      dependencies: prev.dependencies.includes(stageId)
        ? prev.dependencies.filter(id => id !== stageId)
        : [...prev.dependencies, stageId]
    }));
  };

  const removeSupplier = (supplierId: string) => {
    setFormData(prev => ({
      ...prev,
      assigned_suppliers: prev.assigned_suppliers.filter(id => id !== supplierId)
    }));
  };

  const removeDependency = (stageId: string) => {
    setFormData(prev => ({
      ...prev,
      dependencies: prev.dependencies.filter(id => id !== stageId)
    }));
  };

  // Get selected supplier names for display
  const selectedSupplierNames = useMemo(() => {
    if (!suppliers) return [];
    return formData.assigned_suppliers
      .map(id => suppliers.find(s => s.id === id)?.name)
      .filter(Boolean) as string[];
  }, [suppliers, formData.assigned_suppliers]);

  // Get selected dependency names for display
  const selectedDependencyNames = useMemo(() => {
    if (!stages) return [];
    return formData.dependencies
      .map(id => stages.find(s => s.id === id)?.name)
      .filter(Boolean) as string[];
  }, [stages, formData.dependencies]);

  const stats = useMemo(() => {
    if (!stages) return { completed: 0, inProgress: 0, total: 0 };
    return {
      completed: stages.filter(s => s.status === 'completed').length,
      inProgress: stages.filter(s => s.status === 'in-progress').length,
      total: stages.length,
    };
  }, [stages]);

  if (!currentProject) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
            {t('projects.noProjects')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('stages.title')}</Text>
          <Text style={[styles.subtitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{stats.completed} of {stats.total} {t('dashboard.complete')}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.neutral[400]} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Overview */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Overall Progress</Text>
            <Text style={styles.progressPercent}>
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: stats.total > 0 ? `${(stats.completed / stats.total) * 100}%` : '0%' },
              ]}
            />
          </View>
        </View>

        {/* Stages Timeline */}
        {stages && stages.length > 0 ? (
          <View style={styles.timeline}>
            {stages.map((stage, index) => {
              // Check if stage is overdue
              const endDate = stage.planned_end_date ? parseISO(stage.planned_end_date) : null;
              const startDate = stage.planned_start_date ? parseISO(stage.planned_start_date) : null;
              const isOverdueEnd = endDate && isPast(endDate) && !isToday(endDate) && stage.status !== 'completed';
              const isOverdueStart = startDate && isPast(startDate) && !isToday(startDate) && stage.status === 'not-started';
              const isOverdue = isOverdueEnd || isOverdueStart;

              return (
              <TouchableOpacity key={stage.id} style={styles.stageRow} activeOpacity={0.7} onPress={() => router.push(`/(tabs)/stages/${stage.id}`)}>
                {/* Timeline indicator */}
                <View style={styles.timelineColumn}>
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: isDark ? colors.neutral[600] : colors.neutral[200],
                        borderColor: isDark ? colors.neutral[500] : colors.neutral[300]
                      },
                      stage.status === 'completed' && {
                        backgroundColor: themeColors.success[500],
                        borderColor: themeColors.success[500],
                      },
                      stage.status === 'in-progress' && !isOverdue && {
                        backgroundColor: isDark ? colors.neutral[800] : '#fff',
                        borderColor: themeColors.primary[500],
                        borderWidth: 3,
                      },
                      isOverdue && {
                        backgroundColor: themeColors.danger[500],
                        borderColor: themeColors.danger[500],
                      },
                    ]}
                  >
                    {stage.status === 'completed' && <Check size={12} color="#fff" strokeWidth={3} />}
                    {stage.status === 'in-progress' && !isOverdue && (
                      <View style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: themeColors.primary[500]
                      }} />
                    )}
                    {isOverdue && <AlertCircle size={12} color="#fff" strokeWidth={3} />}
                  </View>
                  {index < stages.length - 1 && (
                    <View
                      style={[
                        styles.line,
                        { backgroundColor: isDark ? colors.neutral[600] : colors.neutral[200] },
                        stage.status === 'completed' && { backgroundColor: themeColors.success[500] },
                      ]}
                    />
                  )}
                </View>

                {/* Stage content */}
                <View style={styles.stageContent}>
                  <View style={[
                    styles.stageCard,
                    { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] },
                    isOverdue && { borderColor: themeColors.danger[500], borderWidth: 1.5 }
                  ]}>
                    <View style={styles.stageInfo}>
                      <Text style={[styles.stageNumber, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>Stage {index + 1}</Text>
                      <Text style={[styles.stageName, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{stage.name}</Text>
                      {/* Date display */}
                      {(stage.planned_start_date || stage.planned_end_date) && (
                        <View style={styles.stageDateRow}>
                          {isOverdue ? (
                            <AlertCircle size={12} color={isDark ? themeColors.danger[400] : themeColors.danger[500]} />
                          ) : (
                            <Calendar size={12} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
                          )}
                          <Text style={[
                            styles.stageDateText,
                            { color: isOverdue ? (isDark ? themeColors.danger[400] : themeColors.danger[500]) : isDark ? colors.neutral[400] : colors.neutral[500] }
                          ]}>
                            {isOverdue
                              ? isOverdueEnd
                                ? `${t('stages.overdueSince')} ${format(endDate!, 'MMM d')}`
                                : `${t('stages.shouldHaveStarted')} ${format(startDate!, 'MMM d')}`
                              : stage.planned_start_date && stage.planned_end_date
                              ? `${format(new Date(stage.planned_start_date), 'MMM d')} - ${format(new Date(stage.planned_end_date), 'MMM d')}`
                              : stage.planned_start_date
                              ? `${t('stages.starts')} ${format(new Date(stage.planned_start_date), 'MMM d')}`
                              : `${t('stages.due')} ${format(new Date(stage.planned_end_date!), 'MMM d')}`}
                          </Text>
                        </View>
                      )}
                      {/* Status badge with color */}
                      <View style={[
                        styles.statusBadge,
                        {
                          backgroundColor: isOverdue
                            ? isDark ? 'rgba(248, 113, 113, 0.2)' : 'rgba(239, 68, 68, 0.1)'
                            : stage.status === 'completed'
                            ? isDark ? 'rgba(52, 211, 153, 0.2)' : 'rgba(16, 185, 129, 0.1)'
                            : stage.status === 'in-progress'
                            ? isDark ? 'rgba(96, 165, 250, 0.2)' : 'rgba(37, 99, 235, 0.1)'
                            : isDark ? colors.neutral[700] : colors.neutral[100]
                        }
                      ]}>
                        <Text style={[
                          styles.statusBadgeText,
                          {
                            color: isOverdue
                              ? isDark ? themeColors.danger[400] : themeColors.danger[500]
                              : stage.status === 'completed'
                              ? isDark ? themeColors.success[400] : themeColors.success[500]
                              : stage.status === 'in-progress'
                              ? isDark ? themeColors.primary[400] : themeColors.primary[500]
                              : isDark ? colors.neutral[400] : colors.neutral[500]
                          }
                        ]}>
                          {isOverdue
                            ? t('stages.runningLate')
                            : stage.status === 'completed'
                            ? t('stages.completed')
                            : stage.status === 'in-progress'
                            ? t('stages.inProgress')
                            : t('stages.notStarted')}
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={20} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
                  </View>
                </View>
              </TouchableOpacity>
            );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
              <Layers size={28} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
            </View>
            <Text style={[styles.emptyStateTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('stages.noStages')}</Text>
            <Text style={[styles.emptyStateText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
              {t('stages.noStagesDesc')}
            </Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Add Stage Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => { resetForm(); setShowAddModal(false); }}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: isDark ? colors.neutral[900] : '#fff' }]}>
          {/* Form View */}
          {modalView === 'form' && (
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => { resetForm(); setShowAddModal(false); }}>
                  <X size={24} color={colors.neutral[600]} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>New Stage</Text>
                <TouchableOpacity
                  onPress={handleCreateStage}
                  disabled={!formData.name.trim() || createStage.isPending}
                >
                  <Text
                    style={[
                      styles.modalSaveText,
                      (!formData.name.trim() || createStage.isPending) && styles.modalSaveTextDisabled,
                    ]}
                  >
                    {createStage.isPending ? 'Saving...' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Basic Information Section */}
            <View style={styles.formSection}>
              <Text style={styles.sectionHeader}>Basic Information</Text>

              <Text style={styles.inputLabel}>Stage Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Foundation Work"
                placeholderTextColor={colors.neutral[400]}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe what this stage involves..."
                placeholderTextColor={colors.neutral[400]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.segmentedControl}>
                {STAGE_CATEGORIES.slice(0, 4).map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.segmentItem,
                      formData.category === cat.value && styles.segmentItemActive,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        formData.category === cat.value && styles.segmentTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.segmentedControl}>
                {STAGE_CATEGORIES.slice(4).map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.segmentItem,
                      formData.category === cat.value && styles.segmentItemActive,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        formData.category === cat.value && styles.segmentTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { marginTop: 8 }]}>Status</Text>
              <View style={styles.segmentedControl}>
                {STATUS_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.segmentItem,
                      formData.status === option.value && styles.segmentItemActive,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, status: option.value }))}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        formData.status === option.value && styles.segmentTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Timeline Section */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeaderRow}>
                <Calendar size={16} color={colors.neutral[500]} />
                <Text style={styles.sectionHeaderText}>Timeline</Text>
              </View>

              <View style={styles.dateRow}>
                <View style={styles.dateField}>
                  <Text style={styles.inputLabel}>Start Date</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => openDatePicker('planned_start_date')}
                  >
                    <Text style={formData.planned_start_date ? styles.dateText : styles.datePlaceholder}>
                      {formData.planned_start_date
                        ? format(new Date(formData.planned_start_date), 'MMM d, yyyy')
                        : 'Select'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.dateField}>
                  <Text style={styles.inputLabel}>End Date</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => openDatePicker('planned_end_date')}
                  >
                    <Text style={formData.planned_end_date ? styles.dateText : styles.datePlaceholder}>
                      {formData.planned_end_date
                        ? format(new Date(formData.planned_end_date), 'MMM d, yyyy')
                        : 'Select'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={formData[activeDateField] ? new Date(formData[activeDateField]) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                />
              )}
            </View>

            {/* Budget Section */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeaderRow}>
                <DollarSign size={16} color={colors.neutral[500]} />
                <Text style={styles.sectionHeaderText}>Budget</Text>
              </View>

              <Text style={styles.inputLabel}>Estimated Cost</Text>
              <TextInput
                style={styles.textInput}
                placeholder="0.00"
                placeholderTextColor={colors.neutral[400]}
                value={formData.estimated_cost}
                onChangeText={(text) => setFormData(prev => ({ ...prev, estimated_cost: text }))}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Suppliers Section */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeaderRow}>
                <Users size={16} color={colors.neutral[500]} />
                <Text style={styles.sectionHeaderText}>Assigned Suppliers</Text>
              </View>

              <TouchableOpacity
                style={styles.selectorButton}
                onPress={() => setModalView('suppliers')}
              >
                <Text style={selectedSupplierNames.length > 0 ? styles.selectorText : styles.selectorPlaceholder}>
                  {selectedSupplierNames.length > 0
                    ? `${selectedSupplierNames.length} supplier${selectedSupplierNames.length > 1 ? 's' : ''} selected`
                    : 'Select suppliers'}
                </Text>
                <ChevronRight size={18} color={colors.neutral[400]} />
              </TouchableOpacity>

              {/* Selected suppliers as chips */}
              {selectedSupplierNames.length > 0 && (
                <View style={styles.chipsContainer}>
                  {formData.assigned_suppliers.map((supplierId) => {
                    const supplier = suppliers?.find(s => s.id === supplierId);
                    if (!supplier) return null;
                    return (
                      <View key={supplierId} style={styles.chip}>
                        <Text style={styles.chipText} numberOfLines={1}>{supplier.name}</Text>
                        <TouchableOpacity
                          onPress={() => removeSupplier(supplierId)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <X size={14} color={colors.neutral[500]} />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Dependencies Section */}
            {stages && stages.length > 0 && (
              <View style={styles.formSection}>
                <View style={styles.sectionHeaderRow}>
                  <AlertCircle size={16} color={colors.neutral[500]} />
                  <Text style={styles.sectionHeaderText}>Dependencies</Text>
                </View>
                <Text style={styles.sectionSubtext}>
                  Select stages that must be completed before this one
                </Text>

                <TouchableOpacity
                  style={styles.selectorButton}
                  onPress={() => setModalView('dependencies')}
                >
                  <Text style={selectedDependencyNames.length > 0 ? styles.selectorText : styles.selectorPlaceholder}>
                    {selectedDependencyNames.length > 0
                      ? `${selectedDependencyNames.length} dependenc${selectedDependencyNames.length > 1 ? 'ies' : 'y'} selected`
                      : 'Select dependencies'}
                  </Text>
                  <ChevronRight size={18} color={colors.neutral[400]} />
                </TouchableOpacity>

                {/* Selected dependencies as chips */}
                {selectedDependencyNames.length > 0 && (
                  <View style={styles.chipsContainer}>
                    {formData.dependencies.map((stageId) => {
                      const stage = stages?.find(s => s.id === stageId);
                      if (!stage) return null;
                      return (
                        <View key={stageId} style={styles.chip}>
                          <Text style={styles.chipText} numberOfLines={1}>{stage.name}</Text>
                          <TouchableOpacity
                            onPress={() => removeDependency(stageId)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <X size={14} color={colors.neutral[500]} />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

                <View style={{ height: 40 }} />
              </ScrollView>
            </KeyboardAvoidingView>
          )}

          {/* Suppliers Selection View */}
          {modalView === 'suppliers' && (
            <View style={styles.selectionContainer}>
              <View style={styles.selectionHeader}>
                <TouchableOpacity onPress={() => setModalView('form')} style={styles.backButton}>
                  <ChevronLeft size={24} color={colors.neutral[600]} />
                </TouchableOpacity>
                <Text style={styles.selectionTitle}>Select Suppliers</Text>
                <View style={styles.headerSpacer} />
              </View>
              {suppliers && suppliers.length > 0 ? (
                <FlatList
                  data={suppliers}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.selectionList}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.selectionItem}
                      onPress={() => handleSupplierToggle(item.id)}
                    >
                      <View style={styles.selectionItemContent}>
                        <Text style={styles.selectionItemText}>{item.name}</Text>
                        {item.company && (
                          <Text style={styles.selectionItemSubtext}>{item.company}</Text>
                        )}
                      </View>
                      <View style={[
                        styles.checkbox,
                        formData.assigned_suppliers.includes(item.id) && styles.checkboxChecked
                      ]}>
                        {formData.assigned_suppliers.includes(item.id) && (
                          <Check size={14} color="#fff" strokeWidth={3} />
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <View style={styles.selectionEmpty}>
                  <Text style={styles.selectionEmptyText}>No suppliers added to this project</Text>
                </View>
              )}
            </View>
          )}

          {/* Dependencies Selection View */}
          {modalView === 'dependencies' && (
            <View style={styles.selectionContainer}>
              <View style={styles.selectionHeader}>
                <TouchableOpacity onPress={() => setModalView('form')} style={styles.backButton}>
                  <ChevronLeft size={24} color={colors.neutral[600]} />
                </TouchableOpacity>
                <Text style={styles.selectionTitle}>Select Dependencies</Text>
                <View style={styles.headerSpacer} />
              </View>
              {stages && stages.length > 0 ? (
                <FlatList
                  data={stages}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.selectionList}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.selectionItem}
                      onPress={() => handleDependencyToggle(item.id)}
                    >
                      <View style={styles.selectionItemContent}>
                        <Text style={styles.selectionItemText}>{item.name}</Text>
                        <Text style={styles.selectionItemSubtext}>
                          {item.status === 'completed' ? 'Completed' : item.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                        </Text>
                      </View>
                      <View style={[
                        styles.checkbox,
                        formData.dependencies.includes(item.id) && styles.checkboxChecked
                      ]}>
                        {formData.dependencies.includes(item.id) && (
                          <Check size={14} color="#fff" strokeWidth={3} />
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <View style={styles.selectionEmpty}>
                  <Text style={styles.selectionEmptyText}>No other stages to depend on</Text>
                </View>
              )}
            </View>
          )}
        </SafeAreaView>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: themeColors.neutral[900],
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: themeColors.neutral[500],
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: themeColors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    color: themeColors.neutral[500],
  },
  progressCard: {
    backgroundColor: themeColors.primary[600],
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  timeline: {
    paddingLeft: 4,
  },
  stageRow: {
    flexDirection: 'row',
  },
  timelineColumn: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: themeColors.neutral[200],
    borderWidth: 2,
    borderColor: themeColors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: themeColors.neutral[200],
    marginVertical: 4,
  },
  stageContent: {
    flex: 1,
    paddingLeft: 16,
    paddingBottom: 20,
  },
  stageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: themeColors.neutral[200],
  },
  stageInfo: {
    flex: 1,
  },
  stageNumber: {
    fontSize: 12,
    color: themeColors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  stageName: {
    fontSize: 16,
    fontWeight: '600',
    color: themeColors.neutral[900],
    marginBottom: 4,
  },
  stageDescription: {
    fontSize: 14,
    color: themeColors.neutral[500],
    lineHeight: 20,
    marginBottom: 8,
  },
  stageDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    marginBottom: 8,
  },
  stageDateText: {
    fontSize: 13,
    color: themeColors.neutral[500],
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: themeColors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: themeColors.neutral[900],
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: themeColors.neutral[500],
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.neutral[100],
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: themeColors.neutral[900],
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: themeColors.primary[600],
  },
  modalSaveTextDisabled: {
    color: themeColors.neutral[300],
  },
  modalContent: {
    flex: 1,
  },
  formSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.neutral[100],
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: themeColors.neutral[900],
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: themeColors.neutral[900],
  },
  sectionSubtext: {
    fontSize: 13,
    color: themeColors.neutral[500],
    marginBottom: 12,
    marginTop: -8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: themeColors.neutral[500],
    marginBottom: 8,
  },
  textInput: {
    fontSize: 16,
    color: themeColors.neutral[900],
    backgroundColor: themeColors.neutral[50],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: themeColors.neutral[200],
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: themeColors.neutral[100],
    borderRadius: 10,
    padding: 3,
    marginBottom: 8,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentItemActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
    color: themeColors.neutral[500],
  },
  segmentTextActive: {
    color: themeColors.neutral[900],
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateField: {
    flex: 1,
  },
  dateButton: {
    backgroundColor: themeColors.neutral[50],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: themeColors.neutral[200],
  },
  dateText: {
    fontSize: 16,
    color: themeColors.neutral[900],
  },
  datePlaceholder: {
    fontSize: 16,
    color: themeColors.neutral[400],
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: themeColors.neutral[50],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: themeColors.neutral[200],
    marginBottom: 12,
  },
  selectorText: {
    fontSize: 16,
    color: themeColors.neutral[900],
  },
  selectorPlaceholder: {
    fontSize: 16,
    color: themeColors.neutral[400],
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.neutral[100],
    borderRadius: 16,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
    gap: 6,
    maxWidth: '48%',
  },
  chipText: {
    fontSize: 14,
    color: themeColors.neutral[700],
    fontWeight: '500',
    flexShrink: 1,
  },
  // Selection view styles
  selectionContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.neutral[100],
  },
  backButton: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerSpacer: {
    width: 40,
  },
  selectionTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: themeColors.neutral[900],
    textAlign: 'center',
  },
  selectionList: {
    paddingVertical: 8,
  },
  selectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.neutral[100],
  },
  selectionItemContent: {
    flex: 1,
    marginRight: 12,
  },
  selectionItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: themeColors.neutral[900],
  },
  selectionItemSubtext: {
    fontSize: 14,
    color: themeColors.neutral[500],
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: themeColors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: themeColors.primary[600],
    borderColor: themeColors.primary[600],
  },
  selectionEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  selectionEmptyText: {
    fontSize: 15,
    color: themeColors.neutral[500],
    textAlign: 'center',
  },
});
