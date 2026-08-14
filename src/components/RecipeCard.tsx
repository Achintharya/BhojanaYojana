/**
 * Recipe Card Component
 * Displays recipe in list view with key information
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Recipe } from '../database/types';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
}

export default function RecipeCard({ recipe, onPress }: RecipeCardProps) {
  const hasCompleteNutrition = 
    recipe.calories_per_serving !== null &&
    recipe.protein_grams !== null;

  const totalTime = 
    (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{recipe.name}</Text>
        {!hasCompleteNutrition && (
          <View style={styles.warningBadge}>
            <Text style={styles.warningText}>!</Text>
          </View>
        )}
      </View>

      <View style={styles.infoRow}>
        {totalTime > 0 && (
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>⏱️</Text>
            <Text style={styles.infoText}>{totalTime} min</Text>
          </View>
        )}
        
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>🍽️</Text>
          <Text style={styles.infoText}>{recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}</Text>
        </View>

        {recipe.calories_per_serving !== null && (
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>🔥</Text>
            <Text style={styles.infoText}>{Math.round(recipe.calories_per_serving)} cal</Text>
          </View>
        )}
      </View>

      {hasCompleteNutrition && recipe.protein_grams !== null && (
        <View style={styles.nutritionRow}>
          <Text style={styles.nutritionLabel}>Protein:</Text>
          <Text style={styles.nutritionValue}>{recipe.protein_grams}g</Text>
          {recipe.carbs_grams !== null && (
            <>
              <Text style={styles.nutritionLabel}> • Carbs:</Text>
              <Text style={styles.nutritionValue}>{recipe.carbs_grams}g</Text>
            </>
          )}
          {recipe.fat_grams !== null && (
            <>
              <Text style={styles.nutritionLabel}> • Fat:</Text>
              <Text style={styles.nutritionValue}>{recipe.fat_grams}g</Text>
            </>
          )}
        </View>
      )}
    </TouchableOpacity>
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
  warningBadge: {
    backgroundColor: '#FF9800',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  warningText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  nutritionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#999',
  },
  nutritionValue: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginRight: 4,
  },
});
