/**
 * Nutrition Target Editor Component
 * Edit daily nutrition targets
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { NutritionTarget } from '../database/types';

interface NutritionTargetEditorProps {
  currentTargets: NutritionTarget | null;
  onSave: (targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  }) => void;
  onCancel: () => void;
}

export default function NutritionTargetEditor({
  currentTargets,
  onSave,
  onCancel,
}: NutritionTargetEditorProps) {
  const [calories, setCalories] = useState('2000');
  const [protein, setProtein] = useState('50');
  const [carbs, setCarbs] = useState('250');
  const [fat, setFat] = useState('70');
  const [fiber, setFiber] = useState('25');

  useEffect(() => {
    if (currentTargets) {
      setCalories((currentTargets.calories_target ?? 2000).toString());
      setProtein((currentTargets.protein_target ?? 50).toString());
      setCarbs((currentTargets.carbs_target ?? 250).toString());
      setFat((currentTargets.fat_target ?? 70).toString());
      setFiber((currentTargets.fiber_target ?? 25).toString());
    }
  }, [currentTargets]);

  const handleSave = () => {
    const caloriesNum = parseFloat(calories);
    const proteinNum = parseFloat(protein);
    const carbsNum = parseFloat(carbs);
    const fatNum = parseFloat(fat);
    const fiberNum = parseFloat(fiber);

    if (
      isNaN(caloriesNum) ||
      isNaN(proteinNum) ||
      isNaN(carbsNum) ||
      isNaN(fatNum) ||
      isNaN(fiberNum)
    ) {
      Alert.alert('Error', 'Please enter valid numbers for all fields');
      return;
    }

    if (
      caloriesNum < 0 ||
      proteinNum < 0 ||
      carbsNum < 0 ||
      fatNum < 0 ||
      fiberNum < 0
    ) {
      Alert.alert('Error', 'Values cannot be negative');
      return;
    }

    onSave({
      calories: caloriesNum,
      protein: proteinNum,
      carbs: carbsNum,
      fat: fatNum,
      fiber: fiberNum,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Edit Daily Nutrition Targets</Text>
        <Text style={styles.subtitle}>
          Set your daily nutritional goals. These targets will be used to evaluate your meal plans.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Calories (kcal)</Text>
          <TextInput
            style={styles.input}
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
            placeholder="2000"
          />
          <Text style={styles.hint}>Recommended: 1800-2500 kcal for adults</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Protein (g)</Text>
          <TextInput
            style={styles.input}
            value={protein}
            onChangeText={setProtein}
            keyboardType="numeric"
            placeholder="50"
          />
          <Text style={styles.hint}>Recommended: 46-56 g for adults</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Carbohydrates (g)</Text>
          <TextInput
            style={styles.input}
            value={carbs}
            onChangeText={setCarbs}
            keyboardType="numeric"
            placeholder="250"
          />
          <Text style={styles.hint}>Recommended: 225-325 g for adults</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Fat (g)</Text>
          <TextInput
            style={styles.input}
            value={fat}
            onChangeText={setFat}
            keyboardType="numeric"
            placeholder="70"
          />
          <Text style={styles.hint}>Recommended: 44-78 g for adults</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Fiber (g)</Text>
          <TextInput
            style={styles.input}
            value={fiber}
            onChangeText={setFiber}
            keyboardType="numeric"
            placeholder="25"
          />
          <Text style={styles.hint}>Recommended: 25-30 g for adults</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ℹ️ About Nutrition Targets</Text>
          <Text style={styles.infoText}>
            These targets are for general guidance only. Consult a healthcare professional or
            registered dietitian for personalized nutrition advice.
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.7}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.7}>
            <Text style={styles.saveButtonText}>Save Targets</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
    minHeight: 48,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
