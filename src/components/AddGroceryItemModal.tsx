/**
 * Add Manual Grocery Item Modal
 * Form for manually adding items to grocery list
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

interface AddGroceryItemModalProps {
  visible: boolean;
  onSave: (item: {
    name: string;
    quantity: number;
    unit: string;
  }) => void;
  onCancel: () => void;
}

export default function AddGroceryItemModal({
  visible,
  onSave,
  onCancel,
}: AddGroceryItemModalProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');

  const resetForm = () => {
    setName('');
    setQuantity('');
    setUnit('');
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter an item name');
      return;
    }

    const quantityNum = quantity.trim() ? parseFloat(quantity) : 1;
    if (isNaN(quantityNum) || quantityNum <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    const finalUnit = unit.trim() || 'pcs';

    onSave({
      name: name.trim(),
      quantity: quantityNum,
      unit: finalUnit,
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
            <Text style={styles.title}>Add Grocery Item</Text>

            <Text style={styles.label}>Item Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Curd, Vegetables, Bread"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="e.g., 2 (optional, defaults to 1)"
              keyboardType="decimal-pad"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Unit</Text>
            <TextInput
              style={styles.input}
              value={unit}
              onChangeText={setUnit}
              placeholder="e.g., kg, L (optional, defaults to pcs)"
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
                <Text style={styles.buttonText}>Add</Text>
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
    maxWidth: 500,
    maxHeight: '70%',
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
