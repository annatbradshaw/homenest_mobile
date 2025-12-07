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
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  Layers,
  User,
  CreditCard,
  Trash2,
  Clock,
  CheckCircle2,
  X,
  Check,
  Camera,
  ImageIcon,
} from 'lucide-react-native';
import { useExpenses, useUpdateExpense, useDeleteExpense } from '../../../hooks/useExpenses';
import { useStages } from '../../../hooks/useStages';
import { useSuppliers } from '../../../hooks/useSuppliers';
import { useProject } from '../../../stores/ProjectContext';
import { useAuth } from '../../../stores/AuthContext';
import { useTheme } from '../../../stores/ThemeContext';
import { useLanguage } from '../../../stores/LanguageContext';
import { colors as themeColors } from '../../../config/theme';
import { ExpenseStatus } from '../../../types/database';
import { useCurrency } from '../../../stores/CurrencyContext';
import { pickReceiptImage, uploadReceiptImage } from '../../../utils/receiptUpload';

type EditView = 'form' | 'stage' | 'supplier';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentProject } = useProject();
  const { user } = useAuth();
  const { isDark, colors } = useTheme();
  const { t, formatDate } = useLanguage();
  const { formatAmount } = useCurrency();

  // Define options inside component to access translations
  const STATUS_OPTIONS: { label: string; value: ExpenseStatus; icon: any }[] = [
    { label: t('expenses.pending'), value: 'pending', icon: Clock },
    { label: t('expenses.paid'), value: 'paid', icon: CheckCircle2 },
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

  const PAYMENT_METHODS = [
    { label: t('expenses.paymentMethods.cash'), value: 'cash' },
    { label: t('expenses.paymentMethods.check'), value: 'check' },
    { label: t('expenses.paymentMethods.creditCard'), value: 'credit-card' },
    { label: t('expenses.paymentMethods.bankTransfer'), value: 'bank-transfer' },
    { label: t('expenses.paymentMethods.invoice'), value: 'invoice' },
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

  const PAYMENT_METHOD_LABELS: Record<string, string> = {
    cash: t('expenses.paymentMethods.cash'),
    check: t('expenses.paymentMethods.check'),
    'credit-card': t('expenses.paymentMethods.creditCard'),
    'bank-transfer': t('expenses.paymentMethods.bankTransfer'),
    invoice: t('expenses.paymentMethods.invoice'),
  };

  const { data: expenses } = useExpenses(currentProject?.id);
  const { data: stages } = useStages(currentProject?.id);
  const { data: suppliers } = useSuppliers(currentProject?.id);
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const expense = expenses?.find(e => e.id === id);
  const [isEditing, setIsEditing] = useState(false);
  const [editView, setEditView] = useState<EditView>('form');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [receiptImageUri, setReceiptImageUri] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // Form data state
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

  // Update form data when expense loads
  useEffect(() => {
    if (expense) {
      setFormData({
        amount: expense.amount?.toString() || '',
        date: expense.date || new Date().toISOString().split('T')[0],
        description: expense.description || '',
        category: expense.category || '',
        status: expense.status || 'pending',
        stage_id: expense.stage_id || '',
        supplier_id: expense.supplier_id || '',
        payment_method: expense.payment_method || '',
        receipt_url: expense.receipt_url || '',
      });
    }
  }, [expense]);

  // Get selected names
  const selectedStageName = useMemo(() => {
    if (!formData.stage_id || !stages) return null;
    return stages.find(s => s.id === formData.stage_id)?.name || null;
  }, [formData.stage_id, stages]);

  const selectedSupplierName = useMemo(() => {
    if (!formData.supplier_id || !suppliers) return null;
    return suppliers.find(s => s.id === formData.supplier_id)?.name || null;
  }, [formData.supplier_id, suppliers]);

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

  const handleSave = async () => {
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert(t('common.error'), t('errors.invalidAmount'));
      return;
    }
    try {
      let receiptUrl = formData.receipt_url;

      // Upload new receipt if selected
      if (receiptImageUri && user) {
        setUploadingReceipt(true);
        const tenantId = user.user_metadata?.tenant_id || user.id;
        const result = await uploadReceiptImage(
          receiptImageUri,
          tenantId,
          currentProject?.id || ''
        );
        setUploadingReceipt(false);

        if (!result.success) {
          Alert.alert(t('common.error'), result.error || t('errors.failedUploadReceipt'));
          return;
        }
        receiptUrl = result.url;
      }

      await updateExpense.mutateAsync({
        id: expense.id,
        updates: {
          amount,
          date: formData.date,
          description: formData.description.trim() || null,
          category: formData.category || null,
          status: formData.status,
          stage_id: formData.stage_id || null,
          supplier_id: formData.supplier_id || null,
          payment_method: formData.payment_method || null,
          receipt_url: receiptUrl || null,
        },
      });
      setReceiptImageUri(null);
      setIsEditing(false);
      setEditView('form');
    } catch (error) {
      setUploadingReceipt(false);
      Alert.alert(t('common.error'), t('errors.failedUpdateExpense'));
    }
  };

  const handleCancel = () => {
    // Reset form to expense values
    if (expense) {
      setFormData({
        amount: expense.amount?.toString() || '',
        date: expense.date || new Date().toISOString().split('T')[0],
        description: expense.description || '',
        category: expense.category || '',
        status: expense.status || 'pending',
        stage_id: expense.stage_id || '',
        supplier_id: expense.supplier_id || '',
        payment_method: expense.payment_method || '',
        receipt_url: expense.receipt_url || '',
      });
    }
    setReceiptImageUri(null);
    setIsEditing(false);
    setEditView('form');
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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: selectedDate.toISOString().split('T')[0]
      }));
    }
  };

  const getStatusStyle = (status: ExpenseStatus) => {
    if (isDark) {
      switch (status) {
        case 'paid':
          return { bg: `${colors.success[500]}25`, text: colors.success[400] };
        default:
          return { bg: `${colors.accent[500]}25`, text: colors.accent[400] };
      }
    }
    switch (status) {
      case 'paid':
        return { bg: colors.success[50], text: colors.success[600] };
      default:
        return { bg: colors.accent[50], text: colors.accent[600] };
    }
  };

  const statusStyle = getStatusStyle(expense.status);

  // Render stage selection view
  const renderStageSelection = () => (
    <View style={styles.selectionContainer}>
      <View style={[styles.selectionHeader, { backgroundColor: isDark ? colors.accent[900] : colors.accent[50], borderBottomColor: isDark ? colors.accent[800] : colors.accent[100] }]}>
        <TouchableOpacity onPress={() => setEditView('form')} style={styles.selectionBackButton}>
          <ChevronLeft size={24} color={isDark ? colors.accent[400] : colors.accent[600]} />
        </TouchableOpacity>
        <Text style={[styles.selectionTitle, { color: isDark ? colors.accent[400] : colors.accent[700] }]}>{t('forms.selectStage')}</Text>
        <View style={styles.headerSpacer} />
      </View>
      <FlatList
        data={[{ id: '', name: t('common.none') }, ...(stages || [])]}
        keyExtractor={(item) => item.id || 'none'}
        contentContainerStyle={styles.selectionList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.selectionItem, { borderBottomColor: isDark ? colors.neutral[700] : colors.neutral[100] }]}
            onPress={() => {
              setFormData(prev => ({ ...prev, stage_id: item.id }));
              setEditView('form');
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
      <View style={[styles.selectionHeader, { backgroundColor: isDark ? colors.success[900] : colors.success[50], borderBottomColor: isDark ? colors.success[800] : colors.success[100] }]}>
        <TouchableOpacity onPress={() => setEditView('form')} style={styles.selectionBackButton}>
          <ChevronLeft size={24} color={isDark ? colors.success[400] : colors.success[600]} />
        </TouchableOpacity>
        <Text style={[styles.selectionTitle, { color: isDark ? colors.success[400] : colors.success[700] }]}>{t('forms.selectSupplier')}</Text>
        <View style={styles.headerSpacer} />
      </View>
      <FlatList
        data={[{ id: '', name: t('common.none'), company: '' }, ...(suppliers || [])]}
        keyExtractor={(item) => item.id || 'none'}
        contentContainerStyle={styles.selectionList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.selectionItem, { borderBottomColor: isDark ? colors.neutral[700] : colors.neutral[100] }]}
            onPress={() => {
              setFormData(prev => ({ ...prev, supplier_id: item.id }));
              setEditView('form');
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

  // Render edit form
  const renderEditForm = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
          <ChevronLeft size={24} color={isDark ? colors.neutral[50] : colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('forms.editExpense')}</Text>
        <TouchableOpacity onPress={handleSave} disabled={updateExpense.isPending || uploadingReceipt}>
          <Text style={[styles.saveButton, (updateExpense.isPending || uploadingReceipt) && { opacity: 0.5 }]}>
            {updateExpense.isPending || uploadingReceipt ? t('common.saving') : t('common.save')}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Amount */}
          <View style={styles.section}>
            <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.amountRequired')}</Text>
            <TextInput
              style={[styles.textInput, {
                backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                color: isDark ? colors.neutral[50] : colors.neutral[900]
              }]}
              placeholder="0.00"
              placeholderTextColor={colors.neutral[400]}
              value={formData.amount}
              onChangeText={(text) => setFormData(prev => ({ ...prev, amount: text }))}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Date */}
          <View style={styles.section}>
            <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.date')}</Text>
            <TouchableOpacity
              style={[styles.selectorButton, {
                backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                borderColor: isDark ? colors.neutral[700] : colors.neutral[200]
              }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={18} color={colors.neutral[400]} />
              <Text style={[styles.selectorText, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
                {formatDate(formData.date, 'long')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.descriptionLabel')}</Text>
            <TextInput
              style={[styles.textInput, {
                backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                color: isDark ? colors.neutral[50] : colors.neutral[900]
              }]}
              placeholder={t('forms.descriptionPlaceholder')}
              placeholderTextColor={colors.neutral[400]}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.category')}</Text>
            <View style={[styles.segmentedControl, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
              {EXPENSE_CATEGORIES.slice(0, 4).map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.segmentItem,
                    formData.category === cat.value && [styles.segmentItemActive, { backgroundColor: isDark ? colors.neutral[700] : '#fff' }],
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
                    formData.category === cat.value && [styles.segmentItemActive, { backgroundColor: isDark ? colors.neutral[700] : '#fff' }],
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
          </View>

          {/* Status */}
          <View style={styles.section}>
            <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.status')}</Text>
            <View style={styles.statusOptions}>
              {STATUS_OPTIONS.map((option) => {
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
                      size={18}
                      color={isActive ? (isDark ? colors.primary[400] : colors.primary[600]) : colors.neutral[400]}
                    />
                    <Text style={[
                      styles.statusOptionText,
                      { color: isDark ? colors.neutral[400] : colors.neutral[600] },
                      isActive && { color: isDark ? colors.primary[400] : colors.primary[700] }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Stage */}
          <View style={styles.section}>
            <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.linkToStage')}</Text>
            <TouchableOpacity
              style={[styles.selectorButton, {
                backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                borderColor: isDark ? colors.neutral[700] : colors.neutral[200]
              }]}
              onPress={() => setEditView('stage')}
            >
              <Layers size={18} color={colors.neutral[400]} />
              <Text style={[
                selectedStageName ? styles.selectorText : styles.selectorPlaceholder,
                selectedStageName && { color: isDark ? colors.neutral[50] : colors.neutral[900] }
              ]}>
                {selectedStageName || t('forms.selectStage')}
              </Text>
              <ChevronRight size={18} color={colors.neutral[400]} />
            </TouchableOpacity>
          </View>

          {/* Supplier */}
          <View style={styles.section}>
            <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.supplier')}</Text>
            <TouchableOpacity
              style={[styles.selectorButton, {
                backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                borderColor: isDark ? colors.neutral[700] : colors.neutral[200]
              }]}
              onPress={() => setEditView('supplier')}
            >
              <User size={18} color={colors.neutral[400]} />
              <Text style={[
                selectedSupplierName ? styles.selectorText : styles.selectorPlaceholder,
                selectedSupplierName && { color: isDark ? colors.neutral[50] : colors.neutral[900] }
              ]}>
                {selectedSupplierName || t('forms.selectSupplier')}
              </Text>
              <ChevronRight size={18} color={colors.neutral[400]} />
            </TouchableOpacity>
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('forms.paymentMethod')}</Text>
            <View style={[styles.segmentedControl, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
              {PAYMENT_METHODS.map((method) => (
                <TouchableOpacity
                  key={method.value}
                  style={[
                    styles.segmentItem,
                    formData.payment_method === method.value && [styles.segmentItemActive, { backgroundColor: isDark ? colors.neutral[700] : '#fff' }],
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
          </View>

          {/* Receipt Upload */}
          <View style={styles.section}>
            <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('expenses.receipt')}</Text>
            {(receiptImageUri || formData.receipt_url) ? (
              <View style={[styles.receiptPreviewContainer, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                <Image source={{ uri: receiptImageUri || formData.receipt_url }} style={styles.receiptPreview} />
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
          </View>

          {uploadingReceipt && (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="small" color={colors.primary[600]} />
              <Text style={[styles.uploadingText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('expenses.uploadingReceipt')}</Text>
            </View>
          )}

          {/* Delete Button */}
          <View style={styles.section}>
            <TouchableOpacity style={[styles.deleteButton, { backgroundColor: isDark ? `${colors.danger[500]}15` : colors.danger[50], borderColor: isDark ? colors.danger[800] : colors.danger[200] }]} onPress={handleDelete}>
              <Trash2 size={18} color={isDark ? colors.danger[400] : colors.danger[600]} />
              <Text style={[styles.deleteButtonText, { color: isDark ? colors.danger[400] : colors.danger[600] }]}>{t('expenses.deleteExpense')}</Text>
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
              value={new Date(formData.date)}
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
            value={new Date(formData.date)}
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
        <Text style={[styles.headerTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{t('expenses.expenseDetails')}</Text>
        <TouchableOpacity onPress={() => setIsEditing(true)}>
          <Text style={styles.editButtonText}>{t('common.edit')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Amount & Description */}
        <View style={styles.section}>
          <Text style={[styles.expenseAmount, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>{formatAmount(expense.amount)}</Text>
          <Text style={[styles.expenseDescription, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
            {expense.description || expense.category || t('expenses.expense')}
          </Text>
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
                  {PAYMENT_METHOD_LABELS[expense.payment_method] || expense.payment_method}
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

        {/* Receipt */}
        {expense.receipt_url && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{t('expenses.receipt')}</Text>
            <View style={[styles.receiptPreviewContainer, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
              <Image source={{ uri: expense.receipt_url }} style={styles.receiptPreview} />
            </View>
          </View>
        )}

        {/* Delete Button */}
        <View style={styles.section}>
          <TouchableOpacity style={[styles.deleteButton, { backgroundColor: isDark ? `${colors.danger[500]}15` : colors.danger[50], borderColor: isDark ? colors.danger[800] : colors.danger[200] }]} onPress={handleDelete}>
            <Trash2 size={18} color={isDark ? colors.danger[400] : colors.danger[600]} />
            <Text style={[styles.deleteButtonText, { color: isDark ? colors.danger[400] : colors.danger[600] }]}>{t('expenses.deleteExpense')}</Text>
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
        editView === 'stage' ? renderStageSelection() :
        renderSupplierSelection()
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
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: themeColors.neutral[100],
  },
  categoryText: {
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
  statusOptionText: {
    fontSize: 15,
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
    paddingHorizontal: 20,
  },
  uploadingText: {
    fontSize: 14,
    color: themeColors.neutral[500],
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
