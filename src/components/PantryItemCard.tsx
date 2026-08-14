/**
 * Pantry Item Card Component
 * Displays a single pantry item with all relevant information
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PantryItem } from '../database/types';
import { isLowStock, getExpiryState, getExpiryColor, getExpiryLabel } from '../modules/pantry/pantryLogic';

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

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{item.name}</Text>
          {lowStock && (
            <View style={styles.lowStockBadge}>
              <Text style={styles.lowStockText}>LOW STOCK</Text>
            </View>
          )}
        </View>

        <View style={styles.details}>
          <Text style={styles.quantity}>
            {item.quantity} {item.unit}
          </Text>
          {item.low_stock_threshold !== null && (
            <Text style={styles.threshold}>
              Min: {item.low_stock_threshold} {item.unit}
            </Text>
          )}
        </View>

        {expiryLabel && (
          <View style={[styles.expiryBadge, { backgroundColor: expiryColor + '20' }]}>
            <Text style={[styles.expiryText, { color: expiryColor }]}>
              {expiryLabel}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => onEdit(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => onDelete(item)}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  lowStockBadge: {
    backgroundColor: '#f44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  lowStockText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantity: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginRight: 16,
  },
  threshold: {
    fontSize: 14,
    color: '#666',
  },
  expiryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  expiryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f44336',
  },
  deleteButtonText: {
    color: '#f44336',
  },
});
