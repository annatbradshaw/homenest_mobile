import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import {
  Plus,
  Star,
  Phone,
  Mail,
  MapPin,
  Building2,
  ChevronLeft,
} from 'lucide-react-native';
import { useProject } from '../../../stores/ProjectContext';
import { useSuppliers } from '../../../hooks/useSuppliers';
import { LoadingSpinner, EmptyState } from '../../../components/ui';
import { colors as themeColors, typography } from '../../../config/theme';
import { useTheme } from '../../../stores/ThemeContext';
import { useLanguage } from '../../../stores/LanguageContext';


const specialtyColors: Record<string, { bg: string; darkBg: string; text: string; darkText: string }> = {
  contractor: { bg: themeColors.primary[50], darkBg: 'rgba(96, 165, 250, 0.2)', text: themeColors.primary[600], darkText: themeColors.primary[400] },
  electrician: { bg: themeColors.accent[50], darkBg: 'rgba(251, 191, 36, 0.2)', text: themeColors.accent[600], darkText: themeColors.accent[400] },
  plumber: { bg: themeColors.success[50], darkBg: 'rgba(52, 211, 153, 0.2)', text: themeColors.success[600], darkText: themeColors.success[400] },
  architect: { bg: '#EEF2FF', darkBg: 'rgba(129, 140, 248, 0.2)', text: '#4F46E5', darkText: '#A5B4FC' },
  designer: { bg: '#FDF2F8', darkBg: 'rgba(244, 114, 182, 0.2)', text: '#DB2777', darkText: '#F472B6' },
  supplier: { bg: '#F0FDF4', darkBg: 'rgba(74, 222, 128, 0.2)', text: '#16A34A', darkText: '#4ADE80' },
  other: { bg: themeColors.neutral[100], darkBg: themeColors.neutral[700], text: themeColors.neutral[600], darkText: themeColors.neutral[300] },
};

