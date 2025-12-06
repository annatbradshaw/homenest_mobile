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
  DollarSign,
  Layers,
  User,
  CreditCard,
  Trash2,
  Clock,
  CheckCircle2,
} from 'lucide-react-native';
import { useExpenses, useUpdateExpense, useDeleteExpense } from '../../../hooks/useExpenses';
import { useStages } from '../../../hooks/useStages';
import { useSuppliers } from '../../../hooks/useSuppliers';
import { useProject } from '../../../stores/ProjectContext';
import { useTheme } from '../../../stores/ThemeContext';
import { useLanguage } from '../../../stores/LanguageContext';
import { colors as themeColors } from '../../../config/theme';
import { ExpenseStatus } from '../../../types/database';
import { useCurrency } from '../../../stores/CurrencyContext';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentProject } = useProject();
  const { isDark, colors } = useTheme();
  const { t, formatDate } = useLanguage();
  const { formatAmount } = useCurrency();

  // Define options inside component to access translations
  const STATUS_OPTIONS: { label: string; value: ExpenseStatus; icon: any }[] = [
    { label: t('expenses.pending'), value: 'pending', icon: Clock },
    { label: t('expenses.paid'), value: 'paid', icon: CheckCircle2 },
  ];

  const CATEGORY_LABELS: Record<string, string> = {
    labor: t('expenses.categories.labor'),
    materials: t('expenses.categories.materials'),
    equipment: t('expenses.categories.equipment'),
    permits: t('expenses.categories.permits'),
    utilities: t('expenses.categories.utilities'),
    transportation: t('expenses.categories.transportation'),
    other: t('expenses.categories.other'),
  };

  const { data: expenses } = useExpenses(currentProject?.id);
  const { data: stages } = useStages(currentProject?.id);
  const { data: suppliers } = useSuppliers(currentProject?.id);
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const expense = expenses?.find(e => e.id === id);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(expense?.description || '');
  const [editedAmount, setEditedAmount] = useState(expense?.amount?.toString() || '');

  if (!expense) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={isDark ? colors.neutral[50] : colors.neutral[900]} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('expenses.expense')}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('expenses.expenseNotFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const linkedStage = stages?.find(s => s.id === expense.stage_id);
  const linkedSupplier = suppliers?.find(s => s.id === expense.supplier_id);

  const handleStatusChange = async (newStatus: ExpenseStatus) => {
    try {
      await updateExpense.mutateAsync({
        id: expense.id,
        updates: { status: newStatus },
      });
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.failedUpdateStatus'));
    }
  };

  const handleSave = async () => {
    const amount = parseFloat(editedAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert(t('common.error'), t('errors.invalidAmount'));
      return;
    }
    try {
      await updateExpense.mutateAsync({
        id: expense.id,
        updates: {
          description: editedDescription.trim() || null,
          amount,
        },
      });
      setIsEditing(false);
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.failedUpdateExpense'));
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('alerts.deleteExpenseTitle'),
      t('alerts.deleteExpenseMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpense.mutateAsync(expense.id);
              router.back();
            } catch (error) {
              Alert.alert(t('common.error'), t('errors.failedDeleteExpense'));
            }
          },
        },
      ]
    );
  };

  const getStatusStyle = (status: ExpenseStatus) => {
    switch (status) {
      case 'paid':
        return { bg: colors.success[50], text: colors.success[600] };
      default:
        return { bg: colors.accent[50], text: colors.accent[600] };
    }
  };

  const statusStyle = getStatusStyle(expense.status);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={isDark ? colors.neutral[50] : colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('expenses.expenseDetails')}</Text>
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
        {/* Amount & Description */}
        <View style={styles.section}>
          {isEditing ? (
            <>
              <View style={styles.amountInputRow}>
                <Text style={[styles.currencySymbol, { color: isDark ? colors.neutral[400] : colors.neutral[400] }]}>$</Text>
                <TextInput
                  style={[styles.amountInput, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}
                  value={editedAmount}
                  onChangeText={setEditedAmount}
                  placeholder="0.00"
                  placeholderTextColor={colors.neutral[400]}
                  keyboardType="decimal-pad"
                />
              </View>
              <TextInput
                style={[styles.descriptionInput, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}
                value={editedDescription}
                onChangeText={setEditedDescription}
                placeholder={t('expenses.addDescription')}
                placeholderTextColor={colors.neutral[400]}
                multiline
              />
            </>
          ) : (
            <>
              <Text style={[styles.expenseAmount, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{formatAmount(expense.amount)}</Text>
              <Text style={[styles.expenseDescription, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                {expense.description || expense.category || t('expenses.expense')}
              </Text>
            </>
          )}
          <View style={styles.badges}>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {expense.status === 'paid' ? t('expenses.paid') : t('expenses.pending')}
              </Text>
            </View>
            {expense.category && (
              <View style={[styles.categoryBadge, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                <Text style={[styles.categoryText, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                  {CATEGORY_LABELS[expense.category] || expense.category}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Status Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.status')}</Text>
          <View style={styles.statusOptions}>
            {STATUS_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = expense.status === option.value;
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
                    color={isActive ? colors.primary[600] : colors.neutral[400]}
                  />
                  <Text style={[
                    styles.statusOptionText,
                    { color: isDark ? colors.neutral[400] : colors.neutral[600] },
                    isActive && styles.statusOptionTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.date')}</Text>
          <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
            <View style={styles.cardRow}>
              <Calendar size={18} color={colors.neutral[400]} />
              <Text style={[styles.cardValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
                {formatDate(expense.date, 'long')}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        {expense.payment_method && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.paymentMethod')}</Text>
            <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
              <View style={styles.cardRow}>
                <CreditCard size={18} color={colors.neutral[400]} />
                <Text style={[styles.cardValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
                  {expense.payment_method.replace('-', ' ')}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Linked Stage */}
        {linkedStage && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('expenses.linkedStage')}</Text>
            <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
              <TouchableOpacity
                style={styles.cardRow}
                onPress={() => router.push(`/(tabs)/stages/${linkedStage.id}`)}
              >
                <Layers size={18} color={colors.neutral[400]} />
                <Text style={[styles.cardValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{linkedStage.name}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Supplier */}
        {linkedSupplier && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.supplier')}</Text>
            <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
              <View style={styles.cardRow}>
                <User size={18} color={colors.neutral[400]} />
                <View style={styles.cardRowContent}>
                  <Text style={[styles.cardValue, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{linkedSupplier.name}</Text>
                  {linkedSupplier.company && (
                    <Text style={[styles.cardLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{linkedSupplier.company}</Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Delete Button */}
        <View style={styles.section}>
          <TouchableOpacity style={[styles.deleteButton, { backgroundColor: isDark ? colors.danger[900] : colors.danger[50], borderColor: isDark ? colors.danger[700] : colors.danger[200] }]} onPress={handleDelete}>
            <Trash2 size={18} color={colors.danger[600]} />
            <Text style={styles.deleteButtonText}>{t('expenses.deleteExpense')}</Text>
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
  expenseAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: themeColors.neutral[900],
    marginBottom: 8,
    letterSpacing: -1,
  },
  expenseDescription: {
    fontSize: 18,
    color: themeColors.neutral[600],
    marginBottom: 12,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '700',
    color: themeColors.neutral[400],
    marginRight: 4,
  },
  amountInput: {
    fontSize: 36,
    fontWeight: '700',
    color: themeColors.neutral[900],
    flex: 1,
    padding: 0,
  },
  descriptionInput: {
    fontSize: 18,
    color: themeColors.neutral[600],
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
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: themeColors.neutral[100],
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: themeColors.neutral[600],
    textTransform: 'capitalize',
  },
  statusOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  statusOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: themeColors.neutral[200],
  },
  statusOptionActive: {
    backgroundColor: themeColors.primary[50],
    borderColor: themeColors.primary[300],
  },
  statusOptionText: {
    fontSize: 15,
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
    textTransform: 'capitalize',
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
