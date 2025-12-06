import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState, useMemo } from 'react';
import {
  ChevronRight,
  Circle,
  CheckCircle2,
  ArrowUpRight,
  Building2,
  Plus,
  Layers,
  DollarSign,
} from 'lucide-react-native';
import { useProject } from '../../stores/ProjectContext';
import { useTheme } from '../../stores/ThemeContext';
import { useLanguage } from '../../stores/LanguageContext';
import { colors as themeColors } from '../../config/theme';
import { useStages } from '../../hooks/useStages';
import { useTodos } from '../../hooks/useTodos';
import { useExpenses } from '../../hooks/useExpenses';
import { LoadingSpinner } from '../../components/ui';
import { useCurrency } from '../../stores/CurrencyContext';

export default function DashboardScreen() {
  const { currentProject, hasMultipleProjects } = useProject();
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const { formatAmount } = useCurrency();
  const { data: stages, refetch: refetchStages } = useStages(currentProject?.id);
  const { data: todos, refetch: refetchTodos } = useTodos(currentProject?.id);
  const { data: expenses, refetch: refetchExpenses } = useExpenses(currentProject?.id);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchStages(), refetchTodos(), refetchExpenses()]);
    setRefreshing(false);
  };

  const progress = useMemo(() => {
    if (!stages || stages.length === 0) return { completed: 0, total: 0, percentage: 0 };
    const completed = stages.filter(s => s.status === 'completed').length;
    return {
      completed,
      total: stages.length,
      percentage: Math.round((completed / stages.length) * 100),
    };
  }, [stages]);

  const taskStats = useMemo(() => {
    if (!todos) return { pending: 0, completed: 0 };
    return {
      pending: todos.filter(t => t.status !== 'completed').length,
      completed: todos.filter(t => t.status === 'completed').length,
    };
  }, [todos]);

  const budgetStats = useMemo(() => {
    const budget = currentProject?.total_budget || 0;
    const spent = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
    const remaining = budget - spent;
    return { budget, spent, remaining, percentage: budget > 0 ? Math.round((spent / budget) * 100) : 0 };
  }, [currentProject, expenses]);

  const activeStage = useMemo(() => {
    if (!stages) return null;
    return stages.find(s => s.status === 'in-progress') || stages.find(s => s.status === 'not-started');
  }, [stages]);

  if (!currentProject) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top']}>
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIcon, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
            <Building2 size={32} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
          </View>
          <Text style={[styles.emptyTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
            {t('dashboard.noProjects')}
          </Text>
          <Text style={[styles.emptyText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
            {t('dashboard.noProjectsDesc')}
          </Text>
          <TouchableOpacity
            style={[styles.createBtn, { backgroundColor: isDark ? colors.neutral[50] : colors.neutral[900] }]}
            onPress={() => router.push('/onboarding')}
          >
            <Text style={[styles.createBtnText, { color: isDark ? colors.neutral[900] : '#fff' }]}>
              {t('dashboard.newProject')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? colors.neutral[400] : colors.neutral[400]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Spacer */}
        <View style={styles.headerSpacer} />

        {/* Project Selector */}
        <Pressable
          style={({ pressed }) => [styles.projectCard, { backgroundColor: colors.primary[600] }, pressed && styles.projectCardPressed]}
          onPress={() => hasMultipleProjects && router.push('/(tabs)/projects')}
        >
          <View style={styles.projectInfo}>
            <Text style={styles.projectLabel}>{t('dashboard.currentProject')}</Text>
            <Text style={styles.projectName} numberOfLines={1}>{currentProject.name}</Text>
            {currentProject.address && (
              <Text style={styles.projectAddress} numberOfLines={1}>{currentProject.address}</Text>
            )}
          </View>
          <View style={styles.projectProgress}>
            <Text style={styles.progressPercent}>{progress.percentage}%</Text>
            <Text style={styles.progressLabel}>{t('dashboard.complete')}</Text>
          </View>
        </Pressable>

        {/* Overview Cards */}
        <View style={styles.overviewGrid}>
          <TouchableOpacity
            style={[
              styles.overviewCard,
              {
                backgroundColor: isDark ? colors.neutral[800] : '#fff',
                borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
              }
            ]}
            onPress={() => router.push('/(tabs)/todos')}
          >
            <Text style={[styles.overviewValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
              {taskStats.pending}
            </Text>
            <Text style={[styles.overviewLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
              {t('dashboard.openTasks')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.overviewCard,
              {
                backgroundColor: isDark ? colors.neutral[800] : '#fff',
                borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
              }
            ]}
            onPress={() => router.push('/(tabs)/stages')}
          >
            <Text style={[styles.overviewValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
              {progress.completed}/{progress.total}
            </Text>
            <Text style={[styles.overviewLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
              {t('dashboard.stagesDone')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.overviewCard,
              styles.overviewCardWide,
              {
                backgroundColor: isDark ? colors.neutral[800] : '#fff',
                borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
              }
            ]}
            onPress={() => router.push('/(tabs)/expenses')}
          >
            <View>
              <Text style={[styles.overviewValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
                {formatAmount(budgetStats.spent)}
              </Text>
              <Text style={[styles.overviewLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                of {formatAmount(budgetStats.budget)} {t('dashboard.budget')}
              </Text>
            </View>
            <View style={[styles.budgetBar, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]}>
              <View style={[styles.budgetBarFill, { width: `${Math.min(budgetStats.percentage, 100)}%` }]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[
              styles.quickActionBtn,
              {
                backgroundColor: isDark ? colors.neutral[800] : '#fff',
                borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
              }
            ]}
            onPress={() => router.push('/(tabs)/stages?openAdd=true')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: isDark ? colors.primary[900] : colors.primary[50] }]}>
              <Layers size={18} color={colors.primary[600]} />
            </View>
            <Text style={[styles.quickActionText, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
              {t('dashboard.addStage')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.quickActionBtn,
              {
                backgroundColor: isDark ? colors.neutral[800] : '#fff',
                borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
              }
            ]}
            onPress={() => router.push('/(tabs)/expenses?openAdd=true')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: isDark ? colors.primary[900] : colors.primary[50] }]}>
              <DollarSign size={18} color={colors.primary[600]} />
            </View>
            <Text style={[styles.quickActionText, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
              {t('dashboard.addExpense')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Active Stage */}
        {activeStage && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                {t('dashboard.currentStage')}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.stageCard,
                {
                  backgroundColor: isDark ? colors.neutral[800] : '#fff',
                  borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                }
              ]}
              onPress={() => router.push('/(tabs)/stages')}
            >
              <View style={styles.stageInfo}>
                <Text style={[styles.stageName, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
                  {activeStage.name}
                </Text>
                <Text style={[styles.stageStatus, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                  {activeStage.status === 'in-progress' ? t('dashboard.inProgress') : t('dashboard.upNext')}
                </Text>
              </View>
              <ChevronRight size={20} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Tasks */}
        {todos && todos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                {t('dashboard.tasks')}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/todos')} style={styles.seeAllBtn}>
                <Text style={[styles.seeAllText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                  {t('dashboard.seeAll')}
                </Text>
                <ArrowUpRight size={14} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
              </TouchableOpacity>
            </View>

            <View style={[
              styles.taskList,
              {
                backgroundColor: isDark ? colors.neutral[800] : '#fff',
                borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
              }
            ]}>
              {todos.slice(0, 5).map((task) => (
                <View
                  key={task.id}
                  style={[
                    styles.taskItem,
                    { borderBottomColor: isDark ? colors.neutral[700] : colors.neutral[100] }
                  ]}
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 size={18} color={colors.success[500]} />
                  ) : (
                    <Circle size={18} color={isDark ? colors.neutral[600] : colors.neutral[300]} />
                  )}
                  <Text
                    style={[
                      styles.taskText,
                      { color: isDark ? colors.neutral[50] : colors.neutral[900] },
                      task.status === 'completed' && { color: isDark ? colors.neutral[500] : colors.neutral[400], textDecorationLine: 'line-through' }
                    ]}
                    numberOfLines={1}
                  >
                    {task.title}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  createBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  headerSpacer: {
    height: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1,
  },
  quickActionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  projectCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  projectCardPressed: {
    opacity: 0.95,
  },
  projectInfo: {
    flex: 1,
    marginRight: 16,
  },
  projectLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  projectAddress: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
  },
  projectProgress: {
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -1,
  },
  progressLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  overviewCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  overviewCardWide: {
    flex: 2,
    minWidth: '100%',
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  overviewLabel: {
    fontSize: 13,
  },
  budgetBar: {
    height: 4,
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  budgetBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 13,
  },
  stageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  stageInfo: {
    flex: 1,
  },
  stageName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  stageStatus: {
    fontSize: 14,
  },
  taskList: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  taskText: {
    flex: 1,
    fontSize: 15,
  },
});
