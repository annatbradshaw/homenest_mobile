import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  MoreVertical,
  MapPin,
  Calendar,
  DollarSign,
  Layers,
  CheckSquare,
  FileText,
  Users,
  Edit,
  Trash2,
} from 'lucide-react-native';
import { useProject, useDeleteProject } from '../../../hooks/useProjects';
import { useStages } from '../../../hooks/useStages';
import { useTodos } from '../../../hooks/useTodos';
import { Card, Badge, LoadingSpinner, Button, Avatar } from '../../../components/ui';
import { colors as themeColors, typography, spacing, categoryColors, statusColors } from '../../../config/theme';
import { useTheme } from '../../../stores/ThemeContext';
import { useLanguage } from '../../../stores/LanguageContext';
import { useCurrency } from '../../../stores/CurrencyContext';

export default function ProjectDetailScreen() {
  const { isDark, colors } = useTheme();
  const { t, formatDate } = useLanguage();
  const { formatAmount } = useCurrency();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: project, isLoading, refetch } = useProject(id);
  const { data: stages } = useStages(id);
  const { data: todos } = useTodos(id);
  const deleteProject = useDeleteProject();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      t('alerts.deleteProjectTitle'),
      t('alerts.deleteProjectMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProject.mutateAsync(id!);
              router.back();
            } catch (error) {
              Alert.alert(t('common.error'), t('errors.failedDeleteProject'));
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message={t('projects.loadingProject')} />;
  }

  if (!project) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('projects.projectNotFound')}</Text>
          <Button title={t('projects.goBack')} onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const completedTodos = todos?.filter((t) => t.is_completed).length || 0;
  const totalTodos = todos?.length || 0;
  const completedStages = stages?.filter((s) => s.status === 'completed').length || 0;
  const totalStages = stages?.length || 0;
  const budgetPercentage = project.total_budget
    ? ((project.actual_spent || 0) / project.total_budget) * 100
    : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? colors.neutral[800] : colors.white, borderBottomColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={isDark ? colors.neutral[300] : colors.neutral[700]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]} numberOfLines={1}>
          {project.name}
        </Text>
        <TouchableOpacity onPress={handleDelete} style={styles.menuButton}>
          <Trash2 size={20} color={colors.danger[500]} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Status Badge */}
        <View style={styles.statusRow}>
          <Badge
            label={project.status.replace('-', ' ')}
            variant={project.status === 'in-progress' ? 'accent' : 'primary'}
          />
          {project.target_completion_date && (
            <Text style={[styles.dueDate, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
              {t('projects.due')} {formatDate(project.target_completion_date, 'long')}
            </Text>
          )}
        </View>

        {/* Description */}
        {project.description && (
          <Text style={[styles.description, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>{project.description}</Text>
        )}

        {/* Address */}
        {project.address && (
          <View style={styles.addressRow}>
            <MapPin size={16} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
            <Text style={[styles.addressText, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>{project.address}</Text>
          </View>
        )}

        {/* Budget Card */}
        {project.total_budget && (
          <Card variant="elevated" style={[styles.budgetCard, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
            <View style={styles.budgetHeader}>
              <DollarSign size={20} color={colors.primary[600]} />
              <Text style={[styles.budgetTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('forms.budget')}</Text>
            </View>
            <View style={styles.budgetAmounts}>
              <View style={styles.budgetAmount}>
                <Text style={[styles.budgetValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
                  {formatAmount(project.actual_spent || 0)}
                </Text>
                <Text style={[styles.budgetLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('projects.spent')}</Text>
              </View>
              <View style={[styles.budgetDivider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200] }]} />
              <View style={styles.budgetAmount}>
                <Text style={[styles.budgetValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
                  {formatAmount(project.total_budget)}
                </Text>
                <Text style={[styles.budgetLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('projects.totalBudget')}</Text>
              </View>
            </View>
            <View style={styles.budgetProgress}>
              <View style={[styles.budgetBar, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
                <View
                  style={[
                    styles.budgetFill,
                    {
                      width: `${Math.min(budgetPercentage, 100)}%`,
                      backgroundColor:
                        budgetPercentage > 100
                          ? colors.danger[500]
                          : budgetPercentage > 80
                          ? colors.warning[500]
                          : colors.success[500],
                    },
                  ]}
                />
              </View>
              <Text style={[styles.budgetPercent, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>{budgetPercentage.toFixed(0)}%</Text>
            </View>
          </Card>
        )}

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: isDark ? colors.neutral[800] : colors.white, borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}
            onPress={() => router.push(`/(tabs)/projects/${id}/stages`)}
          >
            <Layers size={24} color={colors.primary[600]} />
            <Text style={[styles.statValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
              {completedStages}/{totalStages}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('tabs.stages')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: isDark ? colors.neutral[800] : colors.white, borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}
            onPress={() => router.push(`/(tabs)/todos?project=${id}`)}
          >
            <CheckSquare size={24} color={colors.accent[600]} />
            <Text style={[styles.statValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
              {completedTodos}/{totalTodos}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('todos.title')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: isDark ? colors.neutral[800] : colors.white, borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}
            onPress={() => router.push(`/(tabs)/projects/${id}/documents`)}
          >
            <FileText size={24} color={colors.success[600]} />
            <Text style={[styles.statValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>--</Text>
            <Text style={[styles.statLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('projects.docs')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: isDark ? colors.neutral[800] : colors.white, borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}
            onPress={() => router.push(`/(tabs)/projects/${id}/suppliers`)}
          >
            <Users size={24} color={isDark ? colors.neutral[400] : colors.neutral[600]} />
            <Text style={[styles.statValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>--</Text>
            <Text style={[styles.statLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('suppliers.title')}</Text>
          </TouchableOpacity>
        </View>

        {/* Stages Preview */}
        {stages && stages.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('tabs.stages')}</Text>
              <TouchableOpacity>
                <Text style={styles.sectionLink}>{t('projects.viewAll')}</Text>
              </TouchableOpacity>
            </View>
            {stages.slice(0, 3).map((stage) => (
              <Card key={stage.id} variant="default" style={[styles.stageCard, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
                <View style={styles.stageRow}>
                  <View
                    style={[
                      styles.stageDot,
                      { backgroundColor: categoryColors[stage.category] || colors.neutral[400] },
                    ]}
                  />
                  <View style={styles.stageInfo}>
                    <Text style={[styles.stageName, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{stage.name}</Text>
                    <Text style={[styles.stageCategory, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                      {stage.category.replace('-', ' ')}
                    </Text>
                  </View>
                  <Badge
                    label={stage.status.replace('-', ' ')}
                    variant={
                      stage.status === 'completed'
                        ? 'success'
                        : stage.status === 'in-progress'
                        ? 'accent'
                        : 'default'
                    }
                    size="sm"
                  />
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Todos Preview */}
        {todos && todos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('projects.recentTasks')}</Text>
              <TouchableOpacity onPress={() => router.push(`/(tabs)/todos?project=${id}`)}>
                <Text style={styles.sectionLink}>{t('projects.viewAll')}</Text>
              </TouchableOpacity>
            </View>
            {todos
              .filter((t) => !t.is_completed)
              .slice(0, 3)
              .map((todo) => (
                <TouchableOpacity
                  key={todo.id}
                  onPress={() => router.push(`/(tabs)/todos/${todo.id}`)}
                  activeOpacity={0.7}
                >
                  <Card variant="default" style={[styles.todoCard, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
                    <View style={styles.todoRow}>
                      <View
                        style={[
                          styles.todoPriority,
                          {
                            backgroundColor:
                              todo.priority === 'urgent'
                                ? colors.danger[500]
                                : todo.priority === 'high'
                                ? colors.accent[500]
                                : todo.priority === 'medium'
                                ? colors.primary[500]
                                : colors.neutral[400],
                          },
                        ]}
                      />
                      <View style={styles.todoInfo}>
                        <Text style={[styles.todoTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{todo.title}</Text>
                        {todo.due_date && (
                          <Text style={[styles.todoDue, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                            {t('projects.due')} {formatDate(todo.due_date, 'short')}
                          </Text>
                        )}
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
          </View>
        )}
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
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: themeColors.white,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.neutral[200],
  },
  backButton: {
    marginRight: spacing[3],
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: themeColors.neutral[900],
  },
  menuButton: {
    padding: spacing[2],
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    color: themeColors.neutral[500],
    marginBottom: spacing[4],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  dueDate: {
    fontSize: typography.fontSize.sm,
    color: themeColors.neutral[500],
  },
  description: {
    fontSize: typography.fontSize.base,
    color: themeColors.neutral[700],
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    marginBottom: spacing[4],
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[6],
  },
  addressText: {
    fontSize: typography.fontSize.sm,
    color: themeColors.neutral[600],
  },
  budgetCard: {
    marginBottom: spacing[6],
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  budgetTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: themeColors.neutral[900],
  },
  budgetAmounts: {
    flexDirection: 'row',
    marginBottom: spacing[4],
  },
  budgetAmount: {
    flex: 1,
    alignItems: 'center',
  },
  budgetDivider: {
    width: 1,
    backgroundColor: themeColors.neutral[200],
    marginHorizontal: spacing[4],
  },
  budgetValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.neutral[900],
  },
  budgetLabel: {
    fontSize: typography.fontSize.sm,
    color: themeColors.neutral[500],
    marginTop: spacing[1],
  },
  budgetProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  budgetBar: {
    flex: 1,
    height: 8,
    backgroundColor: themeColors.neutral[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  budgetFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetPercent: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: themeColors.neutral[700],
    minWidth: 40,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  statCard: {
    flex: 1,
    backgroundColor: themeColors.white,
    borderRadius: 12,
    padding: spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: themeColors.neutral[200],
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.neutral[900],
    marginTop: spacing[2],
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: themeColors.neutral[500],
    marginTop: spacing[1],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: themeColors.neutral[900],
  },
  sectionLink: {
    fontSize: typography.fontSize.sm,
    color: themeColors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  stageCard: {
    marginBottom: spacing[2],
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  stageDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stageInfo: {
    flex: 1,
  },
  stageName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: themeColors.neutral[900],
  },
  stageCategory: {
    fontSize: typography.fontSize.xs,
    color: themeColors.neutral[500],
    textTransform: 'capitalize',
  },
  todoCard: {
    marginBottom: spacing[2],
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  todoPriority: {
    width: 4,
    height: 36,
    borderRadius: 2,
  },
  todoInfo: {
    flex: 1,
  },
  todoTitle: {
    fontSize: typography.fontSize.base,
    color: themeColors.neutral[900],
  },
  todoDue: {
    fontSize: typography.fontSize.xs,
    color: themeColors.neutral[500],
    marginTop: spacing[1],
  },
});
