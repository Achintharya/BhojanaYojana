/**
 * Meal Planner screen
 * Plan and schedule meals
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Recipe, MealType, MealPlan } from '../../src/database/types';
import {
  getMealPlansByDate,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  getMealPlanByDateAndType,
} from '../../src/modules/mealPlanning/mealPlanData';
import { getAllRecipes, getRecipeById } from '../../src/modules/recipes/recipeData';
import { getNutritionTargetByDate } from '../../src/modules/nutrition/nutritionData';
import {
  formatDateForDB,
  formatDateForDisplay,
  getRelativeDate,
  calculateDailyNutrition,
  compareToTargets,
  MealPlanWithRecipe,
} from '../../src/modules/mealPlanning/mealPlanningLogic';
import MealPlanCard from '../../src/components/MealPlanCard';
import AddMealModal from '../../src/components/AddMealModal';
import NutritionSummaryCard from '../../src/components/NutritionSummaryCard';
import { syncMealPlanToGrocery } from '../../src/modules/mealPlanning/mealPlanGroceryIntegration';

export default function MealPlanScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealPlans, setMealPlans] = useState<MealPlanWithRecipe[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
  const [editingMeal, setEditingMeal] = useState<{
    id: number;
    recipeId: number;
    servings: number;
  } | null>(null);
  const [nutritionTargets, setNutritionTargets] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const dateStr = formatDateForDB(selectedDate);

      // Load recipes
      const allRecipes = await getAllRecipes();
      setRecipes(allRecipes);

      // Load meal plans for the selected date
      const plans = await getMealPlansByDate(dateStr);

      // Enrich meal plans with recipe details
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
      setMealPlans(enrichedPlans);

      // Load nutrition targets
      const targets = await getNutritionTargetByDate('default');
      setNutritionTargets(targets);
    } catch (error) {
      console.error('Error loading meal plan data:', error);
      Alert.alert('Error', 'Failed to load meal plans');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [selectedDate])
  );

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleAddMeal = (mealType: MealType) => {
    setSelectedMealType(mealType);
    setEditingMeal(null);
    setModalVisible(true);
  };

  const handleEditMeal = (plan: MealPlanWithRecipe) => {
    setSelectedMealType(plan.meal_type);
    setEditingMeal({
      id: plan.id,
      recipeId: plan.recipe_id,
      servings: plan.servings,
    });
    setModalVisible(true);
  };

  const handleSaveMeal = async (recipeId: number, servings: number) => {
    try {
      const dateStr = formatDateForDB(selectedDate);

      if (editingMeal) {
        // Update existing meal
        await updateMealPlan(editingMeal.id, {
          recipe_id: recipeId,
          servings,
        });
      } else {
        // Check if meal already exists for this date/type
        const existing = await getMealPlanByDateAndType(dateStr, selectedMealType);
        if (existing) {
          Alert.alert(
            'Meal Already Exists',
            `A ${selectedMealType} is already planned for this date. Would you like to replace it?`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Replace',
                onPress: async () => {
                  await updateMealPlan(existing.id, {
                    recipe_id: recipeId,
                    servings,
                  });
                  setModalVisible(false);
                  setEditingMeal(null);
                  loadData();
                },
              },
            ]
          );
          return;
        }

        // Create new meal
        await createMealPlan({
          recipe_id: recipeId,
          meal_type: selectedMealType,
          planned_date: dateStr,
          servings,
          is_completed: 0,
        });
      }

      setModalVisible(false);
      setEditingMeal(null);
      loadData();
    } catch (error) {
      console.error('Error saving meal plan:', error);
      Alert.alert('Error', 'Failed to save meal plan');
    }
  };

  const handleDeleteMeal = (plan: MealPlanWithRecipe) => {
    Alert.alert('Delete Meal', `Remove ${plan.recipe.name} from ${plan.meal_type}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMealPlan(plan.id);
            loadData();
          } catch (error) {
            console.error('Error deleting meal plan:', error);
            Alert.alert('Error', 'Failed to delete meal plan');
          }
        },
      },
    ]);
  };

  const handleSyncToGrocery = async () => {
    try {
      setLoading(true);
      const result = await syncMealPlanToGrocery(7);
      
      if (result.success) {
        if (result.itemsAdded > 0) {
          const ingredientList = result.missingIngredients
            .map((item) => `• ${item.name}: ${item.quantity.toFixed(1)} ${item.unit}`)
            .join('\n');
          
          Alert.alert(
            'Grocery List Updated',
            `${result.message}\n\nAdded items:\n${ingredientList}`,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Grocery List', result.message, [{ text: 'OK' }]);
        }
      } else {
        Alert.alert('Error', result.message, [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Error syncing to grocery:', error);
      Alert.alert('Error', 'Failed to sync meal plan to grocery list');
    } finally {
      setLoading(false);
    }
  };

  const getMealForType = (type: MealType) => {
    return mealPlans.find((plan) => plan.meal_type === type);
  };

  const renderMealSection = (mealType: MealType, title: string, icon: string) => {
    const meal = getMealForType(mealType);

    if (meal) {
      const totalCalories = (meal.recipe.calories_per_serving ?? 0) * meal.servings;
      const totalProtein = (meal.recipe.protein_grams ?? 0) * meal.servings;

      return (
        <View style={styles.mealSection} key={mealType}>
          <MealPlanCard
            mealType={mealType}
            recipeName={meal.recipe.name}
            servings={meal.servings}
            calories={totalCalories}
            protein={totalProtein}
            onEdit={() => handleEditMeal(meal)}
            onDelete={() => handleDeleteMeal(meal)}
          />
        </View>
      );
    }

    return (
      <View style={styles.mealSection} key={mealType}>
        <View style={styles.emptyMeal}>
          <Text style={styles.emptyMealIcon}>{icon}</Text>
          <Text style={styles.emptyMealTitle}>{title}</Text>
          <TouchableOpacity
            style={styles.addMealButton}
            onPress={() => handleAddMeal(mealType)}
            activeOpacity={0.7}
          >
            <Text style={styles.addMealButtonText}>+ Add {title}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Calculate daily nutrition
  const dailyNutrition = calculateDailyNutrition(mealPlans);
  const comparison = compareToTargets(dailyNutrition, nutritionTargets);

  const isToday =
    formatDateForDB(selectedDate) === formatDateForDB(new Date());

  return (
    <View style={styles.container}>
      <View style={styles.dateSelector}>
        <TouchableOpacity style={styles.dateButton} onPress={handlePrevDay} activeOpacity={0.7}>
          <Text style={styles.dateButtonText}>◀ Prev</Text>
        </TouchableOpacity>
        <View style={styles.dateDisplay}>
          <Text style={styles.dateText}>{formatDateForDisplay(formatDateForDB(selectedDate))}</Text>
          {isToday && <Text style={styles.todayBadge}>Today</Text>}
        </View>
        <TouchableOpacity style={styles.dateButton} onPress={handleNextDay} activeOpacity={0.7}>
          <Text style={styles.dateButtonText}>Next ▶</Text>
        </TouchableOpacity>
      </View>

      {!isToday && (
        <TouchableOpacity style={styles.todayButton} onPress={handleToday} activeOpacity={0.7}>
          <Text style={styles.todayButtonText}>Jump to Today</Text>
        </TouchableOpacity>
      )}

      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : (
          <>
            {mealPlans.length > 0 && (
              <>
                <TouchableOpacity
                  style={styles.syncButton}
                  onPress={handleSyncToGrocery}
                  activeOpacity={0.7}
                >
                  <Text style={styles.syncButtonIcon}>🛒</Text>
                  <View style={styles.syncButtonContent}>
                    <Text style={styles.syncButtonTitle}>Sync to Grocery List</Text>
                    <Text style={styles.syncButtonSubtitle}>Add missing ingredients for next 7 days</Text>
                  </View>
                </TouchableOpacity>
                <NutritionSummaryCard comparison={comparison} />
              </>
            )}

            {renderMealSection('breakfast', 'Breakfast', '🌅')}
            {renderMealSection('lunch', 'Lunch', '☀️')}
            {renderMealSection('dinner', 'Dinner', '🌙')}

            {mealPlans.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📅</Text>
                <Text style={styles.emptyStateTitle}>No meals planned</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Start planning your meals by adding breakfast, lunch, or dinner
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <AddMealModal
        visible={modalVisible}
        date={formatDateForDB(selectedDate)}
        mealType={selectedMealType}
        recipes={recipes}
        editingMeal={editingMeal}
        onSave={handleSaveMeal}
        onCancel={() => {
          setModalVisible(false);
          setEditingMeal(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dateButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  dateDisplay: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  todayBadge: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 2,
  },
  todayButton: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 32,
  },
  mealSection: {
    marginBottom: 16,
  },
  emptyMeal: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e0e0e0',
  },
  emptyMealIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyMealTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  addMealButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  addMealButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  syncButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 44,
  },
  syncButtonIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  syncButtonContent: {
    flex: 1,
  },
  syncButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  syncButtonSubtitle: {
    fontSize: 12,
    color: '#E3F2FD',
  },
});
