import { useState } from 'react';
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
  User,
  Layers,
  Tag,
  Trash2,
  Circle,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react-native';
import { useTodos, useUpdateTodo, useDeleteTodo } from '../../../hooks/useTodos';
import { useStages } from '../../../hooks/useStages';
import { useTeamMembers } from '../../../hooks/useTeamMembers';
import { useProject } from '../../../stores/ProjectContext';
import { useTheme } from '../../../stores/ThemeContext';
import { useLanguage } from '../../../stores/LanguageContext';
import { colors as themeColors } from '../../../config/theme';
import { TodoStatus, TodoPriority } from '../../../types/database';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentProject } = useProject();
  const { isDark, colors } = useTheme();
  const { t, formatDate } = useLanguage();

  // Define options inside component to access translations
  const STATUS_OPTIONS: { label: string; value: TodoStatus; icon: any }[] = [
    { label: t('todos.todo'), value: 'todo', icon: Circle },
    { label: t('todos.inProgress'), value: 'in-progress', icon: Clock },
    { label: t('todos.done'), value: 'completed', icon: CheckCircle2 },
    { label: t('todos.cancelled'), value: 'cancelled', icon: XCircle },
  ];

  const PRIORITY_OPTIONS: { label: string; value: TodoPriority; color: string }[] = [
    { label: t('todos.priorities.low'), value: 'low', color: themeColors.neutral[400] },
    { label: t('todos.priorities.medium'), value: 'medium', color: themeColors.primary[500] },
    { label: t('todos.priorities.high'), value: 'high', color: themeColors.accent[500] },
    { label: t('todos.priorities.urgent'), value: 'urgent', color: themeColors.danger[500] },
  ];

  const { data: todos } = useTodos(currentProject?.id);
  const { data: stages } = useStages(currentProject?.id);
  const { data: teamMembers } = useTeamMembers();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const task = todos?.find(t => t.id === id);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task?.title || '');
  const [editedDescription, setEditedDescription] = useState(task?.description || '');

  if (!task) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={isDark ? colors.neutral[50] : colors.neutral[900]} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('todos.task')}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('todos.taskNotFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const assignee = teamMembers?.find(m => m.user_id === task.assigned_to);
  const linkedStages = stages?.filter(s => task.stage_ids?.includes(s.id)) || [];

  const handleStatusChange = async (newStatus: TodoStatus) => {
    try {
      await updateTodo.mutateAsync({
        id: task.id,
        updates: { status: newStatus },
      });
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.failedUpdateStatus'));
    }
  };

  const handlePriorityChange = async (newPriority: TodoPriority) => {
    try {
      await updateTodo.mutateAsync({
        id: task.id,
        updates: { priority: newPriority },
      });
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.failedUpdateTask'));
    }
  };

  const handleSave = async () => {
    try {
      await updateTodo.mutateAsync({
        id: task.id,
        updates: {
          title: editedTitle.trim(),
          description: editedDescription.trim() || null,
        },
      });
      setIsEditing(false);
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.failedUpdateTask'));
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('alerts.deleteTaskTitle'),
      t('alerts.deleteTaskMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTodo.mutateAsync(task.id);
              router.back();
            } catch (error) {
              Alert.alert(t('common.error'), t('errors.failedDeleteTask'));
            }
          },
        },
      ]
    );
  };

  const getStatusStyle = (status: TodoStatus) => {
    switch (status) {
      case 'completed':
        return { bg: colors.success[50], text: colors.success[600] };
      case 'in-progress':
        return { bg: colors.primary[50], text: colors.primary[600] };
      case 'cancelled':
        return { bg: colors.neutral[100], text: colors.neutral[500] };
      default:
        return { bg: colors.neutral[100], text: colors.neutral[600] };
    }
  };

  const getPriorityColor = (priority: TodoPriority) => {
    const option = PRIORITY_OPTIONS.find(p => p.value === priority);
    return option?.color || colors.neutral[400];
  };

  const statusStyle = getStatusStyle(task.status);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={isDark ? colors.neutral[50] : colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('todos.taskDetails')}</Text>
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
        {/* Title & Description */}
        <View style={styles.section}>
          {isEditing ? (
            <>
              <TextInput
                style={[styles.titleInput, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}
                value={editedTitle}
                onChangeText={setEditedTitle}
                placeholder={t('todos.taskTitle')}
                placeholderTextColor={colors.neutral[400]}
              />
              <TextInput
                style={[styles.descriptionInput, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}
                value={editedDescription}
                onChangeText={setEditedDescription}
                placeholder={t('todos.descriptionPlaceholder')}
                placeholderTextColor={colors.neutral[400]}
                multiline
              />
            </>
          ) : (
            <>
              <Text style={[
                styles.taskTitle,
                { color: isDark ? colors.neutral[50] : colors.neutral[900] },
                task.status === 'completed' && styles.taskTitleDone
              ]}>
                {task.title}
              </Text>
              {task.description && (
                <Text style={[styles.taskDescription, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>{task.description}</Text>
              )}
            </>
          )}
          <View style={styles.badges}>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {task.status === 'in-progress' ? t('todos.inProgress') :
                 task.status === 'completed' ? t('todos.done') :
                 task.status === 'cancelled' ? t('todos.cancelled') : t('todos.todo')}
              </Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
              <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
              <Text style={[styles.priorityText, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>{task.priority}</Text>
            </View>
          </View>
        </View>

        {/* Status Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('todos.status')}</Text>
          <View style={styles.statusOptions}>
            {STATUS_OPTIONS.slice(0, 3).map((option) => {
              const Icon = option.icon;
              const isActive = task.status === option.value;
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
                    size={16}
                    color={isActive ? colors.primary[600] : colors.neutral[400]}
                  />
                  <Text style={[
                    styles.statusOptionText,
                    { color: isDark ? colors.neutral[300] : colors.neutral[600] },
                    isActive && styles.statusOptionTextActive
                  ]} numberOfLines={1}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Priority Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('todos.priority')}</Text>
          <View style={styles.priorityOptions}>
            {PRIORITY_OPTIONS.map((option) => {
              const isActive = task.priority === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.priorityOption,
                    { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] },
                    isActive && styles.priorityOptionActive
                  ]}
                  onPress={() => handlePriorityChange(option.value)}
                >
                  <View style={[styles.priorityIndicator, { backgroundColor: option.color }]} />
                  <Text style={[
                    styles.priorityOptionText,
                    { color: isDark ? colors.neutral[300] : colors.neutral[600] },
                    isActive && styles.priorityOptionTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Due Date */}
        {task.due_date && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('todos.dueDate')}</Text>
            <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
              <View style={styles.cardRow}>
                <Calendar size={18} color={colors.neutral[400]} />
                <Text style={[styles.cardValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
                  {formatDate(task.due_date, 'long')}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Assignee */}
        {assignee && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('todos.assignedTo')}</Text>
            <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
              <View style={styles.cardRow}>
                <User size={18} color={colors.neutral[400]} />
                <View style={styles.cardRowContent}>
                  <Text style={[styles.cardValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{assignee.name}</Text>
                  <Text style={[styles.cardLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{assignee.email}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Linked Stages */}
        {linkedStages.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('todos.linkedStages')}</Text>
            <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
              {linkedStages.map((stage, index) => (
                <View key={stage.id}>
                  {index > 0 && <View style={[styles.cardDivider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} />}
                  <TouchableOpacity
                    style={styles.cardRow}
                    onPress={() => router.push(`/(tabs)/stages/${stage.id}`)}
                  >
                    <Layers size={18} color={colors.neutral[400]} />
                    <Text style={[styles.cardValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{stage.name}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('todos.tags')}</Text>
            <View style={styles.tagsContainer}>
              {task.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Tag size={12} color={colors.primary[600]} />
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Delete Button */}
        <View style={styles.section}>
          <TouchableOpacity style={[styles.deleteButton, { backgroundColor: isDark ? colors.danger[900] : colors.danger[50], borderColor: isDark ? colors.danger[800] : colors.danger[200] }]} onPress={handleDelete}>
            <Trash2 size={18} color={colors.danger[600]} />
            <Text style={styles.deleteButtonText}>{t('todos.deleteTask')}</Text>
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
  taskTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: themeColors.neutral[900],
    marginBottom: 8,
    lineHeight: 30,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: themeColors.neutral[400],
  },
  taskDescription: {
    fontSize: 16,
    color: themeColors.neutral[600],
    lineHeight: 24,
    marginBottom: 12,
  },
  titleInput: {
    fontSize: 22,
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
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: themeColors.neutral[100],
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
    color: themeColors.neutral[600],
    textTransform: 'capitalize',
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
    gap: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: themeColors.neutral[200],
  },
  statusOptionActive: {
    backgroundColor: themeColors.primary[50],
    borderColor: themeColors.primary[300],
  },
  statusOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: themeColors.neutral[600],
  },
  statusOptionTextActive: {
    color: themeColors.primary[700],
  },
  priorityOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: themeColors.neutral[200],
  },
  priorityOptionActive: {
    backgroundColor: themeColors.neutral[50],
    borderColor: themeColors.neutral[400],
  },
  priorityOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: themeColors.neutral[600],
  },
  priorityOptionTextActive: {
    color: themeColors.neutral[900],
    fontWeight: '600',
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: themeColors.primary[50],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: themeColors.primary[200],
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    color: themeColors.primary[700],
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
});
