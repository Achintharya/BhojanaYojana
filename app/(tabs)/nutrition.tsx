/**
 * Nutrition screen
 * Set and track nutritional goals
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { NutritionTarget } from '../../src/database/types';
import {
  getNutritionTargetByDate,
  setNutritionTarget,
} from '../../src/modules/nutrition/nutritionData';
import { getMealPlansByDate } from '../../src/modules/mealPlanning/mealPlanData';
import { getRecipeById } from '../../src/modules/recipes/recipeData';
import {
  formatDateForDB,
  calculateDailyNutrition,
  compareToTargets,
  validateDietAlignment,
  MealPlanWithRecipe,
  roundToDecimal,
} from '../../src/modules/mealPlanning/mealPlanningLogic';
import NutritionSummaryCard from '../../src/components/NutritionSummaryCard';
import NutritionTargetEditor from '../../src/components/NutritionTargetEditor';

export default function NutritionScreen() {
  const [targets, setTargets] = useState<NutritionTarget | null>(null);
  const [todayMealPlans, setTodayMealPlans] = useState<MealPlanWithRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load nutrition targets
      const nutritionTargets = await getNutritionTargetByDate('default');
      setTargets(nutritionTargets);

      // Load today's meal plans
      const today = formatDateForDB(new Date());
      const plans = await getMealPlansByDate(today);

      // Enrich with recipe details
      const enrichedPlans: MealPlanWithRecipe[] = [];
      for (const plan of plans) {
        const recipe = await getRecipeById(plan.recipe_id);
        if (recipe) {
          enrichedPlans.push({
            ...plan,
            recipe,
          });
        }
      }
      setTodayMealPlans(enrichedPlans);
    } catch (error) {
      console.error('Error loading nutrition data:', error);
      Alert.alert('Error', 'Failed to load nutrition data');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleSaveTargets = async (newTargets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  }) => {
    try {
      await setNutritionTarget({
        target_date: 'default',
        calories_target: newTargets.calories,
        protein_target: newTargets.protein,
        carbs_target: newTargets.carbs,
        fat_target: newTargets.fat,
        fiber_target: newTargets.fiber,
      });

      setEditing(false);
      loadData();
      Alert.alert('Success', 'Nutrition targets updated successfully');
    } catch (error) {
      console.error('Error saving nutrition targets:', error);
      Alert.alert('Error', 'Failed to save nutrition targets');
    }
  };

  if (editing) {
    return (
      <NutritionTargetEditor
        currentTargets={targets}
        onSave={handleSaveTargets}
        onCancel={() => setEditing(false)}
      />
    );
  }

  // Calculate today's nutrition
  const todayNutrition = calculateDailyNutrition(todayMealPlans);
  const comparison = compareToTargets(todayNutrition, targets);
  const alignment = validateDietAlignment(comparison);

  const displayTargets = targets
    ? {
        calories: targets.calories_target ?? 2000,
        protein: targets.protein_target ?? 50,
        carbs: targets.carbs_target ?? 250,
        fat: targets.fat_target ?? 70,
        fiber: targets.fiber_target ?? 25,
      }
    : {
        calories: 2000,
        protein: 50,
        carbs: 250,
        fat: 70,
        fiber: 25,
      };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Daily Nutrition Targets</Text>
            <Text style={styles.subtitle}>
              {targets ? 'Your configured daily goals' : 'Using default targets'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditing(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.targetsCard}>
          <View style={styles.targetRow}>
            <Text style={styles.targetLabel}>Calories</Text>
            <Text style={styles.targetValue}>{roundToDecimal(displayTargets.calories, 0)} kcal</Text>
          </View>
          <View style={styles.targetRow}>
            <Text style={styles.targetLabel}>Protein</Text>
            <Text style={styles.targetValue}>{roundToDecimal(displayTargets.protein, 1)} g</Text>
          </View>
          <View style={styles.targetRow}>
            <Text style={styles.targetLabel}>Carbohydrates</Text>
            <Text style={styles.targetValue}>{roundToDecimal(displayTargets.carbs, 1)} g</Text>
          </View>
          <View style={styles.targetRow}>
            <Text style={styles.targetLabel}>Fat</Text>
            <Text style={styles.targetValue}>{roundToDecimal(displayTargets.fat, 1)} g</Text>
          </View>
          <View style={styles.targetRow}>
            <Text style={styles.targetLabel}>Fiber</Text>
            <Text style={styles.targetValue}>{roundToDecimal(displayTargets.fiber, 1)} g</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Today's Progress</Text>

        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : todayMealPlans.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No meals planned for today</Text>
            <Text style={styles.emptySubtitle}>
              Go to Meal Planner to add meals and track your nutrition
            </Text>
          </View>
        ) : (
          <>
            <NutritionSummaryCard comparison={comparison} />

            {alignment.warnings.length > 0 && (
              <View style={styles.warningsCard}>
                <Text style={styles.warningsTitle}>⚠️ Diet Alignment</Text>
                {alignment.warnings.map((warning, index) => (
                  <Text key={index} style={styles.warningText}>
                    • {warning}
                  </Text>
                ))}
                {alignment.isAligned && (
                  <Text style={styles.alignedText}>✓ Overall targets are met</Text>
                )}
              </View>
            )}

            {alignment.isAligned && alignment.warnings.length === 0 && (
              <View style={styles.successCard}>
                <Text style={styles.successIcon}>✅</Text>
                <Text style={styles.successTitle}>Great Job!</Text>
                <Text style={styles.successText}>
                  Your planned meals align well with your nutrition targets
                </Text>
              </View>
            )}

            <View style={styles.mealsCard}>
              <Text style={styles.mealsTitle}>Today's Meals</Text>
              {todayMealPlans.map((plan) => (
                <View key={plan.id} style={styles.mealRow}>
                  <Text style={styles.mealName}>
                    {plan.meal_type.charAt(0).toUpperCase() + plan.meal_type.slice(1)}:{' '}
                    {plan.recipe.name}
                  </Text>
                  <Text style={styles.mealServings}>×{plan.servings}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ℹ️ About This Feature</Text>
          <Text style={styles.infoText}>
            This tool helps you plan meals that align with your nutritional goals. The comparison
            shows how your planned meals match your targets. Remember, this is for guidance only -
            consult healthcare professionals for personalized nutrition advice.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
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
  editButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  targetsCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  targetLabel: {
    fontSize: 16,
    color: '#666',
  },
  targetValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    paddingVertical: 32,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  warningsCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  warningsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F57C00',
    marginBottom: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#F57C00',
    marginVertical: 4,
  },
  alignedText: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 12,
    fontWeight: '600',
  },
  successCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
  },
  mealsCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mealsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mealName: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  mealServings: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
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
});
