import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../../config/theme';

interface ProgressBlocksProps {
  total: number;
  completed: number;
  inProgress?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBlocks({
  total,
  completed,
  inProgress = 0,
  size = 'md',
}: ProgressBlocksProps) {
  const blockCount = Math.min(total, 12); // Max 12 blocks for mobile
  const completedBlocks = Math.round((completed / total) * blockCount);
  const inProgressBlocks = Math.round((inProgress / total) * blockCount);

  const blockSize = size === 'sm' ? 16 : size === 'md' ? 24 : 32;
  const gap = size === 'sm' ? 2 : 4;

  return (
    <View style={[styles.container, { gap }]}>
      {Array.from({ length: blockCount }).map((_, index) => {
        let backgroundColor = colors.neutral[200];

        if (index < completedBlocks) {
          backgroundColor = colors.primary[500]; // Forest green for completed
        } else if (index < completedBlocks + inProgressBlocks) {
          backgroundColor = colors.accent[500]; // Terracotta for in-progress
        }

        return (
          <View
            key={index}
            style={[
              styles.block,
              {
                width: blockSize,
                height: blockSize,
                backgroundColor,
                borderRadius: size === 'sm' ? 2 : 4,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  block: {},
});

export default ProgressBlocks;
