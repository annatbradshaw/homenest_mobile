import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ChevronLeft,
  Plus,
  Mail,
  User,
  Shield,
  Crown,
  Briefcase,
  Eye,
  X,
  Send,
  Building2,
  ChevronDown,
  Check,
} from 'lucide-react-native';
import { useTheme } from '../../../stores/ThemeContext';
import { useLanguage } from '../../../stores/LanguageContext';
import { useTeamMembers } from '../../../hooks/useTeamMembers';
import { useAuth } from '../../../stores/AuthContext';
import { useProject } from '../../../stores/ProjectContext';
import { useSuppliers } from '../../../hooks/useSuppliers';
import { useInviteToProject } from '../../../hooks/useInviteToProject';
import { MemberRole, Supplier } from '../../../types/database';
import { typography } from '../../../config/theme';

const ROLE_CONFIG: Record<MemberRole, { icon: any; color: string; darkColor: string }> = {
  owner: { icon: Crown, color: '#F59E0B', darkColor: '#FBBF24' },
  admin: { icon: Shield, color: '#8B5CF6', darkColor: '#A78BFA' },
  manager: { icon: Briefcase, color: '#3B82F6', darkColor: '#60A5FA' },
  contractor: { icon: User, color: '#10B981', darkColor: '#34D399' },
  viewer: { icon: Eye, color: '#6B7280', darkColor: '#9CA3AF' },
};

