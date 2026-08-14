/**
 * Recipe Selector Component
 * Select a recipe from a list
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { Recipe } from '../database/types';
import { hasIncompleteNutrition, roundToDecimal } from '../modules/mealPlanning/mealPlanningLogic';

interface RecipeSelectorProps {
  recipes: Recipe[];
  selectedRecipeId: number | null;
  onSelect: (recipe: Recipe) => void;
}

export default function RecipeSelector({ recipes, selectedRecipeId, onSelect }: RecipeSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId);

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (recipe: Recipe) => {
    onSelect(recipe);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.label}>Recipe</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>
            {selectedRecipe ? selectedRecipe.name : 'Select a recipe'}
          </Text>
          <Text style={styles.arrow}>▼</Text>
        </View>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Recipe</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} activeOpacity={0.7}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search recipes..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />

            <ScrollView style={styles.recipeList}>
              {filteredRecipes.length === 0 ? (
                <Text style={styles.emptyText}>No recipes found</Text>
              ) : (
                filteredRecipes.map((recipe) => (
                  <TouchableOpacity
                    key={recipe.id}
                    style={[
                      styles.recipeItem,
                      selectedRecipeId === recipe.id && styles.recipeItemSelected,
                    ]}
                    onPress={() => handleSelect(recipe)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.recipeItemContent}>
                      <Text style={styles.recipeName}>{recipe.name}</Text>
                      {hasIncompleteNutrition(recipe) && (
                        <Text style={styles.warningText}>⚠️ Incomplete nutrition data</Text>
                      )}
                      <View style={styles.nutritionRow}>
                        <Text style={styles.nutritionText}>
                          {roundToDecimal(recipe.calories_per_serving ?? 0, 0)} kcal
                        </Text>
                        <Text style={styles.nutritionText}>•</Text>
                        <Text style={styles.nutritionText}>
                          {roundToDecimal(recipe.protein_grams ?? 0, 1)}g protein
                        </Text>
                        <Text style={styles.nutritionText}>•</Text>
                        <Text style={styles.nutritionText}>{recipe.servings} servings</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    minHeight: 60,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  value: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  arrow: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    paddingHorizontal: 8,
  },
  searchInput: {
    margin: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    fontSize: 16,
  },
  recipeList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  recipeItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    minHeight: 60,
  },
  recipeItemSelected: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  recipeItemContent: {
    flex: 1,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#FF9800',
    marginBottom: 4,
  },
  nutritionRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  nutritionText: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    paddingVertical: 32,
  },
});
