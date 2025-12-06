import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
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
  FileText,
} from 'lucide-react-native';
import { useStages, useUpdateStage, useDeleteStage } from '../../../hooks/useStages';
import { useSuppliers } from '../../../hooks/useSuppliers';
import { useTodos } from '../../../hooks/useTodos';
import { useExpenses } from '../../../hooks/useExpenses';
import { useProject } from '../../../stores/ProjectContext';
import { useTheme } from '../../../stores/ThemeContext';
import { useLanguage } from '../../../stores/LanguageContext';
import { colors as themeColors } from '../../../config/theme';
import { StageStatus } from '../../../types/database';
import { useCurrency } from '../../../stores/CurrencyContext';

export default function StageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentProject } = useProject();
  const { isDark, colors } = useTheme();
  const { t, formatDate } = useLanguage();
  const { formatAmount } = useCurrency();

  // Define category labels inside component to access translations
  const CATEGORY_LABELS: Record<string, string> = {
    'site-work': t('stages.categories.siteWork'),
    'foundation': t('stages.categories.structure'),
    'framing': t('stages.categories.structure'),
    'plumbing': t('stages.categories.utilities'),
    'electrical': t('stages.categories.utilities'),
    'hvac': t('stages.categories.utilities'),
    'insulation': t('stages.categories.interior'),
    'drywall': t('stages.categories.interior'),
    'interior': t('stages.categories.interior'),
    'exterior': t('stages.categories.exterior'),
    'landscaping': t('stages.categories.exterior'),
    'utilities': t('stages.categories.utilities'),
    'structure': t('stages.categories.structure'),
    'finishing': t('stages.categories.finishing'),
    'other': t('stages.categories.other'),
  };

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
  const [editedName, setEditedName] = useState(stage?.name || '');
  const [editedDescription, setEditedDescription] = useState(stage?.description || '');

  // Get related tasks for this stage
  const relatedTasks = useMemo(() => {
    if (!todos || !stage) return [];
    return todos.filter(t => t.stage_id === stage.id);
  }, [todos, stage]);

  // Get expenses for this stage to calculate actual cost
  const stageExpenses = useMemo(() => {
    if (!expenses || !stage) return [];
    return expenses.filter(e => e.stage_id === stage.id);
  }, [expenses, stage]);

  const actualCost = useMemo(() => {
    return stageExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [stageExpenses]);

  const costVariance = useMemo(() => {
    if (!stage?.estimated_cost) return null;
    return stage.estimated_cost - actualCost;
  }, [stage, actualCost]);

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

  const assignedSuppliers = suppliers?.filter(s =>
    stage.assigned_suppliers?.includes(s.id)
  ) || [];

  const handleStatusChange = async (newStatus: StageStatus) => {
    try {
      await updateStage.mutateAsync({
        id: stage.id,
        updates: { status: newStatus },
      });
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.failedUpdateStatus'));
    }
  };

  const handleSave = async () => {
    try {
      await updateStage.mutateAsync({
        id: stage.id,
        updates: {
          name: editedName.trim(),
          description: editedDescription.trim() || null,
        },
      });
      setIsEditing(false);
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.failedUpdateStage'));
    }
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
    switch (status) {
      case 'completed':
        return { bg: colors.success[50], text: colors.success[600] };
      case 'in-progress':
        return { bg: colors.primary[50], text: colors.primary[600] };
      default:
        return { bg: colors.neutral[100], text: colors.neutral[600] };
    }
  };

  const statusStyle = getStatusStyle(stage.status);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={isDark ? colors.neutral[50] : colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('forms.stageDetails')}</Text>
        {isEditing ? (
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>{t('common.save')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={styles.editButton}>{t('common.edit')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Name & Description */}
        <View style={styles.section}>
          {isEditing ? (
            <>
              <TextInput
                style={[styles.nameInput, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}
                value={editedName}
                onChangeText={setEditedName}
                placeholder={t('stages.stageName')}
                placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
              />
              <TextInput
                style={[styles.descriptionInput, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}
                value={editedDescription}
                onChangeText={setEditedDescription}
                placeholder={t('stages.descriptionPlaceholder')}
                placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                multiline
              />
            </>
          ) : (
            <>
              <Text style={[styles.stageName, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{stage.name}</Text>
              {stage.description && (
                <Text style={[styles.stageDescription, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>{stage.description}</Text>
              )}
            </>
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
                  {CATEGORY_LABELS[stage.category] || stage.category}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Status Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('stages.status')}</Text>
          <View style={styles.statusOptions}>
            {STATUS_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = stage.status === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.statusOption,
                    { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] },
                    isActive && styles.statusOptionActive
                  ]}
                  onPress={() => handleStatusChange(option.value)}
                >
                  <Icon
                    size={18}
                    color={isActive ? colors.primary[600] : (isDark ? colors.neutral[500] : colors.neutral[400])}
                  />
                  <Text style={[
                    styles.statusOptionText,
                    { color: isDark ? colors.neutral[300] : colors.neutral[600] },
                    isActive && styles.statusOptionTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
                    {stage.planned_start_date
                      ? formatDate(stage.planned_start_date, 'long')
                      : t('forms.notSet')}
                  </Text>
                </View>
              </View>
              <View style={[styles.cardDivider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
              <View style={styles.cardRow}>
                <Calendar size={18} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
                <View style={styles.cardRowContent}>
                  <Text style={[styles.cardLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('stages.endDate')}</Text>
                  <Text style={[styles.cardValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
                    {stage.planned_end_date
                      ? formatDate(stage.planned_end_date, 'long')
                      : t('forms.notSet')}
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
                    {stage.actual_start_date
                      ? formatDate(stage.actual_start_date, 'long')
                      : t('forms.notStartedYet')}
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
                      <Text style={[
                        styles.cardValue,
                        { color: costVariance >= 0 ? colors.success[600] : colors.danger[600] }
                      ]}>
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
                <TouchableOpacity
                  key={task.id}
                  onPress={() => router.push(`/(tabs)/todos/${task.id}`)}
                >
                  {index > 0 && <View style={[styles.cardDivider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />}
                  <View style={styles.cardRow}>
                    {task.status === 'completed' ? (
                      <CheckCircle2 size={18} color={colors.success[500]} />
                    ) : (
                      <ListTodo size={18} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
                    )}
                    <View style={styles.cardRowContent}>
                      <Text style={[
                        styles.cardValue,
                        { color: isDark ? colors.neutral[50] : colors.neutral[900] },
                        task.status === 'completed' && styles.taskCompleted
                      ]}>
                        {task.title}
                      </Text>
                      <Text style={[styles.cardLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                        {task.status === 'completed' ? t('stages.completed') :
                         task.status === 'in-progress' ? t('stages.inProgress') : t('forms.pending')}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Notes */}
        {stage.notes && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.notes')}</Text>
            <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
              <View style={styles.cardRow}>
                <FileText size={18} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
                <View style={styles.cardRowContent}>
                  <Text style={[styles.notesText, { color: isDark ? colors.neutral[200] : colors.neutral[700] }]}>{stage.notes}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Delete Button */}
        <View style={styles.section}>
          <TouchableOpacity style={[styles.deleteButton, { backgroundColor: isDark ? colors.danger[900] : colors.danger[50], borderColor: isDark ? colors.danger[700] : colors.danger[200] }]} onPress={handleDelete}>
            <Trash2 size={18} color={isDark ? colors.danger[400] : colors.danger[600]} />
            <Text style={[styles.deleteButtonText, { color: isDark ? colors.danger[400] : colors.danger[600] }]}>{t('forms.deleteStage')}</Text>
          </TouchableOpacity>
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
    fontWeight: '600',
    color: themeColors.neutral[900],
  },
  headerSpacer: {
    width: 40,
  },
  editButton: {
    fontSize: 16,
    fontWeight: '600',
    color: themeColors.primary[600],
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
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
    color: themeColors.neutral[500],
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: themeColors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  stageName: {
    fontSize: 24,
    fontWeight: '700',
    color: themeColors.neutral[900],
    marginBottom: 8,
  },
  stageDescription: {
    fontSize: 16,
    color: themeColors.neutral[600],
    lineHeight: 24,
    marginBottom: 12,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: '700',
    color: themeColors.neutral[900],
    marginBottom: 8,
    padding: 0,
  },
  descriptionInput: {
    fontSize: 16,
    color: themeColors.neutral[600],
    lineHeight: 24,
    marginBottom: 12,
    padding: 0,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: themeColors.neutral[200],
  },
  statusOptionActive: {
    backgroundColor: themeColors.primary[50],
    borderColor: themeColors.primary[300],
  },
  statusOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: themeColors.neutral[600],
  },
  statusOptionTextActive: {
    color: themeColors.primary[700],
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themeColors.neutral[200],
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
    color: themeColors.neutral[500],
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '500',
    color: themeColors.neutral[900],
  },
  cardDivider: {
    height: 1,
    backgroundColor: themeColors.neutral[100],
    marginLeft: 46,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: themeColors.danger[50],
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: themeColors.danger[200],
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: themeColors.danger[600],
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: themeColors.neutral[100],
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: themeColors.neutral[600],
  },
  taskCompleted: {
    color: themeColors.neutral[400],
    textDecorationLine: 'line-through',
  },
  notesText: {
    fontSize: 15,
    color: themeColors.neutral[700],
    lineHeight: 22,
  },
});
