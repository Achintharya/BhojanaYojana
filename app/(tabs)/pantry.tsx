/**
 * Pantry screen
 * View and manage pantry inventory
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
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
import PantryItemCard from '../../src/components/PantryItemCard';
import AddPantryItemModal from '../../src/components/AddPantryItemModal';

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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddItem}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>+ Add Item</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'low_stock' && styles.filterButtonActive]}
          onPress={() => setFilter('low_stock')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filter === 'low_stock' && styles.filterTextActive]}>
            Low Stock
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'expiring' && styles.filterButtonActive]}
          onPress={() => setFilter('expiring')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filter === 'expiring' && styles.filterTextActive]}>
            Expiring Soon
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {loading ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items found</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'all'
                ? 'Add your first pantry item to get started'
                : filter === 'low_stock'
                ? 'No items are currently low on stock'
                : 'No items expiring in the next 7 days'}
            </Text>
          </View>
        ) : (
          <View>
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
      </ScrollView>

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
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  filters: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
  },
});
