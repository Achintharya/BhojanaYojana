/**
 * Add/Edit Pantry Item Modal
 * Form for creating or updating pantry items
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { PantryItem } from '../database/types';

interface AddPantryItemModalProps {
  visible: boolean;
  editItem?: PantryItem | null;
  onSave: (item: {
    name: string;
    quantity: number;
    unit: string;
    low_stock_threshold: number | null;
    expiry_date: string | null;
  }) => void;
  onCancel: () => void;
}

export default function AddPantryItemModal({
  visible,
  editItem,
  onSave,
  onCancel,
}: AddPantryItemModalProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setQuantity(editItem.quantity.toString());
      setUnit(editItem.unit);
      setLowStockThreshold(editItem.low_stock_threshold?.toString() || '');
      setExpiryDate(editItem.expiry_date || '');
    } else {
      resetForm();
    }
  }, [editItem, visible]);

  const resetForm = () => {
    setName('');
    setQuantity('');
    setUnit('');
    setLowStockThreshold('');
    setExpiryDate('');
  };

  const handleSave = () => {
    if (!name.trim() || !quantity || !unit.trim()) {
      alert('Please fill in name, quantity, and unit');
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum < 0) {
      alert('Please enter a valid quantity');
      return;
    }

    const lowStockNum = lowStockThreshold.trim()
      ? parseFloat(lowStockThreshold)
      : null;

    if (lowStockNum !== null && (isNaN(lowStockNum) || lowStockNum < 0)) {
      alert('Please enter a valid low stock threshold');
      return;
    }

    // Validate expiry date format (YYYY-MM-DD)
    let expiryDateFormatted: string | null = null;
    if (expiryDate.trim()) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(expiryDate.trim())) {
        alert('Please enter date in YYYY-MM-DD format');
        return;
      }
      expiryDateFormatted = expiryDate.trim();
    }

    onSave({
      name: name.trim(),
      quantity: quantityNum,
      unit: unit.trim(),
      low_stock_threshold: lowStockNum,
      expiry_date: expiryDateFormatted,
    });

    resetForm();
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const commonUnits = ['kg', 'g', 'L', 'ml', 'pcs', 'dozen'];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView style={styles.scrollView}>
            <Text style={styles.title}>
              {editItem ? 'Edit Pantry Item' : 'Add Pantry Item'}
            </Text>

            <Text style={styles.label}>Item Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Rice, Toor Dal, Milk"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Quantity *</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="e.g., 2.5"
              keyboardType="decimal-pad"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Unit *</Text>
            <TextInput
              style={styles.input}
              value={unit}
              onChangeText={setUnit}
              placeholder="e.g., kg, g, L, ml"
              placeholderTextColor="#999"
            />
            <View style={styles.unitSuggestions}>
              {commonUnits.map((u) => (
                <TouchableOpacity
                  key={u}
                  style={styles.unitButton}
                  onPress={() => setUnit(u)}
                >
                  <Text style={styles.unitButtonText}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Low Stock Threshold</Text>
            <TextInput
              style={styles.input}
              value={lowStockThreshold}
              onChangeText={setLowStockThreshold}
              placeholder="Optional - alert when below this amount"
              keyboardType="decimal-pad"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Expiry Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={expiryDate}
              onChangeText={setExpiryDate}
              placeholder="e.g., 2026-12-31"
              placeholderTextColor="#999"
            />

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>
                  {editItem ? 'Update' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxWidth: 600,
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  scrollView: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    minHeight: 48,
  },
  unitSuggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  unitButton: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  unitButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButtonText: {
    color: '#666',
  },
});
