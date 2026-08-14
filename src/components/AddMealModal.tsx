/**
 * Add Meal Modal Component
 * Modal for adding/editing a meal plan
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Recipe, MealType } from '../database/types';
import RecipeSelector from './RecipeSelector';
import { roundToDecimal } from '../modules/mealPlanning/mealPlanningLogic';

interface AddMealModalProps {
  visible: boolean;
  date: string;
  mealType: MealType;
  recipes: Recipe[];
  editingMeal?: {
    id: number;
    recipeId: number;
    servings: number;
  } | null;
  onSave: (recipeId: number, servings: number) => void;
  onCancel: () => void;
}

export default function AddMealModal({
  visible,
  date,
  mealType,
  recipes,
  editingMeal,
  onSave,
  onCancel,
}: AddMealModalProps) {
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [servings, setServings] = useState('1');

  useEffect(() => {
    if (editingMeal) {
      setSelectedRecipeId(editingMeal.recipeId);
      setServings(editingMeal.servings.toString());
    } else {
      setSelectedRecipeId(null);
      setServings('1');
    }
  }, [editingMeal, visible]);

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId);

  const handleSave = () => {
    if (!selectedRecipeId) {
      Alert.alert('Error', 'Please select a recipe');
      return;
    }

    const servingsNum = parseInt(servings, 10);
    if (isNaN(servingsNum) || servingsNum < 1) {
      Alert.alert('Error', 'Please enter a valid number of servings (minimum 1)');
      return;
    }

    onSave(selectedRecipeId, servingsNum);
  };

  const getMealTypeLabel = () => {
    switch (mealType) {
      case 'breakfast':
        return 'Breakfast';
      case 'lunch':
        return 'Lunch';
      case 'dinner':
        return 'Dinner';
      case 'snack':
        return 'Snack';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const totalCalories = selectedRecipe
    ? (selectedRecipe.calories_per_serving ?? 0) * parseInt(servings || '1', 10)
    : 0;
  const totalProtein = selectedRecipe
    ? (selectedRecipe.protein_grams ?? 0) * parseInt(servings || '1', 10)
    : 0;

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {editingMeal ? 'Edit' : 'Add'} {getMealTypeLabel()}
            </Text>
            <Text style={styles.subtitle}>{formatDate(date)}</Text>
          </View>

          <ScrollView style={styles.content}>
            <RecipeSelector
              recipes={recipes}
              selectedRecipeId={selectedRecipeId}
              onSelect={(recipe) => setSelectedRecipeId(recipe.id)}
            />

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Servings</Text>
              <TextInput
                style={styles.input}
                value={servings}
                onChangeText={setServings}
                keyboardType="number-pad"
                placeholder="Number of servings"
              />
            </View>

            {selectedRecipe && (
              <View style={styles.preview}>
                <Text style={styles.previewTitle}>Nutrition Preview</Text>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Total Calories:</Text>
                  <Text style={styles.previewValue}>{roundToDecimal(totalCalories, 0)} kcal</Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Total Protein:</Text>
                  <Text style={styles.previewValue}>{roundToDecimal(totalProtein, 1)} g</Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Carbs:</Text>
                  <Text style={styles.previewValue}>
                    {roundToDecimal((selectedRecipe.carbs_grams ?? 0) * parseInt(servings || '1', 10), 1)} g
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Fat:</Text>
                  <Text style={styles.previewValue}>
                    {roundToDecimal((selectedRecipe.fat_grams ?? 0) * parseInt(servings || '1', 10), 1)} g
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Fiber:</Text>
                  <Text style={styles.previewValue}>
                    {roundToDecimal((selectedRecipe.fiber_grams ?? 0) * parseInt(servings || '1', 10), 1)} g
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.7}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.7}>
              <Text style={styles.saveButtonText}>{editingMeal ? 'Update' : 'Add'}</Text>
            </TouchableOpacity>
          </View>
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
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 48,
  },
  preview: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  previewLabel: {
    fontSize: 14,
    color: '#666',
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
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
