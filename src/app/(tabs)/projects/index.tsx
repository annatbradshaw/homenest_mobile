import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, FolderOpen, MapPin, Calendar, Check } from 'lucide-react-native';
import { useProjects } from '../../../hooks/useProjects';
import { useProject } from '../../../stores/ProjectContext';
import { LoadingSpinner, EmptyState } from '../../../components/ui';
import { colors as themeColors, typography } from '../../../config/theme';
import { CircularProgress } from '../../../components/ui';
import { Project, ProjectStatus } from '../../../types/database';
import { useCurrency } from '../../../stores/CurrencyContext';
import { useTheme } from '../../../stores/ThemeContext';
import { useLanguage } from '../../../stores/LanguageContext';

export default function ProjectsScreen() {
  const { isDark, colors } = useTheme();
  const { t, formatDate } = useLanguage();
  const { formatAmount } = useCurrency();

  // Define filters inside component to access translations
  const STATUS_FILTERS: { label: string; value: ProjectStatus | 'all' }[] = [
    { label: t('common.all'), value: 'all' },
    { label: t('projects.planning'), value: 'planning' },
    { label: t('projects.inProgress'), value: 'in-progress' },
    { label: t('projects.completed'), value: 'completed' },
    { label: t('projects.onHold'), value: 'on-hold' },
  ];
  const { data: projects, isLoading, refetch } = useProjects();
  const { currentProject, setCurrentProject } = useProject();
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filteredProjects = projects?.filter((project) => {
    if (statusFilter === 'all') return true;
    return project.status === statusFilter;
  });

  const getStatusStyle = (status: ProjectStatus) => {
    switch (status) {
      case 'in-progress':
        return { bg: colors.primary[50], text: colors.primary[600], label: t('projects.inProgress') };
      case 'completed':
        return { bg: colors.success[50], text: colors.success[600], label: t('projects.completed') };
      case 'on-hold':
        return { bg: colors.accent[50], text: colors.accent[600], label: t('projects.onHold') };
      case 'planning':
        return { bg: colors.neutral[100], text: colors.neutral[600], label: t('projects.planning') };
      default:
        return { bg: colors.neutral[100], text: colors.neutral[600], label: status };
    }
  };

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
    router.replace('/(tabs)');
  };

  const renderProject = ({ item: project }: { item: Project }) => {
    const statusStyle = getStatusStyle(project.status);
    const spent = project.actual_spent || 0;
    const budget = project.total_budget || 0;
    const percentage = budget > 0 ? Math.round((spent / budget) * 100) : 0;
    const isSelected = currentProject?.id === project.id;

    return (
      <TouchableOpacity
        style={[styles.projectCard, { backgroundColor: isSelected ? (isDark ? colors.primary[900] : colors.primary[50]) : (isDark ? colors.neutral[800] : '#fff'), borderColor: isSelected ? colors.primary[500] : (isDark ? colors.neutral[700] : colors.neutral[200]) }]}
        onPress={() => handleSelectProject(project)}
        activeOpacity={0.7}
      >
        <View style={styles.projectContent}>
          <View style={styles.projectHeader}>
            <Text style={[styles.projectName, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]} numberOfLines={1}>{project.name}</Text>
            {isSelected ? (
              <View style={styles.checkIcon}>
                <Check size={16} color="#fff" strokeWidth={3} />
              </View>
            ) : null}
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {statusStyle.label}
            </Text>
          </View>

          {project.address && (
            <View style={styles.detailRow}>
              <MapPin size={14} color={isDark ? colors.neutral[400] : colors.neutral[400]} />
              <Text style={[styles.detailText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]} numberOfLines={1}>{project.address}</Text>
            </View>
          )}

          {project.target_completion_date && (
            <View style={styles.detailRow}>
              <Calendar size={14} color={isDark ? colors.neutral[400] : colors.neutral[400]} />
              <Text style={[styles.detailText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                {t('projects.due')} {formatDate(project.target_completion_date, 'long')}
              </Text>
            </View>
          )}

          {budget > 0 && (
            <View style={styles.budgetSection}>
              <View style={styles.budgetInfo}>
                <View style={styles.budgetRow}>
                  <Text style={[styles.budgetSpent, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{formatAmount(spent)}</Text>
                  <Text style={[styles.budgetTotal, { color: isDark ? colors.neutral[400] : colors.neutral[400] }]}> / {formatAmount(budget)}</Text>
                </View>
                <Text style={[styles.budgetLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('expenses.budgetUsed')}</Text>
              </View>
              <CircularProgress
                progress={Math.min(percentage, 100)}
                size={44}
                strokeWidth={4}
                progressColor={spent > budget ? colors.danger[500] : colors.primary[500]}
                trackColor={isDark ? colors.neutral[700] : colors.neutral[200]}
                showPercentage={true}
                textColor={isDark ? colors.neutral[50] : colors.neutral[900]}
                textStyle={{ fontFamily: typography.fontFamily.bodySemibold, fontSize: 11 }}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('projects.title')}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(tabs)/projects/new')}
        >
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Status Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        style={styles.filterScroll}
      >
        {STATUS_FILTERS.map((item) => (
          <TouchableOpacity
            key={item.value}
            style={[
              styles.filterChip,
              { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] },
              statusFilter === item.value && styles.filterChipActive,
            ]}
            onPress={() => setStatusFilter(item.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: isDark ? colors.neutral[300] : colors.neutral[600] },
                statusFilter === item.value && styles.filterChipTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Projects List */}
      {isLoading ? (
        <LoadingSpinner fullScreen message={t('projects.loadingProjects')} />
      ) : !filteredProjects?.length ? (
        <EmptyState
          icon={<FolderOpen size={48} color={isDark ? colors.neutral[600] : colors.neutral[400]} />}
          title={t('projects.noProjectsYet')}
          description={t('projects.createProjectDesc')}
          actionLabel={t('projects.createProject')}
          onAction={() => router.push('/(tabs)/projects/new')}
        />
      ) : (
        <FlatList
          data={filteredProjects}
          keyExtractor={(item) => item.id}
          renderItem={renderProject}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: typography.fontFamily.displayBold,
    color: themeColors.neutral[900],
    letterSpacing: -0.5,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: themeColors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterScroll: {
    flexGrow: 0,
    marginBottom: 16,
  },
  filterContainer: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: themeColors.neutral[200],
  },
  filterChipActive: {
    backgroundColor: themeColors.primary[600],
    borderColor: themeColors.primary[600],
  },
  filterChipText: {
    fontSize: 14,
    color: themeColors.neutral[600],
    fontFamily: typography.fontFamily.bodyMedium,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  list: {
    paddingHorizontal: 20,
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: themeColors.neutral[200],
    overflow: 'hidden',
  },
  projectCardSelected: {
    borderColor: themeColors.primary[500],
    // backgroundColor handled inline for dark mode
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: themeColors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectContent: {
    padding: 16,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectName: {
    fontSize: 18,
    fontFamily: typography.fontFamily.bodySemibold,
    color: themeColors.neutral[900],
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bodySemibold,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.body,
    color: themeColors.neutral[500],
    flex: 1,
  },
  budgetSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: themeColors.neutral[100],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetInfo: {
    flex: 1,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  budgetSpent: {
    fontSize: 16,
    fontFamily: typography.fontFamily.bodySemibold,
    color: themeColors.neutral[900],
  },
  budgetTotal: {
    fontSize: 14,
    fontFamily: typography.fontFamily.body,
    color: themeColors.neutral[400],
  },
  budgetLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamily.body,
    marginTop: 2,
  },
});
