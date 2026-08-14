/**
 * Meal Planner screen
 * Plan and schedule meals
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Recipe, MealType, MealPlan, PreparationTask } from '../../src/database/types';
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
import ScreenContainer from '../../src/components/common/ScreenContainer';
import PrimaryButton from '../../src/components/common/PrimaryButton';
import SecondaryButton from '../../src/components/common/SecondaryButton';
import SectionHeader from '../../src/components/common/SectionHeader';
import MealPlanCard from '../../src/components/MealPlanCard';
import AddMealModal from '../../src/components/AddMealModal';
import NutritionSummaryCard from '../../src/components/NutritionSummaryCard';
import MealPlanGeneratorModal from '../../src/components/MealPlanGeneratorModal';
import colors from '../../src/theme/colors';
import spacing from '../../src/theme/spacing';
import { textStyles, typography } from '../../src/theme/typography';
import { syncMealPlanToGrocery } from '../../src/modules/mealPlanning/mealPlanGroceryIntegration';
import { GeneratedMealPlan } from '../../src/modules/mealPlanning/mealPlanGenerator';
import {
  generatePreparationTasksForMeal,
  hasPreparationRequirements,
} from '../../src/modules/preparation/preparationLogic';
import { createPreparationTask, getTasksForMealPlan } from '../../src/modules/preparation/preparationData';
import {
  scheduleTaskNotification,
  requestNotificationPermissions,
  hasNotificationPermissions,
} from '../../src/modules/preparation/notificationManager';

export default function MealPlanScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealPlans, setMealPlans] = useState<MealPlanWithRecipe[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [generatorModalVisible, setGeneratorModalVisible] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
  const [editingMeal, setEditingMeal] = useState<{
    id: number;
    recipeId: number;
    servings: number;
  } | null>(null);
  const [nutritionTargets, setNutritionTargets] = useState<any>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Check notification permissions on mount
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const hasPerms = await hasNotificationPermissions();
        setNotificationsEnabled(hasPerms);
      })();
    }, [])
  );

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

        // Get updated recipe and regenerate prep tasks
        const recipe = await getRecipeById(recipeId);
        if (recipe && hasPreparationRequirements(recipe.name)) {
          // Get existing tasks for this meal and delete them
          const existingTasks = await getTasksForMealPlan(editingMeal.id);
          for (const task of existingTasks) {
            await require('../../src/modules/preparation/preparationData').deletePreparationTask(task.id);
          }

          // Generate new prep tasks
          const mealPlan = { id: editingMeal.id, meal_type: selectedMealType, planned_date: dateStr, recipe_id: recipeId, servings, is_completed: 0, created_at: '' } as MealPlan;
          const prepTasks = generatePreparationTasksForMeal(mealPlan, recipe);
          for (const task of prepTasks) {
            const taskId = await createPreparationTask(task);
            
            // Schedule notification if permissions granted
            if (notificationsEnabled && taskId) {
              const fullTask: PreparationTask = { ...task, id: taskId, created_at: new Date().toISOString() };
              await scheduleTaskNotification(fullTask);
            }
          }
        }
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

                  // Regenerate prep tasks for updated meal
                  const recipe = await getRecipeById(recipeId);
                  if (recipe && hasPreparationRequirements(recipe.name)) {
                    const existingTasks = await getTasksForMealPlan(existing.id);
                    for (const task of existingTasks) {
                      await require('../../src/modules/preparation/preparationData').deletePreparationTask(task.id);
                    }

                    const mealPlan = { ...existing, recipe_id: recipeId, servings };
                    const prepTasks = generatePreparationTasksForMeal(mealPlan, recipe);
                    for (const task of prepTasks) {
                      const taskId = await createPreparationTask(task);
                      
                      // Schedule notification if permissions granted
                      if (notificationsEnabled && taskId) {
                        const fullTask: PreparationTask = { ...task, id: taskId, created_at: new Date().toISOString() };
                        await scheduleTaskNotification(fullTask);
                      }
                    }
                  }

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
        const newMealId = await createMealPlan({
          recipe_id: recipeId,
          meal_type: selectedMealType,
          planned_date: dateStr,
          servings,
          is_completed: 0,
        });

        // Generate preparation tasks for the new meal
        const recipe = await getRecipeById(recipeId);
        if (recipe && hasPreparationRequirements(recipe.name)) {
          const mealPlan: MealPlan = {
            id: newMealId,
            recipe_id: recipeId,
            meal_type: selectedMealType,
            planned_date: dateStr,
            servings,
            is_completed: 0,
            created_at: new Date().toISOString(),
          };
          const prepTasks = generatePreparationTasksForMeal(mealPlan, recipe);
          for (const task of prepTasks) {
            const taskId = await createPreparationTask(task);
            
            // Schedule notification if permissions granted
            if (notificationsEnabled && taskId) {
              const fullTask: PreparationTask = { ...task, id: taskId, created_at: new Date().toISOString() };
              await scheduleTaskNotification(fullTask);
            }
          }
        }
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

  const handleGeneratePlan = () => {
    setGeneratorModalVisible(true);
  };

  const handleAcceptGeneratedPlan = async (plan: GeneratedMealPlan) => {
    try {
      const dateStr = formatDateForDB(selectedDate);

      // Create meals for each type
      const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner'];
      const planRecipes = [plan.breakfast, plan.lunch, plan.dinner];

      for (let i = 0; i < mealTypes.length; i++) {
        const mealType = mealTypes[i];
        const recipe = planRecipes[i];

        // Check if meal already exists
        const existing = await getMealPlanByDateAndType(dateStr, mealType);
        let mealPlanId: number;

        if (existing) {
          await updateMealPlan(existing.id, {
            recipe_id: recipe.id,
            servings: 1,
          });
          mealPlanId = existing.id;

          // Delete old prep tasks
          const existingTasks = await getTasksForMealPlan(existing.id);
          for (const task of existingTasks) {
            await require('../../src/modules/preparation/preparationData').deletePreparationTask(task.id);
          }
        } else {
          mealPlanId = await createMealPlan({
            recipe_id: recipe.id,
            meal_type: mealType,
            planned_date: dateStr,
            servings: 1,
            is_completed: 0,
          });
        }

        // Generate preparation tasks
        if (hasPreparationRequirements(recipe.name)) {
          const mealPlan: MealPlan = {
            id: mealPlanId,
            recipe_id: recipe.id,
            meal_type: mealType,
            planned_date: dateStr,
            servings: 1,
            is_completed: 0,
            created_at: new Date().toISOString(),
          };
          const prepTasks = generatePreparationTasksForMeal(mealPlan, recipe);
          for (const task of prepTasks) {
            const taskId = await createPreparationTask(task);
            
            // Schedule notification if permissions granted
            if (notificationsEnabled && taskId) {
              const fullTask: PreparationTask = { ...task, id: taskId, created_at: new Date().toISOString() };
              await scheduleTaskNotification(fullTask);
            }
          }
        }
      }

      const successMessage = notificationsEnabled
        ? 'Meal plan has been created with preparation reminders!'
        : 'Meal plan created! Enable notifications in settings to receive prep reminders.';
      Alert.alert('Success', successMessage, [{ text: 'OK' }]);
      loadData();
    } catch (error) {
      console.error('Error accepting generated plan:', error);
      Alert.alert('Error', 'Failed to save generated meal plan');
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
      {/* Date Selector */}
      <View style={styles.dateSelector}>
        <TouchableOpacity style={styles.dateButton} onPress={handlePrevDay} activeOpacity={0.7}>
          <Text style={styles.dateButtonText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.dateDisplay}>
          <Text style={styles.dateText}>{formatDateForDisplay(formatDateForDB(selectedDate))}</Text>
          {isToday && <View style={styles.todayBadge}><Text style={styles.todayBadgeText}>Today</Text></View>}
        </View>
        <TouchableOpacity style={styles.dateButton} onPress={handleNextDay} activeOpacity={0.7}>
          <Text style={styles.dateButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {!isToday && (
        <View style={styles.todayButtonContainer}>
          <SecondaryButton
            title="Jump to Today"
            onPress={handleToday}
            style={styles.todayButton}
          />
        </View>
      )}

      <ScreenContainer scrollable={true}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <>
            {/* Action Buttons */}
            <View style={styles.actionsSection}>
              <TouchableOpacity
                style={styles.generateCard}
                onPress={handleGeneratePlan}
                activeOpacity={0.7}
              >
                <View style={styles.generateIcon}>
                  <Text style={styles.generateIconText}>✨</Text>
                </View>
                <View style={styles.generateContent}>
                  <Text style={styles.generateTitle}>Generate Meal Plan</Text>
                  <Text style={styles.generateSubtitle}>
                    Create balanced meals for your nutrition goals
                  </Text>
                </View>
              </TouchableOpacity>

              {mealPlans.length > 0 && (
                <TouchableOpacity
                  style={styles.syncCard}
                  onPress={handleSyncToGrocery}
                  activeOpacity={0.7}
                >
                  <View style={styles.syncIcon}>
                    <Text style={styles.syncIconText}>🛒</Text>
                  </View>
                  <View style={styles.syncContent}>
                    <Text style={styles.syncTitle}>Sync to Grocery List</Text>
                    <Text style={styles.syncSubtitle}>Add ingredients for next 7 days</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Nutrition Summary */}
            {mealPlans.length > 0 && (
              <View style={styles.nutritionSection}>
                <NutritionSummaryCard comparison={comparison} />
              </View>
            )}

            {/* Meals Section */}
            <View style={styles.mealsSection}>
              <SectionHeader title="Today's Meals" />
              {renderMealSection('breakfast', 'Breakfast', '🌅')}
              {renderMealSection('lunch', 'Lunch', '☀️')}
              {renderMealSection('dinner', 'Dinner', '🌙')}
            </View>

            {mealPlans.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📅</Text>
                <Text style={styles.emptyStateTitle}>No meals planned</Text>
                <Text style={styles.emptyStateMessage}>
                  Add breakfast, lunch, or dinner to start planning
                </Text>
              </View>
            )}
          </>
        )}
      </ScreenContainer>

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

      <MealPlanGeneratorModal
        visible={generatorModalVisible}
        onClose={() => setGeneratorModalVisible(false)}
        onAcceptPlan={handleAcceptGeneratedPlan}
        recipes={recipes}
        nutritionTarget={nutritionTargets}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dateButton: {
    width: spacing.buttonHeight,
    height: spacing.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: spacing.radiusMedium,
    backgroundColor: colors.surfaceLight,
  },
  dateButtonText: {
    fontSize: 28,
    color: colors.primary,
    fontWeight: typography.weight.bold,
  },
  dateDisplay: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  dateText: {
    ...textStyles.title,
    fontSize: typography.size.lg,
  },
  todayBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.radiusSmall,
    marginTop: spacing.xs,
  },
  todayBadgeText: {
    ...textStyles.caption,
    color: colors.textOnPrimary,
    fontWeight: typography.weight.semibold,
  },
  todayButtonContainer: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  todayButton: {
    width: '100%',
  },
  loadingContainer: {
    paddingVertical: spacing.huge,
    alignItems: 'center',
  },
  loadingText: {
    ...textStyles.body,
    color: colors.textTertiary,
  },
  actionsSection: {
    gap: spacing.cardGap,
    marginBottom: spacing.sectionGap,
  },
  generateCard: {
    backgroundColor: colors.primary,
    borderRadius: spacing.radiusMedium,
    padding: spacing.cardPaddingLarge,
    flexDirection: 'row',
    alignItems: 'center',
  },
  generateIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  generateIconText: {
    fontSize: 28,
  },
  generateContent: {
    flex: 1,
  },
  generateTitle: {
    ...textStyles.cardTitle,
    color: colors.textOnPrimary,
    marginBottom: spacing.xs,
  },
  generateSubtitle: {
    ...textStyles.caption,
    color: colors.secondary,
  },
  syncCard: {
    backgroundColor: colors.info,
    borderRadius: spacing.radiusMedium,
    padding: spacing.cardPaddingLarge,
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  syncIconText: {
    fontSize: 28,
  },
  syncContent: {
    flex: 1,
  },
  syncTitle: {
    ...textStyles.cardTitle,
    color: colors.textOnPrimary,
    marginBottom: spacing.xs,
  },
  syncSubtitle: {
    ...textStyles.caption,
    color: colors.secondary,
  },
  nutritionSection: {
    marginBottom: spacing.sectionGap,
  },
  mealsSection: {
    gap: spacing.cardGap,
  },
  mealSection: {
    marginTop: spacing.cardGap,
  },
  emptyMeal: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radiusMedium,
    padding: spacing.cardPaddingLarge,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.borderLight,
  },
  emptyMealIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  emptyMealTitle: {
    ...textStyles.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  addMealButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.radiusMedium,
    minHeight: spacing.buttonHeight,
    justifyContent: 'center',
  },
  addMealButtonText: {
    ...textStyles.button,
    color: colors.textOnPrimary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.huge,
    paddingHorizontal: spacing.lg,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: spacing.base,
  },
  emptyStateTitle: {
    ...textStyles.subtitle,
    marginBottom: spacing.sm,
  },
  emptyStateMessage: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
