import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { ChevronDown, Check, FolderOpen } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../config/theme';
import { Project } from '../../types/database';

interface ProjectHeaderProps {
  currentProject: Project | null;
  projects: Project[];
  onProjectChange: (project: Project) => void;
  title?: string;
  rightAction?: React.ReactNode;
}

export function ProjectHeader({
  currentProject,
  projects,
  onProjectChange,
  title,
  rightAction,
}: ProjectHeaderProps) {
  const [showPicker, setShowPicker] = useState(false);
  const hasMultipleProjects = projects.length > 1;

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {title ? (
          <Text style={styles.title}>{title}</Text>
        ) : (
          <>
            <Text style={styles.label}>Project Overview</Text>
            {hasMultipleProjects ? (
              <TouchableOpacity
                style={styles.projectSelector}
                onPress={() => setShowPicker(true)}
              >
                <Text style={styles.projectName} numberOfLines={1}>
                  {currentProject?.name || 'Select Project'}
                </Text>
                <ChevronDown size={18} color={colors.neutral[500]} />
              </TouchableOpacity>
            ) : (
              <Text style={styles.projectName} numberOfLines={1}>
                {currentProject?.name || 'No Project'}
              </Text>
            )}
          </>
        )}
      </View>

      {rightAction && <View style={styles.right}>{rightAction}</View>}

      {/* Project Picker Modal */}
      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Switch Project</Text>
            <FlatList
              data={projects}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.projectItem}
                  onPress={() => {
                    onProjectChange(item);
                    setShowPicker(false);
                  }}
                >
                  <FolderOpen size={20} color={colors.neutral[500]} />
                  <Text style={styles.projectItemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {currentProject?.id === item.id && (
                    <Check size={20} color={colors.primary[500]} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  left: {
    flex: 1,
  },
  right: {},
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[500],
    marginBottom: spacing[1],
  },
  projectSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  projectName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[900],
    maxWidth: 250,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[900],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxWidth: 340,
    maxHeight: 400,
    ...shadows.xl,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[900],
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[50],
  },
  projectItemName: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.neutral[900],
  },
});

export default ProjectHeader;
