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
import { formatCurrency } from '../../../utils/formatters';
import { format } from 'date-fns';

const CATEGORY_LABELS: Record<string, string> = {
  'site-work': 'Site Work',
  'foundation': 'Foundation',
  'framing': 'Framing',
  'plumbing': 'Plumbing',
  'electrical': 'Electrical',
  'hvac': 'HVAC',
  'insulation': 'Insulation',
  'drywall': 'Drywall',
  'interior': 'Interior',
  'exterior': 'Exterior',
  'landscaping': 'Landscaping',
  'other': 'Other',
};

const STATUS_OPTIONS: { label: string; value: StageStatus; icon: any }[] = [
  { label: 'Not Started', value: 'not-started', icon: Circle },
  { label: 'In Progress', value: 'in-progress', icon: Clock },
  { label: 'Completed', value: 'completed', icon: Check },
];

export default function StageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentProject } = useProject();
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
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
          <Text style={[styles.headerTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>Stage</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>Stage not found</Text>
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
      Alert.alert('Error', 'Failed to update status');
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
      Alert.alert('Error', 'Failed to update stage');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Stage',
      'Are you sure you want to delete this stage? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStage.mutateAsync(stage.id);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete stage');
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
        <Text style={[styles.headerTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>Stage Details</Text>
        {isEditing ? (
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={styles.editButton}>Edit</Text>
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
                placeholder="Stage name"
                placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
              />
              <TextInput
                style={[styles.descriptionInput, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}
                value={editedDescription}
                onChangeText={setEditedDescription}
                placeholder="Add description..."
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
                {stage.status === 'in-progress' ? 'In Progress' :
                 stage.status === 'completed' ? 'Completed' : 'Not Started'}
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
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>Status</Text>
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
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>Planned Timeline</Text>
            <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
              <View style={styles.cardRow}>
                <Calendar size={18} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
                <View style={styles.cardRowContent}>
                  <Text style={[styles.cardLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>Start Date</Text>
                  <Text style={[styles.cardValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
                    {stage.planned_start_date
                      ? format(new Date(stage.planned_start_date), 'MMM d, yyyy')
                      : 'Not set'}
                  </Text>
                </View>
              </View>
              <View style={[styles.cardDivider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
              <View style={styles.cardRow}>
                <Calendar size={18} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
                <View style={styles.cardRowContent}>
                  <Text style={[styles.cardLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>End Date</Text>
                  <Text style={[styles.cardValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
                    {stage.planned_end_date
                      ? format(new Date(stage.planned_end_date), 'MMM d, yyyy')
                      : 'Not set'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Actual Timeline */}
        {(stage.actual_start_date || stage.actual_end_date) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>Actual Timeline</Text>
            <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
              <View style={styles.cardRow}>
                <Calendar size={18} color={colors.success[500]} />
                <View style={styles.cardRowContent}>
                  <Text style={[styles.cardLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>Started</Text>
                  <Text style={[styles.cardValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
                    {stage.actual_start_date
                      ? format(new Date(stage.actual_start_date), 'MMM d, yyyy')
                      : 'Not started'}
                  </Text>
                </View>
              </View>
              {stage.actual_end_date && (
                <>
                  <View style={[styles.cardDivider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />
                  <View style={styles.cardRow}>
                    <Calendar size={18} color={colors.success[500]} />
                    <View style={styles.cardRowContent}>
                      <Text style={[styles.cardLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>Completed</Text>
                      <Text style={[styles.cardValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
                        {format(new Date(stage.actual_end_date), 'MMM d, yyyy')}
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
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>Budget</Text>
            <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
              {stage.estimated_cost && (
                <View style={styles.cardRow}>
                  <DollarSign size={18} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
                  <View style={styles.cardRowContent}>
                    <Text style={[styles.cardLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>Estimated Cost</Text>
                    <Text style={[styles.cardValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
                      {formatCurrency(stage.estimated_cost)}
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
                      <Text style={[styles.cardLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>Actual Cost</Text>
                      <Text style={[styles.cardValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
                        {formatCurrency(actualCost)}
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
                      <Text style={[styles.cardLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>Variance</Text>
                      <Text style={[
                        styles.cardValue,
                        { color: costVariance >= 0 ? colors.success[600] : colors.danger[600] }
                      ]}>
                        {costVariance >= 0 ? '-' : '+'}{formatCurrency(Math.abs(costVariance))}
                        {costVariance >= 0 ? ' under' : ' over'} budget
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
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>Assigned Suppliers</Text>
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
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>Related Tasks</Text>
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
                        {task.status === 'completed' ? 'Completed' :
                         task.status === 'in-progress' ? 'In Progress' : 'Pending'}
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
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>Notes</Text>
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
            <Text style={[styles.deleteButtonText, { color: isDark ? colors.danger[400] : colors.danger[600] }]}>Delete Stage</Text>
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
