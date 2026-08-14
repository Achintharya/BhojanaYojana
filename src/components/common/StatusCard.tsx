/**
 * Status Card Component
 * Display status information with counts
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import { textStyles, typography } from '../../theme/typography';

interface StatusCardProps {
  icon: string;
  title: string;
  count: number;
  subtitle: string;
  onPress?: () => void;
  accentColor?: string;
}

export default function StatusCard({ 
  icon,
  title,
  count,
  subtitle,
  onPress,
  accentColor = colors.accent,
}: StatusCardProps) {
  const CardWrapper = onPress ? TouchableOpacity : View;
  
  return (
    <CardWrapper
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.count, { color: accentColor }]}>{count}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      
      {onPress && (
        <View style={styles.arrow}>
          <Text style={styles.arrowIcon}>→</Text>
        </View>
      )}
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radiusMedium,
    padding: spacing.cardPadding,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  title: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: typography.weight.semibold,
    flex: 1,
  },
  content: {
    alignItems: 'flex-start',
  },
  count: {
    fontSize: typography.size.xxxl,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  arrow: {
    position: 'absolute',
    top: spacing.cardPadding,
    right: spacing.cardPadding,
  },
  arrowIcon: {
    fontSize: 20,
    color: colors.textTertiary,
  },
});
