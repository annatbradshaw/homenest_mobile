import { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wallet, Plus, X, Calendar, ChevronRight, ChevronLeft, Check, Camera, ImageIcon, Trash2 } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useProject } from '../../../stores/ProjectContext';
import { useExpenses, useCreateExpense } from '../../../hooks/useExpenses';
import { useStages } from '../../../hooks/useStages';
import { useSuppliers } from '../../../hooks/useSuppliers';
import { useAuth } from '../../../stores/AuthContext';
import { useTheme } from '../../../stores/ThemeContext';
import { useLanguage } from '../../../stores/LanguageContext';
import { colors as themeColors } from '../../../config/theme';
import { ExpenseStatus } from '../../../types/database';
import { useCurrency } from '../../../stores/CurrencyContext';
import { pickReceiptImage, uploadReceiptImage } from '../../../utils/receiptUpload';

type ModalView = 'form' | 'stage' | 'supplier';

export default function ExpensesScreen() {
  const { openAdd } = useLocalSearchParams<{ openAdd?: string }>();
  const { currentProject } = useProject();
  const { user } = useAuth();
  const { data: expenses, isLoading, refetch } = useExpenses(currentProject?.id);
  const { data: stages } = useStages(currentProject?.id);
  const { data: suppliers } = useSuppliers(currentProject?.id);
  const createExpense = useCreateExpense();
  const { isDark, colors } = useTheme();
  const { t, formatDate } = useLanguage();
  const { formatAmount } = useCurrency();

  // Define filter and category options inside component to access translations
  const STATUS_FILTERS: { label: string; value: ExpenseStatus | 'all' }[] = [
    { label: t('common.all'), value: 'all' },
    { label: t('expenses.pending'), value: 'pending' },
    { label: t('expenses.paid'), value: 'paid' },
  ];

  const EXPENSE_CATEGORIES = [
    { label: t('expenses.categories.labor'), value: 'labor' },
    { label: t('expenses.categories.materials'), value: 'materials' },
    { label: t('expenses.categories.equipment'), value: 'equipment' },
    { label: t('expenses.categories.permits'), value: 'permits' },
    { label: t('expenses.categories.utilities'), value: 'utilities' },
    { label: t('expenses.categories.transportation'), value: 'transportation' },
    { label: t('expenses.categories.other'), value: 'other' },
  ];

  const STATUS_OPTIONS: { label: string; value: ExpenseStatus }[] = [
    { label: t('expenses.pending'), value: 'pending' },
    { label: t('expenses.paid'), value: 'paid' },
  ];

  const PAYMENT_METHODS = [
    { label: t('expenses.paymentMethods.cash'), value: 'cash' },
    { label: t('expenses.paymentMethods.check'), value: 'check' },
    { label: t('expenses.paymentMethods.creditCard'), value: 'credit-card' },
    { label: t('expenses.paymentMethods.bankTransfer'), value: 'bank-transfer' },
    { label: t('expenses.paymentMethods.invoice'), value: 'invoice' },
  ];
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [receiptImageUri, setReceiptImageUri] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // Open modal when navigated with openAdd parameter
  useEffect(() => {
    if (openAdd === 'true') {
      setShowAddModal(true);
      // Clear the parameter from URL
      router.setParams({ openAdd: undefined });
    }
  }, [openAdd]);
  const [modalView, setModalView] = useState<ModalView>('form');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: '',
    status: 'pending' as ExpenseStatus,
    stage_id: '',
    supplier_id: '',
    payment_method: '',
    receipt_url: '',
  });

  const resetForm = () => {
    setFormData({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: '',
      status: 'pending',
      stage_id: '',
      supplier_id: '',
      payment_method: '',
      receipt_url: '',
    });
    setReceiptImageUri(null);
    setModalView('form');
  };

  const handlePickReceipt = async (useCamera: boolean) => {
    const uri = await pickReceiptImage(useCamera);
    if (uri) {
      setReceiptImageUri(uri);
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptImageUri(null);
    setFormData(prev => ({ ...prev, receipt_url: '' }));
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

  const handleCreateExpense = async () => {
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0 || !currentProject || !user) return;

    try {
      let receiptUrl = formData.receipt_url;

      // Upload receipt if selected
      if (receiptImageUri) {
        setUploadingReceipt(true);
        const tenantId = user.user_metadata?.tenant_id || user.id;
        const result = await uploadReceiptImage(
          receiptImageUri,
          tenantId,
          currentProject.id
        );
        setUploadingReceipt(false);

        if (!result.success) {
          Alert.alert(t('common.error'), result.error || t('errors.failedUploadReceipt'));
          return;
        }
        receiptUrl = result.url;
      }

      await createExpense.mutateAsync({
        project_id: currentProject.id,
        amount,
        date: formData.date,
        description: formData.description.trim() || undefined,
        category: formData.category || undefined,
        status: formData.status,
        stage_id: formData.stage_id || undefined,
        supplier_id: formData.supplier_id || undefined,
        payment_method: formData.payment_method || undefined,
        receipt_url: receiptUrl || undefined,
      });
      closeModal();
    } catch (error) {
      setUploadingReceipt(false);
      Alert.alert(t('common.error'), t('errors.failedCreateExpense'));
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: selectedDate.toISOString().split('T')[0]
      }));
    }
  };

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    if (statusFilter === 'all') return expenses;
    return expenses.filter((e) => e.status === statusFilter);
  }, [expenses, statusFilter]);

  const budgetStats = useMemo(() => {
    const budget = currentProject?.total_budget || 0;
    const spent = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
    const remaining = budget - spent;
    const percentage = budget > 0 ? Math.round((spent / budget) * 100) : 0;
    return { budget, spent, remaining, percentage };
  }, [currentProject, expenses]);

  // Get selected names
  const selectedStageName = useMemo(() => {
    if (!formData.stage_id || !stages) return null;
    return stages.find(s => s.id === formData.stage_id)?.name || null;
  }, [formData.stage_id, stages]);

  const selectedSupplierName = useMemo(() => {
    if (!formData.supplier_id || !suppliers) return null;
    return suppliers.find(s => s.id === formData.supplier_id)?.name || null;
  }, [formData.supplier_id, suppliers]);

  if (!currentProject) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('errors.noProjectSelected')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render stage selection view
  const renderStageSelection = () => (
    <View style={styles.selectionContainer}>
      <View style={[styles.selectionHeader, styles.selectionHeaderAmber, { backgroundColor: isDark ? colors.neutral[800] : colors.accent[50], borderBottomColor: isDark ? colors.neutral[700] : colors.accent[100] }]}>
        <TouchableOpacity onPress={() => setModalView('form')} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.accent[600]} />
        </TouchableOpacity>
        <Text style={[styles.selectionTitle, { color: isDark ? colors.neutral[50] : colors.accent[700] }]}>{t('forms.selectStage')}</Text>
        <View style={styles.headerSpacer} />
      </View>
      <FlatList
        data={[{ id: '', name: t('common.none') }, ...(stages || [])]}
        keyExtractor={(item) => item.id || 'none'}
        contentContainerStyle={styles.selectionList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.selectionItem, { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}
            onPress={() => {
              setFormData(prev => ({ ...prev, stage_id: item.id }));
              setModalView('form');
            }}
          >
            <Text style={[styles.selectionItemText, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{item.name}</Text>
            {formData.stage_id === item.id && (
              <Check size={20} color={colors.primary[600]} />
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );

  // Render supplier selection view
  const renderSupplierSelection = () => (
    <View style={styles.selectionContainer}>
      <View style={[styles.selectionHeader, styles.selectionHeaderGreen, { backgroundColor: isDark ? colors.neutral[800] : colors.success[50], borderBottomColor: isDark ? colors.neutral[700] : colors.success[100] }]}>
        <TouchableOpacity onPress={() => setModalView('form')} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.success[600]} />
        </TouchableOpacity>
        <Text style={[styles.selectionTitle, { color: isDark ? colors.neutral[50] : colors.success[700] }]}>{t('forms.selectSupplier')}</Text>
        <View style={styles.headerSpacer} />
      </View>
      <FlatList
        data={[{ id: '', name: t('common.none'), company: '' }, ...(suppliers || [])]}
        keyExtractor={(item) => item.id || 'none'}
        contentContainerStyle={styles.selectionList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.selectionItem, { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}
            onPress={() => {
              setFormData(prev => ({ ...prev, supplier_id: item.id }));
              setModalView('form');
            }}
          >
            <View style={styles.selectionItemContent}>
              <Text style={[styles.selectionItemText, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{item.name}</Text>
              {item.company && (
                <Text style={[styles.selectionItemSubtext, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{item.company}</Text>
              )}
            </View>
            {formData.supplier_id === item.id && (
              <Check size={20} color={colors.primary[600]} />
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );

  // Render form view
  const renderForm = () => (
    <>
      <View style={[styles.modalHeader, { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
        <TouchableOpacity onPress={closeModal}>
          <X size={24} color={isDark ? colors.neutral[400] : colors.neutral[600]} />
        </TouchableOpacity>
        <Text style={[styles.modalTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('expenses.addExpense')}</Text>
        <TouchableOpacity
          onPress={handleCreateExpense}
          disabled={!formData.amount || createExpense.isPending}
        >
          <Text
            style={[
              styles.modalSaveText,
              (!formData.amount || createExpense.isPending) && styles.modalSaveTextDisabled,
            ]}
          >
            {createExpense.isPending ? t('common.saving') : t('common.save')}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Amount */}
          <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.amountRequired')}</Text>
          <TextInput
            style={[styles.textInput, {
              color: isDark ? colors.neutral[50] : colors.neutral[900],
              backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200]
            }]}
            placeholder="0.00"
            placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
            value={formData.amount}
            onChangeText={(text) => setFormData(prev => ({ ...prev, amount: text }))}
            keyboardType="decimal-pad"
          />

          {/* Date */}
          <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.date')}</Text>
          <TouchableOpacity
            style={[styles.selectorButton, {
              backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200]
            }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={18} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
            <Text style={[styles.selectorText, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
              {formatDate(formData.date, 'long')}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={new Date(formData.date)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
            />
          )}

          {/* Description */}
          <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.descriptionLabel')}</Text>
          <TextInput
            style={[styles.textInput, {
              color: isDark ? colors.neutral[50] : colors.neutral[900],
              backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200]
            }]}
            placeholder={t('forms.descriptionPlaceholder')}
            placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          />

          {/* Category */}
          <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.category')}</Text>
          <View style={[styles.segmentedControl, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
            {EXPENSE_CATEGORIES.slice(0, 4).map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.segmentItem,
                  formData.category === cat.value && styles.segmentItemActive,
                ]}
                onPress={() => setFormData(prev => ({
                  ...prev,
                  category: prev.category === cat.value ? '' : cat.value
                }))}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                    formData.category === cat.value && [styles.segmentTextActive, { color: isDark ? colors.neutral[50] : colors.neutral[900] }],
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[styles.segmentedControl, { marginTop: 8, backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
            {EXPENSE_CATEGORIES.slice(4).map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.segmentItem,
                  formData.category === cat.value && styles.segmentItemActive,
                ]}
                onPress={() => setFormData(prev => ({
                  ...prev,
                  category: prev.category === cat.value ? '' : cat.value
                }))}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                    formData.category === cat.value && [styles.segmentTextActive, { color: isDark ? colors.neutral[50] : colors.neutral[900] }],
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Status */}
          <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.status')}</Text>
          <View style={[styles.segmentedControl, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
            {STATUS_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.segmentItem,
                  formData.status === option.value && styles.segmentItemActive,
                ]}
                onPress={() => setFormData(prev => ({ ...prev, status: option.value }))}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                    formData.status === option.value && [styles.segmentTextActive, { color: isDark ? colors.neutral[50] : colors.neutral[900] }],
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Stage */}
          <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.linkToStage')}</Text>
          <TouchableOpacity
            style={[styles.selectorButton, {
              backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200]
            }]}
            onPress={() => setModalView('stage')}
          >
            <Text style={selectedStageName ? [styles.selectorText, { color: isDark ? colors.neutral[50] : colors.neutral[900] }] : [styles.selectorPlaceholder, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>
              {selectedStageName || t('forms.selectStage')}
            </Text>
            <ChevronRight size={18} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
          </TouchableOpacity>

          {/* Supplier */}
          <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.supplier')}</Text>
          <TouchableOpacity
            style={[styles.selectorButton, {
              backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200]
            }]}
            onPress={() => setModalView('supplier')}
          >
            <Text style={selectedSupplierName ? [styles.selectorText, { color: isDark ? colors.neutral[50] : colors.neutral[900] }] : [styles.selectorPlaceholder, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>
              {selectedSupplierName || t('forms.selectSupplier')}
            </Text>
            <ChevronRight size={18} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
          </TouchableOpacity>

          {/* Payment Method */}
          <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.paymentMethod')}</Text>
          <View style={[styles.segmentedControl, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.value}
                style={[
                  styles.segmentItem,
                  formData.payment_method === method.value && styles.segmentItemActive,
                ]}
                onPress={() => setFormData(prev => ({
                  ...prev,
                  payment_method: prev.payment_method === method.value ? '' : method.value
                }))}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                    formData.payment_method === method.value && [styles.segmentTextActive, { color: isDark ? colors.neutral[50] : colors.neutral[900] }],
                  ]}
                  numberOfLines={1}
                >
                  {method.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Receipt Upload */}
          <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('expenses.receipt')}</Text>
          {receiptImageUri ? (
            <View style={[styles.receiptPreviewContainer, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
              <Image source={{ uri: receiptImageUri }} style={styles.receiptPreview} />
              <TouchableOpacity
                style={styles.removeReceiptButton}
                onPress={handleRemoveReceipt}
              >
                <Trash2 size={16} color={colors.danger[600]} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.receiptButtons}>
              <TouchableOpacity
                style={[styles.receiptButton, {
                  backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                  borderColor: isDark ? colors.neutral[700] : colors.neutral[200]
                }]}
                onPress={() => handlePickReceipt(true)}
              >
                <Camera size={20} color={isDark ? colors.neutral[400] : colors.neutral[600]} />
                <Text style={[styles.receiptButtonText, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>{t('expenses.takePhoto')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.receiptButton, {
                  backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                  borderColor: isDark ? colors.neutral[700] : colors.neutral[200]
                }]}
                onPress={() => handlePickReceipt(false)}
              >
                <ImageIcon size={20} color={isDark ? colors.neutral[400] : colors.neutral[600]} />
                <Text style={[styles.receiptButtonText, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>{t('expenses.fromLibrary')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {uploadingReceipt && (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="small" color={colors.primary[600]} />
              <Text style={[styles.uploadingText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('expenses.uploadingReceipt')}</Text>
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
          <Text style={[styles.title, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('expenses.title')}</Text>
          <Text style={[styles.subtitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{formatAmount(budgetStats.remaining)} {t('expenses.remaining')}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.neutral[400]} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Budget Overview */}
        <View style={styles.budgetCard}>
          <View style={styles.budgetRow}>
            <View style={styles.budgetItem}>
              <Text style={styles.budgetLabel}>{t('expenses.totalBudget')}</Text>
              <Text style={styles.budgetValue}>{formatAmount(budgetStats.budget)}</Text>
            </View>
            <View style={styles.budgetItem}>
              <Text style={styles.budgetLabel}>{t('expenses.spent')}</Text>
              <Text style={styles.budgetValue}>{formatAmount(budgetStats.spent)}</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(budgetStats.percentage, 100)}%`,
                  backgroundColor: budgetStats.percentage > 100 ? colors.danger[500] : '#fff',
                },
              ]}
            />
          </View>
          <Text style={styles.percentageText}>{budgetStats.percentage}{t('expenses.budgetUsed')}</Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterSection}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('tabs.expenses')}</Text>
          <View style={styles.filterRow}>
            {STATUS_FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter.value}
                style={[styles.filterTab, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }, statusFilter === filter.value && styles.filterTabActive]}
                onPress={() => setStatusFilter(filter.value)}
              >
                <Text style={[styles.filterText, { color: isDark ? colors.neutral[400] : colors.neutral[600] }, statusFilter === filter.value && styles.filterTextActive]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Expenses List */}
        {filteredExpenses.length > 0 ? (
          <View style={[styles.expenseList, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
            {filteredExpenses.map((expense) => (
              <TouchableOpacity key={expense.id} style={[styles.expenseItem, { borderBottomColor: isDark ? colors.neutral[700] : colors.neutral[100] }]} onPress={() => router.push(`/(tabs)/expenses/${expense.id}`)}>
                <View style={styles.expenseInfo}>
                  <Text style={[styles.expenseDescription, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]} numberOfLines={1}>
                    {expense.description || expense.category || t('expenses.expense')}
                  </Text>
                  <Text style={[styles.expenseDate, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                    {formatDate(expense.date, 'short')}
                    {expense.category && ` · ${expense.category}`}
                  </Text>
                </View>
                <View style={styles.expenseRight}>
                  <Text style={[styles.expenseAmount, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{formatAmount(expense.amount)}</Text>
                  <Text style={[styles.expenseStatus, expense.status === 'paid' && styles.statusPaid]}>
                    {expense.status}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
              <Wallet size={28} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
            </View>
            <Text style={[styles.emptyStateTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('expenses.noExpenses')}</Text>
            <Text style={[styles.emptyStateText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
              {t('expenses.noExpensesDesc')}
            </Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: isDark ? colors.neutral[900] : '#fff' }]}>
          {modalView === 'form' && renderForm()}
          {modalView === 'stage' && renderStageSelection()}
          {modalView === 'supplier' && renderSupplierSelection()}
        </SafeAreaView>
      </Modal>
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
    paddingBottom: 20,
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
  },
  emptyTitle: {
    fontSize: 16,
    color: themeColors.neutral[500],
  },
  budgetCard: {
    backgroundColor: themeColors.primary[600],
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  budgetItem: {},
  budgetLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  budgetValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  percentageText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  filterSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: themeColors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
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
  expenseList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themeColors.neutral[200],
    overflow: 'hidden',
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.neutral[100],
  },
  expenseInfo: {
    flex: 1,
    marginRight: 16,
  },
  expenseDescription: {
    fontSize: 15,
    fontWeight: '500',
    color: themeColors.neutral[900],
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 13,
    color: themeColors.neutral[500],
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: themeColors.neutral[900],
    marginBottom: 4,
  },
  expenseStatus: {
    fontSize: 12,
    color: themeColors.neutral[500],
    textTransform: 'capitalize',
  },
  statusPaid: {
    color: themeColors.success[600],
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
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: themeColors.neutral[100],
    borderRadius: 12,
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
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
  selectionHeaderAmber: {
    backgroundColor: themeColors.accent[50],
    borderBottomColor: themeColors.accent[100],
  },
  selectionHeaderGreen: {
    backgroundColor: themeColors.success[50],
    borderBottomColor: themeColors.success[100],
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
  // Receipt upload styles
  receiptButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  receiptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: themeColors.neutral[50],
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: themeColors.neutral[200],
    borderStyle: 'dashed',
  },
  receiptButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: themeColors.neutral[600],
  },
  receiptPreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: themeColors.neutral[100],
  },
  receiptPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removeReceiptButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 8,
  },
  uploadingText: {
    fontSize: 14,
    color: themeColors.neutral[500],
  },
});
