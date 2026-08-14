/**
 * Grocery Item Card Component
 * Displays a single grocery item with purchase checkbox
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GroceryItem } from '../database/types';

interface GroceryItemCardProps {
  item: GroceryItem;
  onTogglePurchased: (item: GroceryItem) => void;
  onDelete: (item: GroceryItem) => void;
}

export default function GroceryItemCard({ item, onTogglePurchased, onDelete }: GroceryItemCardProps) {
  const isPurchased = item.is_purchased === 1;

  return (
    <View style={[styles.card, isPurchased && styles.purchasedCard]}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => onTogglePurchased(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkboxBox, isPurchased && styles.checkboxChecked]}>
          {isPurchased && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.name, isPurchased && styles.purchasedText]}>
          {item.name}
        </Text>
        <Text style={[styles.quantity, isPurchased && styles.purchasedText]}>
          {item.quantity} {item.unit}
        </Text>
        {item.auto_generated === 1 && (
          <Text style={styles.autoLabel}>Auto-added</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.deleteText}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  purchasedCard: {
    backgroundColor: '#f5f5f5',
    opacity: 0.7,
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxBox: {
    width: 32,
    height: 32,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  quantity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  autoLabel: {
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
  },
  purchasedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  deleteButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  deleteText: {
    fontSize: 32,
    color: '#999',
    fontWeight: '300',
  },
});
