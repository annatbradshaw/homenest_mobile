import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Layers,
  Tag,
  Trash2,
  Circle,
  Clock,
  CheckCircle2,
  XCircle,
  X,
  Plus,
  Check,
} from 'lucide-react-native';
import { useTodos, useUpdateTodo, useDeleteTodo } from '../../../hooks/useTodos';
import { useStages } from '../../../hooks/useStages';
import { useTeamMembers } from '../../../hooks/useTeamMembers';
import { useProject } from '../../../stores/ProjectContext';
import { useTheme } from '../../../stores/ThemeContext';
import { useLanguage } from '../../../stores/LanguageContext';
import { colors as themeColors } from '../../../config/theme';
import { TodoStatus, TodoPriority } from '../../../types/database';

type EditView = 'form' | 'assignee' | 'stages';

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
  const [editView, setEditView] = useState<EditView>('form');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newTag, setNewTag] = useState('');

  // Form data state
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

  // Update form data when task loads
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        due_date: task.due_date || '',
        assigned_to: task.assigned_to || '',
        stage_ids: task.stage_ids || [],
        tags: task.tags || [],
      });
    }
  }, [task]);

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

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert(t('common.error'), t('errors.nameRequired'));
      return;
    }
    try {
      await updateTodo.mutateAsync({
        id: task.id,
        updates: {
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          priority: formData.priority,
          status: formData.status,
          due_date: formData.due_date || null,
          assigned_to: formData.assigned_to || null,
          stage_ids: formData.stage_ids.length > 0 ? formData.stage_ids : null,
          tags: formData.tags.length > 0 ? formData.tags : null,
        },
      });
      setIsEditing(false);
      setEditView('form');
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.failedUpdateTask'));
    }
  };

  const handleCancel = () => {
    // Reset form to task values
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        due_date: task.due_date || '',
        assigned_to: task.assigned_to || '',
        stage_ids: task.stage_ids || [],
        tags: task.tags || [],
      });
    }
    setNewTag('');
    setIsEditing(false);
    setEditView('form');
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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        due_date: selectedDate.toISOString().split('T')[0]
      }));
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

  const getStatusStyle = (status: TodoStatus) => {
    if (isDark) {
      switch (status) {
        case 'completed':
          return { bg: `${colors.success[500]}25`, text: colors.success[400] };
        case 'in-progress':
          return { bg: `${colors.primary[500]}25`, text: colors.primary[400] };
        case 'cancelled':
          return { bg: colors.neutral[800], text: colors.neutral[500] };
        default:
          return { bg: colors.neutral[800], text: colors.neutral[400] };
      }
    }
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

  // Render assignee selection view
  const renderAssigneeSelection = () => (
    <View style={styles.selectionContainer}>
      <View style={[styles.selectionHeader, { backgroundColor: isDark ? colors.primary[900] : colors.primary[50], borderBottomColor: isDark ? colors.primary[800] : colors.primary[100] }]}>
        <TouchableOpacity onPress={() => setEditView('form')} style={styles.selectionBackButton}>
          <ChevronLeft size={24} color={isDark ? colors.primary[400] : colors.primary[600]} />
        </TouchableOpacity>
        <Text style={[styles.selectionTitle, { color: isDark ? colors.primary[400] : colors.primary[700] }]}>{t('todos.selectAssignee')}</Text>
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
              setEditView('form');
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
      <View style={[styles.selectionHeader, { backgroundColor: isDark ? colors.accent[900] : colors.accent[50], borderBottomColor: isDark ? colors.accent[800] : colors.accent[100] }]}>
        <TouchableOpacity onPress={() => setEditView('form')} style={styles.selectionBackButton}>
          <ChevronLeft size={24} color={isDark ? colors.accent[400] : colors.accent[600]} />
        </TouchableOpacity>
        <Text style={[styles.selectionTitle, { color: isDark ? colors.accent[400] : colors.accent[700] }]}>{t('todos.selectStages')}</Text>
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
                { borderColor: isDark ? colors.neutral[600] : colors.neutral[300] },
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

  // Render edit form
  const renderEditForm = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
          <ChevronLeft size={24} color={isDark ? colors.neutral[50] : colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('forms.editTask')}</Text>
        <TouchableOpacity onPress={handleSave} disabled={updateTodo.isPending}>
          <Text style={[styles.saveButton, updateTodo.isPending && { opacity: 0.5 }]}>
            {updateTodo.isPending ? t('common.saving') : t('common.save')}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.section}>
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
          </View>

          {/* Description */}
          <View style={styles.section}>
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
          </View>

          {/* Status */}
          <View style={styles.section}>
            <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('todos.status')}</Text>
            <View style={styles.statusOptions}>
              {STATUS_OPTIONS.slice(0, 3).map((option) => {
                const Icon = option.icon;
                const isActive = formData.status === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.statusOption,
                      { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] },
                      isActive && {
                        backgroundColor: isDark ? `${colors.primary[500]}20` : colors.primary[50],
                        borderColor: isDark ? colors.primary[600] : colors.primary[300]
                      }
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, status: option.value }))}
                  >
                    <Icon
                      size={16}
                      color={isActive ? (isDark ? colors.primary[400] : colors.primary[600]) : colors.neutral[400]}
                    />
                    <Text style={[
                      styles.statusOptionText,
                      { color: isDark ? colors.neutral[300] : colors.neutral[600] },
                      isActive && { color: isDark ? colors.primary[400] : colors.primary[700] }
                    ]} numberOfLines={1}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Priority */}
          <View style={styles.section}>
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
          </View>

          {/* Due Date */}
          <View style={styles.section}>
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
          </View>

          {/* Assigned To */}
          <View style={styles.section}>
            <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('todos.assignedTo')}</Text>
            <TouchableOpacity
              style={[styles.selectorButton, {
                backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                borderColor: isDark ? colors.neutral[700] : colors.neutral[200]
              }]}
              onPress={() => setEditView('assignee')}
            >
              <User size={18} color={colors.neutral[400]} />
              <Text style={[
                selectedAssigneeName ? styles.selectorText : styles.selectorPlaceholder,
                selectedAssigneeName && { color: isDark ? colors.neutral[50] : colors.neutral[900] }
              ]}>
                {selectedAssigneeName || t('todos.selectTeamMember')}
              </Text>
              <ChevronRight size={18} color={colors.neutral[400]} />
            </TouchableOpacity>
          </View>

          {/* Link to Stages */}
          <View style={styles.section}>
            <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('todos.linkToStages')}</Text>
            <TouchableOpacity
              style={[styles.selectorButton, {
                backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                borderColor: isDark ? colors.neutral[700] : colors.neutral[200]
              }]}
              onPress={() => setEditView('stages')}
            >
              <Layers size={18} color={colors.neutral[400]} />
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
                {formData.stage_ids.map((stageId, idx) => {
                  const stageName = stages?.find(s => s.id === stageId)?.name;
                  if (!stageName) return null;
                  return (
                    <View key={stageId} style={[
                      styles.chip,
                      {
                        backgroundColor: isDark ? `${colors.accent[500]}20` : colors.accent[50],
                        borderColor: isDark ? colors.accent[700] : colors.accent[200],
                        borderWidth: 1,
                      }
                    ]}>
                      <Text style={[styles.chipText, { color: isDark ? colors.accent[400] : colors.accent[700] }]} numberOfLines={1}>{stageName}</Text>
                      <TouchableOpacity onPress={() => handleStageToggle(stageId)}>
                        <X size={14} color={isDark ? colors.accent[400] : colors.accent[600]} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Custom Tags */}
          <View style={styles.section}>
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
                  <View key={tag} style={[
                    styles.chip,
                    {
                      backgroundColor: isDark ? `${colors.primary[500]}20` : colors.primary[50],
                      borderColor: isDark ? colors.primary[700] : colors.primary[200],
                      borderWidth: 1,
                    }
                  ]}>
                    <Text style={[styles.chipText, { color: isDark ? colors.primary[400] : colors.primary[700] }]}>#{tag}</Text>
                    <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                      <X size={14} color={isDark ? colors.primary[400] : colors.primary[600]} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Delete Button */}
          <View style={styles.section}>
            <TouchableOpacity style={[styles.deleteButton, { backgroundColor: isDark ? `${colors.danger[500]}15` : colors.danger[50], borderColor: isDark ? colors.danger[800] : colors.danger[200] }]} onPress={handleDelete}>
              <Trash2 size={18} color={isDark ? colors.danger[400] : colors.danger[600]} />
              <Text style={[styles.deleteButtonText, { color: isDark ? colors.danger[400] : colors.danger[600] }]}>{t('todos.deleteTask')}</Text>
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
              value={formData.due_date ? new Date(formData.due_date) : new Date()}
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
            value={formData.due_date ? new Date(formData.due_date) : new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </KeyboardAvoidingView>
    </>
  );

  // Render view mode
  const renderViewMode = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={isDark ? colors.neutral[50] : colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('todos.taskDetails')}</Text>
        <TouchableOpacity onPress={() => setIsEditing(true)}>
          <Text style={styles.editButtonText}>{t('common.edit')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Title & Description */}
        <View style={styles.section}>
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
              <Text style={[styles.priorityTextBadge, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>{t(`todos.priorities.${task.priority}`)}</Text>
            </View>
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
                <View key={tag} style={[
                  styles.tag,
                  {
                    backgroundColor: isDark ? `${colors.primary[500]}20` : colors.primary[50],
                    borderColor: isDark ? colors.primary[700] : colors.primary[200]
                  }
                ]}>
                  <Tag size={12} color={isDark ? colors.primary[400] : colors.primary[600]} />
                  <Text style={[styles.tagText, { color: isDark ? colors.primary[400] : colors.primary[700] }]}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Delete Button */}
        <View style={styles.section}>
          <TouchableOpacity style={[styles.deleteButton, { backgroundColor: isDark ? `${colors.danger[500]}15` : colors.danger[50], borderColor: isDark ? colors.danger[800] : colors.danger[200] }]} onPress={handleDelete}>
            <Trash2 size={18} color={isDark ? colors.danger[400] : colors.danger[600]} />
            <Text style={[styles.deleteButtonText, { color: isDark ? colors.danger[400] : colors.danger[600] }]}>{t('todos.deleteTask')}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top']}>
      {isEditing ? (
        editView === 'form' ? renderEditForm() :
        editView === 'assignee' ? renderAssigneeSelection() :
        renderStagesSelection()
      ) : (
        renderViewMode()
      )}
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
  editButtonText: {
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
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: themeColors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
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
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
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
    borderRadius: 6,
    backgroundColor: themeColors.neutral[100],
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityTextBadge: {
    fontSize: 14,
    fontWeight: '500',
    color: themeColors.neutral[600],
    textTransform: 'capitalize',
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
  statusOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: themeColors.neutral[600],
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
    borderRadius: 6,
    gap: 6,
  },
  chipText: {
    fontSize: 13,
    color: themeColors.neutral[700],
    maxWidth: 150,
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
  },
  addTagButton: {
    width: 48,
    backgroundColor: themeColors.primary[600],
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderRadius: 6,
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
  selectionBackButton: {
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
