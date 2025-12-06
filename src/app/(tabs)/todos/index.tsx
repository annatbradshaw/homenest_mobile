import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActionSheetIOS,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronDown, ChevronRight, ChevronLeft, ListTodo, Plus, X, Calendar, Check } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useProject } from '../../../stores/ProjectContext';
import { useTodos, useUpdateTodo, useCreateTodo } from '../../../hooks/useTodos';
import { useStages } from '../../../hooks/useStages';
import { useTeamMembers } from '../../../hooks/useTeamMembers';
import { colors as themeColors } from '../../../config/theme';
import { Todo, TodoStatus, TodoPriority } from '../../../types/database';
import { useTheme } from '../../../stores/ThemeContext';
import { useLanguage } from '../../../stores/LanguageContext';

type ModalView = 'form' | 'assignee' | 'stages';

export default function TodosScreen() {
  const { currentProject } = useProject();
  const { data: todos, isLoading, refetch } = useTodos(currentProject?.id);
  const { data: stages } = useStages(currentProject?.id);
  const { data: teamMembers } = useTeamMembers();
  const updateTodo = useUpdateTodo();
  const createTodo = useCreateTodo();
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TodoStatus | 'all'>('all');
  const { isDark, colors } = useTheme();
  const { t, formatDate } = useLanguage();

  // Define filter and option arrays inside component to access translations
  const STATUS_FILTERS: { label: string; value: TodoStatus | 'all' }[] = [
    { label: t('common.all'), value: 'all' },
    { label: t('todos.todo'), value: 'todo' },
    { label: t('todos.inProgress'), value: 'in-progress' },
    { label: t('todos.done'), value: 'completed' },
  ];

  const PRIORITY_OPTIONS: { label: string; value: TodoPriority; color: string }[] = [
    { label: t('todos.priorities.low'), value: 'low', color: themeColors.neutral[400] },
    { label: t('todos.priorities.medium'), value: 'medium', color: themeColors.primary[500] },
    { label: t('todos.priorities.high'), value: 'high', color: themeColors.accent[500] },
    { label: t('todos.priorities.urgent'), value: 'urgent', color: themeColors.danger[500] },
  ];

  const STATUS_OPTIONS: { label: string; value: TodoStatus }[] = [
    { label: t('todos.todo'), value: 'todo' },
    { label: t('todos.inProgress'), value: 'in-progress' },
    { label: t('todos.done'), value: 'completed' },
    { label: t('todos.cancelled'), value: 'cancelled' },
  ];

  // Helper function to get status label
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'todo': return t('todos.todo');
      case 'in-progress': return t('todos.inProgress');
      case 'completed': return t('todos.done');
      case 'cancelled': return t('todos.cancelled');
      default: return status;
    }
  };

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalView, setModalView] = useState<ModalView>('form');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as TodoPriority,
    status: 'todo' as TodoStatus,
    due_date: '',
    assigned_to: '',
    stage_ids: [] as string[],
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      due_date: '',
      assigned_to: '',
      stage_ids: [],
      tags: [],
    });
    setNewTag('');
    setModalView('form');
  };

  const closeModal = () => {
    resetForm();
    setShowAddModal(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleStatusChange = async (todo: Todo, newStatus: TodoStatus) => {
    try {
      await updateTodo.mutateAsync({
        id: todo.id,
        updates: { status: newStatus },
      });
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.failedUpdateTask'));
    }
  };

  const showStatusPicker = (todo: Todo) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t('common.cancel'), ...STATUS_OPTIONS.map((o) => o.label)],
          cancelButtonIndex: 0,
          title: t('todos.changeStatus'),
        },
        (buttonIndex) => {
          if (buttonIndex > 0) {
            const newStatus = STATUS_OPTIONS[buttonIndex - 1].value;
            if (newStatus !== todo.status) {
              handleStatusChange(todo, newStatus);
            }
          }
        }
      );
    } else {
      Alert.alert(t('todos.changeStatus'), t('common.select'), [
        ...STATUS_OPTIONS.map((option) => ({
          text: option.label,
          onPress: () => {
            if (option.value !== todo.status) {
              handleStatusChange(todo, option.value);
            }
          },
        })),
        { text: t('common.cancel'), style: 'cancel' as const },
      ]);
    }
  };

  const handleCreateTask = async () => {
    if (!formData.title.trim() || !currentProject) return;
    try {
      await createTodo.mutateAsync({
        project_id: currentProject.id,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        status: formData.status,
        due_date: formData.due_date || undefined,
        assigned_to: formData.assigned_to || undefined,
        stage_ids: formData.stage_ids.length > 0 ? formData.stage_ids : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
      });
      closeModal();
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.failedCreateTask'));
    }
  };

  const handleStageToggle = (stageId: string) => {
    setFormData(prev => ({
      ...prev,
      stage_ids: prev.stage_ids.includes(stageId)
        ? prev.stage_ids.filter(id => id !== stageId)
        : [...prev.stage_ids, stageId]
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        due_date: selectedDate.toISOString().split('T')[0]
      }));
    }
  };

  const filteredTodos = useMemo(() => {
    if (!todos) return [];
    if (statusFilter === 'all') return todos;
    return todos.filter((todo) => todo.status === statusFilter);
  }, [todos, statusFilter]);

  const sortedTodos = useMemo(() => {
    return [...filteredTodos].sort((a, b) => {
      const statusOrder: Record<string, number> = { 'in-progress': 0, 'todo': 1, 'completed': 2, 'cancelled': 3 };
      if (a.status !== b.status) {
        return (statusOrder[a.status] ?? 4) - (statusOrder[b.status] ?? 4);
      }
      const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
      return (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4);
    });
  }, [filteredTodos]);

  const stats = useMemo(() => {
    if (!todos) return { total: 0, completed: 0, pending: 0, inProgress: 0 };
    return {
      total: todos.length,
      completed: todos.filter(t => t.status === 'completed').length,
      pending: todos.filter(t => t.status === 'todo').length,
      inProgress: todos.filter(t => t.status === 'in-progress').length,
    };
  }, [todos]);

  // Get selected assignee name
  const selectedAssigneeName = useMemo(() => {
    if (!formData.assigned_to) return null;
    const member = teamMembers?.find(m => m.user_id === formData.assigned_to);
    return member?.name || null;
  }, [formData.assigned_to, teamMembers]);

  // Get selected stages names
  const selectedStagesNames = useMemo(() => {
    if (!stages || formData.stage_ids.length === 0) return [];
    return formData.stage_ids
      .map(id => stages.find(s => s.id === id)?.name)
      .filter(Boolean) as string[];
  }, [formData.stage_ids, stages]);

  if (!currentProject) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('errors.noProjectSelected')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render assignee selection view
  const renderAssigneeSelection = () => (
    <View style={styles.selectionContainer}>
      <View style={[styles.selectionHeader, styles.selectionHeaderBlue]}>
        <TouchableOpacity onPress={() => setModalView('form')} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.primary[600]} />
        </TouchableOpacity>
        <Text style={[styles.selectionTitle, { color: colors.primary[700] }]}>{t('todos.selectAssignee')}</Text>
        <View style={styles.headerSpacer} />
      </View>
      <FlatList
        data={[{ user_id: '', name: t('todos.unassigned'), email: '', role: '' }, ...(teamMembers || [])]}
        keyExtractor={(item) => item.user_id || 'unassigned'}
        contentContainerStyle={styles.selectionList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.selectionItem, { borderBottomColor: isDark ? colors.neutral[700] : colors.neutral[100] }]}
            onPress={() => {
              setFormData(prev => ({ ...prev, assigned_to: item.user_id }));
              setModalView('form');
            }}
          >
            <Text style={[styles.selectionItemText, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{item.name}</Text>
            {formData.assigned_to === item.user_id && (
              <Check size={20} color={colors.primary[600]} />
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );

  // Render stages selection view
  const renderStagesSelection = () => (
    <View style={styles.selectionContainer}>
      <View style={[styles.selectionHeader, styles.selectionHeaderAmber]}>
        <TouchableOpacity onPress={() => setModalView('form')} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.accent[600]} />
        </TouchableOpacity>
        <Text style={[styles.selectionTitle, { color: colors.accent[700] }]}>{t('todos.selectStages')}</Text>
        <View style={styles.headerSpacer} />
      </View>
      {stages && stages.length > 0 ? (
        <FlatList
          data={stages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.selectionList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.selectionItem, { borderBottomColor: isDark ? colors.neutral[700] : colors.neutral[100] }]}
              onPress={() => handleStageToggle(item.id)}
            >
              <View style={styles.selectionItemContent}>
                <Text style={[styles.selectionItemText, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{item.name}</Text>
                <Text style={[styles.selectionItemSubtext, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                  {item.status === 'completed' ? t('todos.completed') : item.status === 'in-progress' ? t('todos.inProgress') : t('todos.notStarted')}
                </Text>
              </View>
              <View style={[
                styles.checkbox,
                formData.stage_ids.includes(item.id) && styles.checkboxChecked
              ]}>
                {formData.stage_ids.includes(item.id) && (
                  <Check size={14} color="#fff" strokeWidth={3} />
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.selectionEmpty}>
          <Text style={[styles.selectionEmptyText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('todos.noStagesInProject')}</Text>
        </View>
      )}
    </View>
  );

  // Render form view
  const renderForm = () => (
    <>
      <View style={[styles.modalHeader, { borderBottomColor: isDark ? colors.neutral[700] : colors.neutral[100] }]}>
        <TouchableOpacity onPress={closeModal}>
          <X size={24} color={isDark ? colors.neutral[400] : colors.neutral[600]} />
        </TouchableOpacity>
        <Text style={[styles.modalTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('todos.newTask')}</Text>
        <TouchableOpacity
          onPress={handleCreateTask}
          disabled={!formData.title.trim() || createTodo.isPending}
        >
          <Text
            style={[
              styles.modalSaveText,
              (!formData.title.trim() || createTodo.isPending) && styles.modalSaveTextDisabled,
            ]}
          >
            {createTodo.isPending ? t('common.saving') : t('common.save')}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('todos.taskTitle')} *</Text>
          <TextInput
            style={[styles.textInput, {
              backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
              color: isDark ? colors.neutral[50] : colors.neutral[900]
            }]}
            placeholder={t('todos.taskTitlePlaceholder')}
            placeholderTextColor={colors.neutral[400]}
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
          />

          {/* Description */}
          <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('todos.description')}</Text>
          <TextInput
            style={[styles.textInput, styles.textArea, {
              backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
              color: isDark ? colors.neutral[50] : colors.neutral[900]
            }]}
            placeholder={t('todos.descriptionPlaceholder')}
            placeholderTextColor={colors.neutral[400]}
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            multiline
            numberOfLines={3}
          />

          {/* Priority */}
          <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('todos.priority')}</Text>
          <View style={[styles.segmentedControl, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
            {PRIORITY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.segmentItem,
                  formData.priority === option.value && [styles.segmentItemActive, { backgroundColor: isDark ? colors.neutral[700] : '#fff' }],
                ]}
                onPress={() => setFormData(prev => ({ ...prev, priority: option.value }))}
              >
                <View style={[styles.priorityIndicator, { backgroundColor: option.color }]} />
                <Text
                  style={[
                    styles.segmentText,
                    { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                    formData.priority === option.value && [styles.segmentTextActive, { color: isDark ? colors.neutral[50] : colors.neutral[900] }],
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Due Date */}
          <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('todos.dueDate')}</Text>
          <TouchableOpacity
            style={[styles.selectorButton, {
              backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200]
            }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={18} color={colors.neutral[400]} />
            <Text style={[
              formData.due_date ? styles.selectorText : styles.selectorPlaceholder,
              formData.due_date && { color: isDark ? colors.neutral[50] : colors.neutral[900] }
            ]}>
              {formData.due_date ? formatDate(formData.due_date, 'long') : t('todos.selectDate')}
            </Text>
            {formData.due_date && (
              <TouchableOpacity
                onPress={() => setFormData(prev => ({ ...prev, due_date: '' }))}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={16} color={colors.neutral[400]} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={formData.due_date ? new Date(formData.due_date) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
            />
          )}

          {/* Assigned To */}
          <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('todos.assignedTo')}</Text>
          <TouchableOpacity
            style={[styles.selectorButton, {
              backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200]
            }]}
            onPress={() => setModalView('assignee')}
          >
            <Text style={[
              selectedAssigneeName ? styles.selectorText : styles.selectorPlaceholder,
              selectedAssigneeName && { color: isDark ? colors.neutral[50] : colors.neutral[900] }
            ]}>
              {selectedAssigneeName || t('todos.selectTeamMember')}
            </Text>
            <ChevronRight size={18} color={colors.neutral[400]} />
          </TouchableOpacity>

          {/* Link to Stages */}
          <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('todos.linkToStages')}</Text>
          <TouchableOpacity
            style={[styles.selectorButton, {
              backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200]
            }]}
            onPress={() => setModalView('stages')}
          >
            <Text style={[
              selectedStagesNames.length > 0 ? styles.selectorText : styles.selectorPlaceholder,
              selectedStagesNames.length > 0 && { color: isDark ? colors.neutral[50] : colors.neutral[900] }
            ]}>
              {selectedStagesNames.length > 0
                ? `${selectedStagesNames.length} ${t('todos.stagesSelected')}`
                : t('todos.selectStagesBtn')}
            </Text>
            <ChevronRight size={18} color={colors.neutral[400]} />
          </TouchableOpacity>
          {selectedStagesNames.length > 0 && (
            <View style={styles.selectedChips}>
              {selectedStagesNames.map((name, idx) => (
                <View key={idx} style={[styles.chip, styles.chipAmber]}>
                  <Text style={[styles.chipText, styles.chipTextAmber]} numberOfLines={1}>{name}</Text>
                  <TouchableOpacity onPress={() => handleStageToggle(formData.stage_ids[idx])}>
                    <X size={14} color={colors.accent[600]} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Custom Tags */}
          <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('todos.tags')}</Text>
          <View style={styles.tagInputRow}>
            <TextInput
              style={[styles.textInput, styles.tagInput, {
                backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                color: isDark ? colors.neutral[50] : colors.neutral[900]
              }]}
              placeholder={t('todos.addTag')}
              placeholderTextColor={colors.neutral[400]}
              value={newTag}
              onChangeText={setNewTag}
              onSubmitEditing={handleAddTag}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addTagButton} onPress={handleAddTag}>
              <Plus size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          {formData.tags.length > 0 && (
            <View style={styles.selectedChips}>
              {formData.tags.map((tag) => (
                <View key={tag} style={[styles.chip, styles.chipBlue]}>
                  <Text style={[styles.chipText, styles.chipTextBlue]}>#{tag}</Text>
                  <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                    <X size={14} color={colors.primary[600]} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('todos.title')}</Text>
          <Text style={[styles.subtitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
            {stats.pending + stats.inProgress} {t('todos.remaining')}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {STATUS_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterTab,
                {
                  backgroundColor: statusFilter === filter.value ? colors.primary[600] : (isDark ? colors.neutral[800] : '#fff'),
                  borderColor: statusFilter === filter.value ? colors.primary[600] : (isDark ? colors.neutral[700] : colors.neutral[200])
                }
              ]}
              onPress={() => setStatusFilter(filter.value)}
            >
              <Text style={[
                styles.filterText,
                { color: statusFilter === filter.value ? '#fff' : (isDark ? colors.neutral[400] : colors.neutral[600]) }
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.neutral[400]} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Card */}
        {stats.total > 0 && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>{t('todos.taskProgress')}</Text>
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
            <Text style={styles.progressSubtext}>
              {stats.completed} / {stats.total} {t('todos.tasksCompleted')}
            </Text>
          </View>
        )}

        {sortedTodos.length > 0 ? (
          <View style={[styles.taskList, {
            backgroundColor: isDark ? colors.neutral[800] : '#fff',
            borderColor: isDark ? colors.neutral[700] : colors.neutral[200]
          }]}>
            {sortedTodos.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={[styles.taskItem, { borderBottomColor: isDark ? colors.neutral[700] : colors.neutral[100] }]}
                onPress={() => router.push(`/(tabs)/todos/${task.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.taskContent}>
                  <Text
                    style={[
                      styles.taskTitle,
                      { color: isDark ? colors.neutral[50] : colors.neutral[900] },
                      (task.status === 'completed' || task.status === 'cancelled') && [styles.taskTitleDone, { color: colors.neutral[400] }],
                    ]}
                    numberOfLines={2}
                  >
                    {task.title}
                  </Text>
                  <View style={styles.taskMeta}>
                    <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
                    <Text style={[styles.priorityText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{task.priority}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: task.status === 'in-progress'
                        ? isDark ? 'rgba(96, 165, 250, 0.2)' : themeColors.primary[50]
                        : task.status === 'completed'
                        ? isDark ? 'rgba(52, 211, 153, 0.2)' : themeColors.success[50]
                        : task.status === 'cancelled'
                        ? isDark ? colors.neutral[700] : themeColors.neutral[100]
                        : isDark ? colors.neutral[700] : themeColors.neutral[100],
                      borderWidth: 1,
                      borderColor: task.status === 'in-progress'
                        ? isDark ? 'rgba(96, 165, 250, 0.3)' : themeColors.primary[200]
                        : task.status === 'completed'
                        ? isDark ? 'rgba(52, 211, 153, 0.3)' : themeColors.success[200]
                        : task.status === 'cancelled'
                        ? isDark ? colors.neutral[600] : themeColors.neutral[200]
                        : isDark ? colors.neutral[600] : themeColors.neutral[200],
                    }
                  ]}
                  onPress={() => showStatusPicker(task)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      {
                        color: task.status === 'in-progress'
                          ? isDark ? themeColors.primary[400] : themeColors.primary[600]
                          : task.status === 'completed'
                          ? isDark ? themeColors.success[400] : themeColors.success[600]
                          : task.status === 'cancelled'
                          ? isDark ? colors.neutral[400] : themeColors.neutral[500]
                          : isDark ? colors.neutral[300] : themeColors.neutral[600]
                      }
                    ]}
                  >
                    {getStatusLabel(task.status)}
                  </Text>
                  <ChevronDown
                    size={12}
                    color={
                      task.status === 'in-progress'
                        ? isDark ? themeColors.primary[400] : themeColors.primary[600]
                        : task.status === 'completed'
                        ? isDark ? themeColors.success[400] : themeColors.success[600]
                        : task.status === 'cancelled'
                        ? isDark ? colors.neutral[400] : themeColors.neutral[500]
                        : isDark ? colors.neutral[300] : themeColors.neutral[600]
                    }
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
              <ListTodo size={28} color={colors.neutral[400]} />
            </View>
            <Text style={[styles.emptyStateTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('todos.noTasks')}</Text>
            <Text style={[styles.emptyStateText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
              {statusFilter === 'all'
                ? t('todos.noTasksDesc')
                : t('todos.noFilteredTasks')}
            </Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Add Task Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: isDark ? colors.neutral[900] : '#fff' }]}>
          {modalView === 'form' && renderForm()}
          {modalView === 'assignee' && renderAssigneeSelection()}
          {modalView === 'stages' && renderStagesSelection()}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent': return themeColors.danger[500];
    case 'high': return themeColors.accent[500];
    case 'medium': return themeColors.primary[500];
    default: return themeColors.neutral[400];
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'in-progress': return themeColors.primary[600];
    case 'completed': return themeColors.success[600];
    case 'cancelled': return themeColors.neutral[400];
    default: return themeColors.neutral[600];
  }
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
    paddingBottom: 16,
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
  filterWrapper: {
    paddingBottom: 16,
  },
  filterContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: themeColors.neutral[200],
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: themeColors.primary[600],
    borderColor: themeColors.primary[600],
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: themeColors.neutral[600],
  },
  filterTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  progressCard: {
    backgroundColor: themeColors.primary[600],
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 3,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  progressSubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
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
  taskList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themeColors.neutral[200],
    overflow: 'hidden',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.neutral[100],
  },
  taskContent: {
    flex: 1,
    paddingRight: 8,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: themeColors.neutral[900],
    lineHeight: 22,
    marginBottom: 4,
  },
  taskTitleDone: {
    color: themeColors.neutral[400],
    textDecorationLine: 'line-through',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityText: {
    fontSize: 12,
    color: themeColors.neutral[500],
    textTransform: 'capitalize',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: themeColors.neutral[100],
    gap: 4,
  },
  statusBadgeBlue: {
    backgroundColor: themeColors.primary[50],
  },
  statusBadgeGreen: {
    backgroundColor: themeColors.success[50],
  },
  statusBadgeGray: {
    backgroundColor: themeColors.neutral[100],
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: themeColors.neutral[600],
  },
  statusBadgeTextBlue: {
    color: themeColors.primary[600],
  },
  statusBadgeTextGreen: {
    color: themeColors.success[600],
  },
  statusBadgeTextGray: {
    color: themeColors.neutral[400],
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
    padding: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: themeColors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 20,
  },
  textInput: {
    fontSize: 16,
    color: themeColors.neutral[900],
    backgroundColor: themeColors.neutral[50],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    borderRadius: 12,
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
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
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.neutral[50],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: themeColors.neutral[200],
    gap: 12,
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
    color: themeColors.neutral[900],
  },
  selectorPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: themeColors.neutral[400],
  },
  selectedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.neutral[100],
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  chipBlue: {
    backgroundColor: themeColors.primary[50],
    borderWidth: 1,
    borderColor: themeColors.primary[200],
  },
  chipAmber: {
    backgroundColor: themeColors.accent[50],
    borderWidth: 1,
    borderColor: themeColors.accent[200],
  },
  chipText: {
    fontSize: 13,
    color: themeColors.neutral[700],
    maxWidth: 150,
  },
  chipTextBlue: {
    color: themeColors.primary[700],
  },
  chipTextAmber: {
    color: themeColors.accent[700],
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    marginTop: 0,
  },
  addTagButton: {
    width: 48,
    backgroundColor: themeColors.primary[600],
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Selection View Styles
  selectionContainer: {
    flex: 1,
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
  selectionHeaderBlue: {
    backgroundColor: themeColors.primary[50],
    borderBottomColor: themeColors.primary[100],
  },
  selectionHeaderAmber: {
    backgroundColor: themeColors.accent[50],
    borderBottomColor: themeColors.accent[100],
  },
  backButton: {
    width: 40,
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.neutral[100],
  },
  selectionItemContent: {
    flex: 1,
  },
  selectionItemText: {
    fontSize: 16,
    color: themeColors.neutral[900],
  },
  selectionItemSubtext: {
    fontSize: 13,
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
