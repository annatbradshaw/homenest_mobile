import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Camera } from 'lucide-react-native';
import { useAuth } from '../../../stores/AuthContext';
import { useTheme } from '../../../stores/ThemeContext';
import { useLanguage } from '../../../stores/LanguageContext';
import { colors as themeColors } from '../../../config/theme';

export default function ProfileScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const { user, profile } = useAuth();

  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');

  const fullName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`
    : user?.email || 'User';

  const handleSave = () => {
    Alert.alert('Success', 'Profile updated successfully');
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={isDark ? colors.neutral[50] : colors.neutral[900]} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: isDark ? colors.neutral[50] : colors.neutral[900] }]}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatarContainer, { backgroundColor: isDark ? colors.primary[900] : colors.primary[100] }]}>
            <Text style={styles.avatarText}>
              {fullName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity style={[styles.changePhotoButton, { backgroundColor: isDark ? colors.primary[900] : colors.primary[50] }]}>
            <Camera size={16} color={colors.primary[600]} />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? colors.neutral[400] : colors.neutral[700] }]}>First Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200], color: isDark ? colors.neutral[50] : colors.neutral[900] }]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
              placeholderTextColor={colors.neutral[400]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? colors.neutral[400] : colors.neutral[700] }]}>Last Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200], color: isDark ? colors.neutral[50] : colors.neutral[900] }]}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter last name"
              placeholderTextColor={colors.neutral[400]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? colors.neutral[400] : colors.neutral[700] }]}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: isDark ? colors.neutral[700] : colors.neutral[200], color: isDark ? colors.neutral[400] : colors.neutral[500] }]}
              value={user?.email || ''}
              editable={false}
            />
            <Text style={[styles.inputHint, { color: isDark ? colors.neutral[400] : colors.neutral[400] }]}>Email cannot be changed</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? colors.neutral[400] : colors.neutral[700] }]}>Phone</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? colors.neutral[800] : '#fff', borderColor: isDark ? colors.neutral[700] : colors.neutral[200], color: isDark ? colors.neutral[50] : colors.neutral[900] }]}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              placeholderTextColor={colors.neutral[400]}
              keyboardType="phone-pad"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.neutral[50],
  },
  scrollView: {
    flex: 1,
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: themeColors.neutral[900],
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: themeColors.primary[600],
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: themeColors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '600',
    color: themeColors.primary[600],
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: themeColors.primary[50],
    borderRadius: 20,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '500',
    color: themeColors.primary[600],
  },
  form: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: themeColors.neutral[700],
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: themeColors.neutral[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: themeColors.neutral[900],
  },
  inputDisabled: {
    backgroundColor: themeColors.neutral[100],
    color: themeColors.neutral[500],
  },
  inputHint: {
    fontSize: 12,
    color: themeColors.neutral[400],
    marginTop: 6,
  },
});