export default function TeamScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const { data: members, isLoading, refetch } = useTeamMembers();
  const { user } = useAuth();
  const { currentProject } = useProject();
  const { data: suppliers } = useSuppliers(currentProject?.id);
  const inviteMutation = useInviteToProject();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<MemberRole>('viewer');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [showSupplierPicker, setShowSupplierPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const getRoleIcon = (role: string) => {
    const config = ROLE_CONFIG[role as MemberRole] || ROLE_CONFIG.viewer;
    const IconComponent = config.icon;
    return <IconComponent size={16} color={isDark ? config.darkColor : config.color} />;
  };

  const getRoleLabel = (role: string) => {
    return t(`team.roles.${role}`) || role;
  };

  const getSelectedSupplier = (): Supplier | undefined => {
    return suppliers?.find(s => s.id === selectedSupplierId);
  };

  const resetInviteForm = () => {
    setShowInviteModal(false);
    setInviteEmail('');
    setInviteRole('viewer');
    setSelectedSupplierId(null);
    setShowSupplierPicker(false);
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert(t('common.error'), t('team.enterEmail'));
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      Alert.alert(t('common.error'), t('errors.invalidEmail'));
      return;
    }

    // Require supplier selection for contractor role
    if (inviteRole === 'contractor' && !selectedSupplierId) {
      Alert.alert(t('common.error'), t('team.selectSupplierRequired'));
      return;
    }

    setIsSending(true);
    try {
      await inviteMutation.mutateAsync({
        email: inviteEmail.trim(),
        role: inviteRole,
        linkedSupplierId: inviteRole === 'contractor' ? selectedSupplierId || undefined : undefined,
      });

      Alert.alert(
        t('team.inviteSent'),
        t('team.inviteSentDesc', { email: inviteEmail.trim() }),
        [{ text: t('common.ok'), onPress: resetInviteForm }]
      );
      refetch();
    } catch (error: any) {
      const message = error?.message || t('team.inviteFailed');
      Alert.alert(t('common.error'), message);
    } finally {
      setIsSending(false);
    }
  };

  const currentUserRole = members?.find(m => m.user_id === user?.id)?.role;
  const canInvite = currentUserRole === 'owner' || currentUserRole === 'admin';

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={isDark ? colors.neutral[50] : colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
          {t('settings.teamMembers')}
        </Text>
        {canInvite ? (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary[600] }]}
            onPress={() => setShowInviteModal(true)}
          >
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Info Text */}
        <Text style={[styles.infoText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
          {t('team.infoText')}
        </Text>

        {/* Members List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary[600]} />
          </View>
        ) : members && members.length > 0 ? (
          <View style={[
            styles.membersList,
            {
              backgroundColor: isDark ? colors.neutral[800] : '#fff',
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
            }
          ]}>
            {members.map((member, index) => {
              const isCurrentUser = member.user_id === user?.id;
              const isLast = index === members.length - 1;

              return (
                <View
                  key={member.id}
                  style={[
                    styles.memberItem,
                    !isLast && [styles.memberItemBorder, { borderBottomColor: isDark ? colors.neutral[700] : colors.neutral[100] }],
                  ]}
                >
                  <View style={[
                    styles.avatarContainer,
                    { backgroundColor: isDark ? colors.primary[900] : colors.primary[100] }
                  ]}>
                    <Text style={[styles.avatarText, { color: colors.primary[600] }]}>
                      {member.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.memberName, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
                        {member.name}
                      </Text>
                      {isCurrentUser && (
                        <View style={[styles.youBadge, { backgroundColor: isDark ? colors.primary[900] : colors.primary[100] }]}>
                          <Text style={[styles.youBadgeText, { color: colors.primary[600] }]}>
                            {t('team.you')}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.roleRow}>
                      {getRoleIcon(member.role)}
                      <Text style={[styles.roleText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                        {getRoleLabel(member.role)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <User size={48} color={isDark ? colors.neutral[600] : colors.neutral[400]} />
            <Text style={[styles.emptyTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
              {t('team.noMembers')}
            </Text>
            <Text style={[styles.emptyDesc, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
              {t('team.noMembersDesc')}
            </Text>
          </View>
        )}

        {/* Roles Legend */}
        <View style={styles.legendSection}>
          <Text style={[styles.legendTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
            {t('team.rolesLegend')}
          </Text>
          <View style={[
            styles.legendCard,
            {
              backgroundColor: isDark ? colors.neutral[800] : '#fff',
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
            }
          ]}>
            {Object.entries(ROLE_CONFIG).map(([role, config]) => {
              const IconComponent = config.icon;
              return (
                <View key={role} style={styles.legendItem}>
                  <IconComponent size={18} color={isDark ? config.darkColor : config.color} />
                  <View style={styles.legendInfo}>
                    <Text style={[styles.legendRole, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
                      {getRoleLabel(role)}
                    </Text>
                    <Text style={[styles.legendDesc, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                      {t(`team.roleDesc.${role}`)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Invite Modal */}
      {showInviteModal && (
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            { backgroundColor: isDark ? colors.neutral[800] : '#fff' }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>
                {t('team.inviteMember')}
              </Text>
              <TouchableOpacity onPress={() => setShowInviteModal(false)}>
                <X size={24} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
              </TouchableOpacity>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[700] }]}>
                {t('team.emailAddress')}
              </Text>
              <View style={[
                styles.inputContainer,
                {
                  backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50],
                  borderColor: isDark ? colors.neutral[600] : colors.neutral[200],
                }
              ]}>
                <Mail size={20} color={isDark ? colors.neutral[400] : colors.neutral[400]} />
                <TextInput
                  style={[styles.input, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}
                  placeholder={t('team.emailPlaceholder')}
                  placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                  value={inviteEmail}
                  onChangeText={setInviteEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Role Selection */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[700] }]}>
                {t('team.selectRole')}
              </Text>
              <View style={styles.roleOptions}>
                {(['admin', 'manager', 'contractor', 'viewer'] as MemberRole[]).map((role) => {
                  const config = ROLE_CONFIG[role];
                  const IconComponent = config.icon;
                  const isSelected = inviteRole === role;

                  return (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleOption,
                        {
                          backgroundColor: isSelected
                            ? (isDark ? colors.primary[900] : colors.primary[50])
                            : (isDark ? colors.neutral[700] : colors.neutral[100]),
                          borderColor: isSelected
                            ? colors.primary[600]
                            : (isDark ? colors.neutral[600] : colors.neutral[200]),
                        }
                      ]}
                      onPress={() => setInviteRole(role)}
                    >
                      <IconComponent size={18} color={isDark ? config.darkColor : config.color} />
                      <Text style={[
                        styles.roleOptionText,
                        { color: isDark ? colors.neutral[50] : colors.neutral[900] }
                      ]}>
                        {getRoleLabel(role)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Supplier Selection - Only for Contractor Role */}
            {inviteRole === 'contractor' && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[400] : colors.neutral[700] }]}>
                  {t('team.linkToSupplier')}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.supplierSelector,
                    {
                      backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50],
                      borderColor: isDark ? colors.neutral[600] : colors.neutral[200],
                    }
                  ]}
                  onPress={() => setShowSupplierPicker(!showSupplierPicker)}
                >
                  <Building2 size={20} color={isDark ? colors.neutral[400] : colors.neutral[400]} />
                  <Text
                    style={[
                      styles.supplierSelectorText,
                      {
                        color: selectedSupplierId
                          ? (isDark ? colors.neutral[50] : colors.neutral[900])
                          : (isDark ? colors.neutral[500] : colors.neutral[400])
                      }
                    ]}
                    numberOfLines={1}
                  >
                    {getSelectedSupplier()?.name || t('team.selectSupplier')}
                  </Text>
                  <ChevronDown size={20} color={isDark ? colors.neutral[400] : colors.neutral[400]} />
                </TouchableOpacity>

                {/* Supplier Picker Dropdown */}
                {showSupplierPicker && (
                  <View style={[
                    styles.supplierDropdown,
                    {
                      backgroundColor: isDark ? colors.neutral[700] : '#fff',
                      borderColor: isDark ? colors.neutral[600] : colors.neutral[200],
                    }
                  ]}>
                    {suppliers && suppliers.length > 0 ? (
                      <ScrollView style={styles.supplierDropdownScroll} nestedScrollEnabled>
                        {suppliers.map((supplier) => {
                          const isSelected = supplier.id === selectedSupplierId;
                          return (
                            <TouchableOpacity
                              key={supplier.id}
                              style={[
                                styles.supplierOption,
                                isSelected && {
                                  backgroundColor: isDark ? colors.primary[900] : colors.primary[50],
                                }
                              ]}
                              onPress={() => {
                                setSelectedSupplierId(supplier.id);
                                setShowSupplierPicker(false);
                              }}
                            >
                              <View style={styles.supplierOptionInfo}>
                                <Text style={[
                                  styles.supplierOptionName,
                                  { color: isDark ? colors.neutral[50] : colors.neutral[900] }
                                ]}>
                                  {supplier.name}
                                </Text>
                                {supplier.specialty && (
                                  <Text style={[
                                    styles.supplierOptionSpecialty,
                                    { color: isDark ? colors.neutral[400] : colors.neutral[500] }
                                  ]}>
                                    {supplier.specialty}
                                  </Text>
                                )}
                              </View>
                              {isSelected && (
                                <Check size={18} color={colors.primary[600]} />
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    ) : (
                      <View style={styles.noSuppliersContainer}>
                        <Text style={[
                          styles.noSuppliersText,
                          { color: isDark ? colors.neutral[400] : colors.neutral[500] }
                        ]}>
                          {t('team.noSuppliers')}
                        </Text>
                        <TouchableOpacity
                          style={[styles.addSupplierLink, { borderColor: colors.primary[600] }]}
                          onPress={() => {
                            setShowInviteModal(false);
                            router.push('/(tabs)/suppliers/add');
                          }}
                        >
                          <Text style={[styles.addSupplierText, { color: colors.primary[600] }]}>
                            {t('team.addSupplierFirst')}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                <Text style={[styles.supplierHint, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>
                  {t('team.supplierHint')}
                </Text>
              </View>
            )}

            {/* Send Button */}
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: colors.primary[600] },
                isSending && { opacity: 0.7 }
              ]}
              onPress={handleInvite}
              disabled={isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Send size={18} color="#fff" />
                  <Text style={styles.sendButtonText}>{t('team.sendInvite')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  title: {
    flex: 1,
    fontSize: 18,
    fontFamily: typography.fontFamily.bodyMedium,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.body,
    lineHeight: 20,
    marginBottom: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  membersList: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  memberItemBorder: {
    borderBottomWidth: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontFamily: typography.fontFamily.bodySemibold,
  },
  memberInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    fontSize: 16,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  youBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  youBadgeText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bodySemibold,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.body,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: typography.fontFamily.bodySemibold,
  },
  emptyDesc: {
    fontSize: 14,
    fontFamily: typography.fontFamily.body,
    textAlign: 'center',
  },
  legendSection: {
    marginTop: 32,
    marginBottom: 32,
  },
  legendTitle: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bodySemibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  legendCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  legendInfo: {
    flex: 1,
    gap: 2,
  },
  legendRole: {
    fontSize: 14,
    fontFamily: typography.fontFamily.bodySemibold,
  },
  legendDesc: {
    fontSize: 13,
    fontFamily: typography.fontFamily.body,
    lineHeight: 18,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: typography.fontFamily.bodySemibold,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: typography.fontFamily.bodyMedium,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: typography.fontFamily.body,
  },
  roleOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  roleOptionText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  sendButtonText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.bodySemibold,
    color: '#fff',
  },
  supplierSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  supplierSelectorText: {
    flex: 1,
    fontSize: 16,
    fontFamily: typography.fontFamily.body,
  },
  supplierDropdown: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  supplierDropdownScroll: {
    maxHeight: 200,
  },
  supplierOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  supplierOptionInfo: {
    flex: 1,
    gap: 2,
  },
  supplierOptionName: {
    fontSize: 15,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  supplierOptionSpecialty: {
    fontSize: 13,
    fontFamily: typography.fontFamily.body,
  },
  noSuppliersContainer: {
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  noSuppliersText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.body,
    textAlign: 'center',
  },
  addSupplierLink: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  addSupplierText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  supplierHint: {
    fontSize: 12,
    fontFamily: typography.fontFamily.body,
    marginTop: 6,
    lineHeight: 16,
  },
});
