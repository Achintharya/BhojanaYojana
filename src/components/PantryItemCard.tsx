/**
 * Pantry Item Card Component
 * Displays a single pantry item with all relevant information
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PantryItem } from '../database/types';
import { isLowStock, getExpiryState, getExpiryColor, getExpiryLabel } from '../modules/pantry/pantryLogic';
import colors from '../theme/colors';
import spacing from '../theme/spacing';
import { textStyles, typography } from '../theme/typography';

interface PantryItemCardProps {
  item: PantryItem;
  onEdit: (item: PantryItem) => void;
  onDelete: (item: PantryItem) => void;
}

export default function PantryItemCard({ item, onEdit, onDelete }: PantryItemCardProps) {
  const lowStock = isLowStock(item);
  const expiryState = getExpiryState(item.expiry_date);
  const expiryColor = getExpiryColor(expiryState);
  const expiryLabel = getExpiryLabel(expiryState, item.expiry_date);

  const getStatusLabel = () => {
    if (expiryState === 'expired' || expiryState === 'expiring_soon') {
      return expiryLabel;
    }
    if (lowStock) {
      return 'Low Stock';
    }
    return 'Good Stock';
  };

  const getStatusColor = () => {
    if (expiryState === 'expired' || expiryState === 'expiring_soon') {
      return expiryColor;
    }
    if (lowStock) {
      return colors.lowStock;
    }
    return colors.goodStock;
  };

  return (
    <View style={styles.card}>
      <View style={styles.mainContent}>
        {/* Item Name */}
        <Text style={styles.name}>{item.name}</Text>

        {/* Quantity - Large and prominent */}
        <Text style={styles.quantity}>
          {item.quantity} {item.unit}
        </Text>

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '15' }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusLabel()}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => onEdit(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radiusMedium,
    padding: spacing.cardPaddingLarge,
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  mainContent: {
    marginBottom: spacing.base,
  },
  name: {
    ...textStyles.cardTitle,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  quantity: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.accent,
    marginBottom: spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.radiusRound,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  statusText: {
    ...textStyles.caption,
    fontWeight: typography.weight.semibold,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editButton: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: spacing.radiusSmall,
    alignItems: 'center',
    minHeight: spacing.minTouchTarget,
    justifyContent: 'center',
  },
  editButtonText: {
    ...textStyles.button,
    fontSize: typography.size.base,
    color: colors.textOnAccent,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.error,
    paddingVertical: spacing.md,
    borderRadius: spacing.radiusSmall,
    alignItems: 'center',
    minHeight: spacing.minTouchTarget,
    justifyContent: 'center',
  },
  deleteButtonText: {
    ...textStyles.button,
    fontSize: typography.size.base,
    color: colors.error,
  },
});
