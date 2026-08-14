/**
 * Action Card Component
 * Large touch-friendly card for quick actions
 */
import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import { textStyles, typography } from '../../theme/typography';

interface ActionCardProps {
  icon: string;
  title: string;
  onPress: () => void;
  backgroundColor?: string;
}

export default function ActionCard({ 
  icon, 
  title, 
  onPress,
  backgroundColor = colors.cardBackground,
}: ActionCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: spacing.radiusLarge,
    padding: spacing.cardPadding,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  iconContainer: {
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
  },
});
