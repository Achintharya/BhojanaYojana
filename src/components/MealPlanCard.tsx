/**
 * Meal Plan Card Component
 * Display a single meal plan with recipe details
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MealType } from '../database/types';
import { roundToDecimal } from '../modules/mealPlanning/mealPlanningLogic';

interface MealPlanCardProps {
  mealType: MealType;
  recipeName: string;
  servings: number;
  calories: number;
  protein: number;
  onEdit: () => void;
  onDelete: () => void;
}

export default function MealPlanCard({
  mealType,
  recipeName,
  servings,
  calories,
  protein,
  onEdit,
  onDelete,
}: MealPlanCardProps) {
  const getMealTypeLabel = () => {
    switch (mealType) {
      case 'breakfast':
        return '🌅 Breakfast';
      case 'lunch':
        return '☀️ Lunch';
      case 'dinner':
        return '🌙 Dinner';
      case 'snack':
        return '🍎 Snack';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.mealType}>{getMealTypeLabel()}</Text>
          <Text style={styles.recipeName}>{recipeName}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Servings:</Text>
          <Text style={styles.detailValue}>{servings}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Calories:</Text>
          <Text style={styles.detailValue}>{roundToDecimal(calories, 0)} kcal</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Protein:</Text>
          <Text style={styles.detailValue}>{roundToDecimal(protein, 1)} g</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton} onPress={onEdit} activeOpacity={0.7}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete} activeOpacity={0.7}>
          <Text style={styles.deleteButtonText}>Delete</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  mealType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  details: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f44336',
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: '600',
  },
});
