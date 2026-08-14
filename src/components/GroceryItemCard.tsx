/**
 * Grocery Item Card Component
 * Displays a single grocery item with purchase checkbox
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GroceryItem } from '../database/types';
import colors from '../theme/colors';
import spacing from '../theme/spacing';
import { textStyles, typography } from '../theme/typography';

interface GroceryItemCardProps {
  item: GroceryItem;
  onTogglePurchased: (item: GroceryItem) => void;
  onDelete: (item: GroceryItem) => void;
}

export default function GroceryItemCard({ item, onTogglePurchased, onDelete }: GroceryItemCardProps) {
  const isPurchased = item.is_purchased === 1;

  return (
    <View style={[styles.card, isPurchased && styles.purchasedCard]}>
      {/* Large Checkbox */}
      <TouchableOpacity
        style={styles.checkboxTouchArea}
        onPress={() => onTogglePurchased(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, isPurchased && styles.checkboxChecked]}>
          {isPurchased && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.name, isPurchased && styles.nameStrikethrough]}>
          {item.name}
        </Text>
        <View style={styles.details}>
          <Text style={[styles.quantity, isPurchased && styles.quantityStrikethrough]}>
            {item.quantity} {item.unit}
          </Text>
          {item.auto_generated === 1 && !isPurchased && (
            <View style={styles.autoBadge}>
              <Text style={styles.autoLabel}>Auto</Text>
            </View>
          )}
        </View>
      </View>

      {/* Delete Button */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.deleteIcon}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radiusMedium,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    minHeight: 72,
  },
  purchasedCard: {
    backgroundColor: colors.surfaceLight,
    opacity: 0.6,
  },
  checkboxTouchArea: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  checkbox: {
    width: 40,
    height: 40,
    borderWidth: 3,
    borderColor: colors.accent,
    borderRadius: spacing.radiusSmall,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkmark: {
    color: colors.textOnAccent,
    fontSize: 24,
    fontWeight: typography.weight.bold,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    ...textStyles.body,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  nameStrikethrough: {
    textDecorationLine: 'line-through',
    color: colors.textTertiary,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  quantityStrikethrough: {
    textDecorationLine: 'line-through',
    color: colors.textTertiary,
  },
  autoBadge: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: spacing.radiusSmall,
  },
  autoLabel: {
    fontSize: typography.size.xs,
    color: colors.accent,
    fontWeight: typography.weight.semibold,
  },
  deleteButton: {
    width: spacing.minTouchTarget,
    height: spacing.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  deleteIcon: {
    fontSize: 32,
    color: colors.textTertiary,
    fontWeight: '300',
  },
});
