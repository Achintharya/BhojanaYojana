/**
 * Section Header Component
 * Consistent section titles throughout the app
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import { textStyles } from '../../theme/typography';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export default function SectionHeader({ 
  title,
  actionLabel,
  onActionPress,
}: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      {actionLabel && onActionPress && (
        <TouchableOpacity onPress={onActionPress} activeOpacity={0.7}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  title: {
    ...textStyles.sectionHeader,
    color: colors.textPrimary,
    flex: 1,
  },
  action: {
    ...textStyles.body,
    color: colors.accent,
    fontWeight: '600',
  },
});
