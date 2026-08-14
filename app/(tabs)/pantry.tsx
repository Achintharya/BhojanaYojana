/**
 * Pantry screen
 * View and manage pantry inventory
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { PantryItem } from '../../src/database/types';
import {
  getAllPantryItems,
  getLowStockItems,
  getItemsExpiringSoon,
  createPantryItem,
  updatePantryItem,
  deletePantryItem,
} from '../../src/modules/pantry/pantryData';
import { getGroceryItemByPantryId } from '../../src/modules/grocery/groceryData';
import { syncPantryToGrocery } from '../../src/modules/pantry/pantryLogic';
import ScreenContainer from '../../src/components/common/ScreenContainer';
import PrimaryButton from '../../src/components/common/PrimaryButton';
import EmptyState from '../../src/components/common/EmptyState';
import PantryItemCard from '../../src/components/PantryItemCard';
import AddPantryItemModal from '../../src/components/AddPantryItemModal';
import colors from '../../src/theme/colors';
import spacing from '../../src/theme/spacing';
import { textStyles, typography } from '../../src/theme/typography';

type FilterType = 'all' | 'low_stock' | 'expiring';

export default function PantryScreen() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);

  const loadItems = async () => {
    setLoading(true);
    try {
      let loadedItems: PantryItem[];
      switch (filter) {
        case 'low_stock':
          loadedItems = await getLowStockItems();
          break;
        case 'expiring':
          loadedItems = await getItemsExpiringSoon(7);
          break;
        default:
          loadedItems = await getAllPantryItems();
      }
      // Sort by expiry date (older first) for older-item-first support
      loadedItems.sort((a, b) => {
        if (!a.expiry_date && !b.expiry_date) return 0;
        if (!a.expiry_date) return 1;
        if (!b.expiry_date) return -1;
        return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
      });
      setItems(loadedItems);
    } catch (error) {
      console.error('Error loading pantry items:', error);
      Alert.alert('Error', 'Failed to load pantry items');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [filter])
  );

  const handleAddItem = () => {
    setEditingItem(null);
    setModalVisible(true);
  };

  const handleEditItem = (item: PantryItem) => {
    setEditingItem(item);
    setModalVisible(true);
  };

  const handleSaveItem = async (itemData: {
    name: string;
    quantity: number;
    unit: string;
    low_stock_threshold: number | null;
    expiry_date: string | null;
  }) => {
    try {
      if (editingItem) {
        // Update existing item
        await updatePantryItem(editingItem.id, itemData);
        
        // Sync to grocery list
        const updatedItem = await getAllPantryItems();
        const item = updatedItem.find(i => i.id === editingItem.id);
        if (item) {
          const existingGroceryItem = await getGroceryItemByPantryId(item.id);
          await syncPantryToGrocery(item, existingGroceryItem);
        }
      } else {
        // Create new item
        const newId = await createPantryItem(itemData);
        
        // Sync to grocery list
        const allItems = await getAllPantryItems();
        const newItem = allItems.find(i => i.id === newId);
        if (newItem) {
          const existingGroceryItem = await getGroceryItemByPantryId(newItem.id);
          await syncPantryToGrocery(newItem, existingGroceryItem);
        }
      }

      setModalVisible(false);
      setEditingItem(null);
      loadItems();
    } catch (error) {
      console.error('Error saving pantry item:', error);
      Alert.alert('Error', 'Failed to save pantry item');
    }
  };

  const handleDeleteItem = (item: PantryItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePantryItem(item.id);
              // Note: Auto-generated grocery items will be removed by CASCADE
              loadItems();
            } catch (error) {
              console.error('Error deleting pantry item:', error);
              Alert.alert('Error', 'Failed to delete pantry item');
            }
          },
        },
      ]
    );
  };

  const handleCancelModal = () => {
    setModalVisible(false);
    setEditingItem(null);
  };

  return (
    <View style={styles.container}>
      {/* Header with Add Button */}
      <View style={styles.header}>
        <PrimaryButton
          title="+ Add Item"
          onPress={handleAddItem}
          large
        />
      </View>

      {/* Filter Pills */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
          onPress={() => setFilter('all')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterPill, filter === 'low_stock' && styles.filterPillActive]}
          onPress={() => setFilter('low_stock')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filter === 'low_stock' && styles.filterTextActive]}>
            Low Stock
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterPill, filter === 'expiring' && styles.filterPillActive]}
          onPress={() => setFilter('expiring')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filter === 'expiring' && styles.filterTextActive]}>
            Expiring Soon
          </Text>
        </TouchableOpacity>
      </View>

      {/* Items List */}
      <ScreenContainer scrollable={true} style={styles.listContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : items.length === 0 ? (
          <EmptyState
            icon="🏺"
            title={filter === 'all' ? 'Your pantry is empty' : filter === 'low_stock' ? 'No low stock items' : 'Nothing expiring soon'}
            message={
              filter === 'all'
                ? 'Add the food you have at home'
                : filter === 'low_stock'
                ? 'All items have good stock levels'
                : 'No items expiring in the next 7 days'
            }
            actionLabel={filter === 'all' ? 'Add Item' : undefined}
            onAction={filter === 'all' ? handleAddItem : undefined}
          />
        ) : (
          <View style={styles.itemsList}>
            {items.map((item) => (
              <PantryItemCard
                key={item.id}
                item={item}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
              />
            ))}
          </View>
        )}
      </ScreenContainer>

      <AddPantryItemModal
        visible={modalVisible}
        editItem={editingItem}
        onSave={handleSaveItem}
        onCancel={handleCancelModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.base,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  filterPill: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderRadius: spacing.radiusRound,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: spacing.minTouchTarget,
  },
  filterPillActive: {
    backgroundColor: colors.accent,
  },
  filterText: {
    ...textStyles.body,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.textOnAccent,
  },
  listContainer: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: spacing.huge,
    alignItems: 'center',
  },
  loadingText: {
    ...textStyles.body,
    color: colors.textTertiary,
  },
  itemsList: {
    gap: spacing.cardGap,
  },
});