export default function SuppliersScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();

  // Define filters inside component to access translations
  const SPECIALTY_FILTERS = [
    { label: t('suppliers.specialties.all'), value: 'all' },
    { label: t('suppliers.specialties.contractor'), value: 'contractor' },
    { label: t('suppliers.specialties.electrician'), value: 'electrician' },
    { label: t('suppliers.specialties.plumber'), value: 'plumber' },
    { label: t('suppliers.specialties.architect'), value: 'architect' },
    { label: t('suppliers.specialties.designer'), value: 'designer' },
  ];

  const { currentProject } = useProject();
  const { data: suppliers, isLoading, refetch } = useSuppliers(currentProject?.id);
  const [refreshing, setRefreshing] = useState(false);
  const [specialtyFilter, setSpecialtyFilter] = useState('all');

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getSpecialtyStyle = (specialty?: string) => {
    const key = specialty?.toLowerCase() || 'other';
    const colorSet = specialtyColors[key] || specialtyColors.other;
    return {
      bg: isDark ? colorSet.darkBg : colorSet.bg,
      text: isDark ? colorSet.darkText : colorSet.text,
    };
  };

  const filteredSuppliers = suppliers?.filter((supplier) => {
    if (specialtyFilter === 'all') return true;
    return supplier.specialty?.toLowerCase() === specialtyFilter;
  });

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={14}
          color={i <= rating ? colors.accent[500] : (isDark ? colors.neutral[600] : colors.neutral[300])}
          fill={i <= rating ? colors.accent[500] : 'transparent'}
        />
      );
    }
    return stars;
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  if (!currentProject) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={isDark ? colors.neutral[50] : colors.neutral[900]} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('suppliers.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <EmptyState
          icon={<Building2 size={48} color={colors.neutral[400]} />}
          title={t('suppliers.noProjectSelected')}
          description={t('suppliers.selectProjectDesc')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={isDark ? colors.neutral[50] : colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('suppliers.title')}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(tabs)/suppliers/add')}
        >
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        style={styles.filterScroll}
      >
        {SPECIALTY_FILTERS.map((item) => (
          <TouchableOpacity
            key={item.value}
            style={[
              styles.filterChip,
              { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] },
              specialtyFilter === item.value && styles.filterChipActive,
            ]}
            onPress={() => setSpecialtyFilter(item.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: isDark ? colors.neutral[400] : colors.neutral[600] },
                specialtyFilter === item.value && styles.filterChipTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.neutral[400]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
              <Text style={[styles.statValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{suppliers?.length || 0}</Text>
              <Text style={[styles.statLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('suppliers.total')}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
              <Text style={[styles.statValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
                {suppliers && suppliers.length > 0
                  ? (suppliers.reduce((sum, s) => sum + (s.rating || 0), 0) / suppliers.length).toFixed(1)
                  : '-'}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('suppliers.avgRating')}</Text>
            </View>
          </View>

          {/* Suppliers List */}
          {!filteredSuppliers || filteredSuppliers.length === 0 ? (
            <EmptyState
              icon={<Building2 size={48} color={colors.neutral[400]} />}
              title={t('suppliers.noSuppliers')}
              description={specialtyFilter === 'all'
                ? t('suppliers.addContractorsDesc')
                : t('suppliers.noSpecialtyFound', { specialty: specialtyFilter })}
              actionLabel={t('suppliers.addSupplier')}
              onAction={() => router.push('/(tabs)/suppliers/add')}
            />
          ) : (
            <View style={styles.suppliersList}>
              {filteredSuppliers.map((supplier) => {
                const specialtyStyle = getSpecialtyStyle(supplier.specialty);
                return (
                  <TouchableOpacity
                    key={supplier.id}
                    style={[styles.supplierCard, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}
                    activeOpacity={0.7}
                  >
                    <View style={styles.supplierHeader}>
                      <View style={styles.supplierInfo}>
                        <Text style={[styles.supplierName, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
                          {supplier.company || supplier.name}
                        </Text>
                        {supplier.company && supplier.name && (
                          <Text style={[styles.contactName, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{supplier.name}</Text>
                        )}
                        {supplier.specialty && (
                          <View style={[styles.badge, { backgroundColor: specialtyStyle.bg }]}>
                            <Text style={[styles.badgeText, { color: specialtyStyle.text }]}>
                              {supplier.specialty}
                            </Text>
                          </View>
                        )}
                        {supplier.rating ? (
                          <View style={styles.ratingRow}>
                            {renderStars(supplier.rating)}
                          </View>
                        ) : null}
                      </View>
                    </View>

                    {(supplier.phone || supplier.email || supplier.address) && (
                      <View style={[styles.contactSection, { borderTopColor: isDark ? colors.accent[500] : colors.accent[400] }]}>
                        {supplier.address && (
                          <View style={styles.addressRow}>
                            <MapPin size={14} color={colors.neutral[400]} />
                            <Text style={[styles.addressText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]} numberOfLines={1}>
                              {supplier.address}
                            </Text>
                          </View>
                        )}

                        <View style={styles.actionRow}>
                          {supplier.phone && (
                            <TouchableOpacity
                              style={[
                                styles.actionButton,
                                {
                                  backgroundColor: isDark ? 'rgba(96, 165, 250, 0.15)' : themeColors.primary[50],
                                  borderWidth: 1,
                                  borderColor: isDark ? 'rgba(96, 165, 250, 0.3)' : themeColors.primary[200],
                                }
                              ]}
                              onPress={() => handleCall(supplier.phone!)}
                            >
                              <Phone size={16} color={isDark ? colors.primary[400] : colors.primary[600]} />
                              <Text style={[styles.actionButtonText, { color: isDark ? colors.primary[400] : colors.primary[600] }]}>{t('suppliers.call')}</Text>
                            </TouchableOpacity>
                          )}
                          {supplier.email && (
                            <TouchableOpacity
                              style={[
                                styles.actionButton,
                                {
                                  backgroundColor: isDark ? 'rgba(96, 165, 250, 0.15)' : themeColors.primary[50],
                                  borderWidth: 1,
                                  borderColor: isDark ? 'rgba(96, 165, 250, 0.3)' : themeColors.primary[200],
                                }
                              ]}
                              onPress={() => handleEmail(supplier.email!)}
                            >
                              <Mail size={16} color={isDark ? colors.primary[400] : colors.primary[600]} />
                              <Text style={[styles.actionButtonText, { color: isDark ? colors.primary[400] : colors.primary[600] }]}>{t('suppliers.email')}</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
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
    flex: 1,
    fontSize: 18,
    fontFamily: typography.fontFamily.bodyMedium,
    color: themeColors.neutral[900],
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: themeColors.neutral[200],
  },
  statValue: {
    fontSize: 24,
    fontFamily: typography.fontFamily.displayBold,
    color: themeColors.neutral[900],
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: typography.fontFamily.body,
    color: themeColors.neutral[500],
    marginTop: 2,
  },
  suppliersList: {
    gap: 12,
  },
  supplierCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: themeColors.neutral[200],
  },
  supplierHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: 16,
    fontFamily: typography.fontFamily.bodySemibold,
    color: themeColors.neutral[900],
  },
  contactName: {
    fontSize: 14,
    fontFamily: typography.fontFamily.body,
    color: themeColors.neutral[500],
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bodySemibold,
    textTransform: 'capitalize',
  },
  contactSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  addressText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.body,
    color: themeColors.neutral[500],
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.bodySemibold,
  },
});
