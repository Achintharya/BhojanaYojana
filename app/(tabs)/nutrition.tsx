/**
 * Nutrition screen
 * Set and track nutritional goals
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
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
import ScreenContainer from '../../src/components/common/ScreenContainer';
import SectionHeader from '../../src/components/common/SectionHeader';
import EmptyState from '../../src/components/common/EmptyState';
import NutritionSummaryCard from '../../src/components/NutritionSummaryCard';
import NutritionTargetEditor from '../../src/components/NutritionTargetEditor';
import colors from '../../src/theme/colors';
import spacing from '../../src/theme/spacing';
import { textStyles, typography } from '../../src/theme/typography';

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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Daily Nutrition Targets</Text>
          <Text style={styles.headerSubtitle}>
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

      <ScreenContainer scrollable={true}>
        {/* Targets Card */}
        <View style={styles.targetsCard}>
          <View style={styles.targetRow}>
            <View style={styles.targetLeft}>
              <Text style={styles.targetIcon}>🔥</Text>
              <Text style={styles.targetLabel}>Calories</Text>
            </View>
            <Text style={styles.targetValue}>{roundToDecimal(displayTargets.calories, 0)} kcal</Text>
          </View>
          <View style={styles.targetRow}>
            <View style={styles.targetLeft}>
              <Text style={styles.targetIcon}>💪</Text>
              <Text style={styles.targetLabel}>Protein</Text>
            </View>
            <Text style={styles.targetValue}>{roundToDecimal(displayTargets.protein, 1)} g</Text>
          </View>
          <View style={styles.targetRow}>
            <View style={styles.targetLeft}>
              <Text style={styles.targetIcon}>🌾</Text>
              <Text style={styles.targetLabel}>Carbs</Text>
            </View>
            <Text style={styles.targetValue}>{roundToDecimal(displayTargets.carbs, 1)} g</Text>
          </View>
          <View style={styles.targetRow}>
            <View style={styles.targetLeft}>
              <Text style={styles.targetIcon}>🥑</Text>
              <Text style={styles.targetLabel}>Fat</Text>
            </View>
            <Text style={styles.targetValue}>{roundToDecimal(displayTargets.fat, 1)} g</Text>
          </View>
          <View style={styles.targetRow}>
            <View style={styles.targetLeft}>
              <Text style={styles.targetIcon}>🥬</Text>
              <Text style={styles.targetLabel}>Fiber</Text>
            </View>
            <Text style={styles.targetValue}>{roundToDecimal(displayTargets.fiber, 1)} g</Text>
          </View>
        </View>

        {/* Today's Progress Section */}
        <View style={styles.progressSection}>
          <SectionHeader title="Today's Progress" />

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : todayMealPlans.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No meals planned today"
              message="Add meals in the Meal Planner to track your nutrition"
            />
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
        </View>

        {/* Info Note */}
        <View style={styles.infoNote}>
          <Text style={styles.infoNoteTitle}>ℹ️ About This Feature</Text>
          <Text style={styles.infoNoteText}>
            This tool helps you plan meals that align with your nutritional goals. The comparison
            shows how your planned meals match your targets. Remember, this is for guidance only -
            consult healthcare professionals for personalized nutrition advice.
          </Text>
        </View>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.base,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flex: 1,
    paddingRight: spacing.md,
  },
  headerTitle: {
    ...textStyles.title,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  editButton: {
    backgroundColor: colors.info,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.radiusMedium,
    minHeight: spacing.buttonHeight,
    justifyContent: 'center',
  },
  editButtonText: {
    ...textStyles.button,
    color: colors.textOnPrimary,
  },
  targetsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radiusMedium,
    padding: spacing.cardPaddingLarge,
    marginBottom: spacing.sectionGap,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  targetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  targetIcon: {
    fontSize: 24,
  },
  targetLabel: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
  targetValue: {
    ...textStyles.body,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  progressSection: {
    gap: spacing.cardGap,
  },
  loadingContainer: {
    paddingVertical: spacing.huge,
    alignItems: 'center',
  },
  loadingText: {
    ...textStyles.body,
    color: colors.textTertiary,
  },
  warningsCard: {
    backgroundColor: colors.warningLight,
    borderRadius: spacing.radiusMedium,
    padding: spacing.cardPaddingLarge,
    marginTop: spacing.cardGap,
  },
  warningsTitle: {
    ...textStyles.cardTitle,
    color: colors.warning,
    marginBottom: spacing.sm,
  },
  warningText: {
    ...textStyles.body,
    color: colors.warning,
    marginVertical: spacing.xs,
  },
  alignedText: {
    ...textStyles.body,
    color: colors.success,
    marginTop: spacing.sm,
    fontWeight: typography.weight.semibold,
  },
  successCard: {
    backgroundColor: colors.successLight,
    borderRadius: spacing.radiusMedium,
    padding: spacing.cardPaddingLarge,
    alignItems: 'center',
    marginTop: spacing.cardGap,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  successTitle: {
    ...textStyles.subtitle,
    color: colors.success,
    marginBottom: spacing.sm,
  },
  successText: {
    ...textStyles.body,
    color: colors.success,
    textAlign: 'center',
  },
  mealsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radiusMedium,
    padding: spacing.cardPaddingLarge,
    marginTop: spacing.cardGap,
  },
  mealsTitle: {
    ...textStyles.cardTitle,
    marginBottom: spacing.sm,
  },
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  mealName: {
    ...textStyles.body,
    color: colors.textSecondary,
    flex: 1,
  },
  mealServings: {
    ...textStyles.body,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  infoNote: {
    backgroundColor: colors.infoLight,
    borderRadius: spacing.radiusMedium,
    padding: spacing.cardPaddingLarge,
    marginTop: spacing.sectionGap,
  },
  infoNoteTitle: {
    ...textStyles.cardTitle,
    color: colors.info,
    marginBottom: spacing.sm,
  },
  infoNoteText: {
    ...textStyles.caption,
    color: colors.info,
    lineHeight: 20,
  },
});
