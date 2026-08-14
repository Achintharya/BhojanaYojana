/**
 * Meal planning business logic
 * Pure, deterministic functions for meal planning operations
 */
import { Recipe, MealPlan, NutritionTarget, RecipeIngredient, PantryItem } from '../../database/types';

export interface DailyNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface NutritionComparison {
  actual: DailyNutrition;
  target: DailyNutrition;
  remaining: DailyNutrition;
  status: {
    calories: 'below' | 'met' | 'exceeded';
    protein: 'below' | 'met' | 'exceeded';
    carbs: 'below' | 'met' | 'exceeded';
    fat: 'below' | 'met' | 'exceeded';
    fiber: 'below' | 'met' | 'exceeded';
  };
}

export interface IngredientRequirement {
  pantryItemId: number;
  name: string;
  requiredQuantity: number;
  unit: string;
  availableQuantity: number;
  missingQuantity: number;
}

export interface MealPlanWithRecipe extends MealPlan {
  recipe: Recipe;
}

/**
 * Calculate daily nutrition from meal plans
 */
export function calculateDailyNutrition(mealPlansWithRecipes: MealPlanWithRecipe[]): DailyNutrition {
  const nutrition: DailyNutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  };

  for (const mealPlan of mealPlansWithRecipes) {
    const recipe = mealPlan.recipe;
    const servings = mealPlan.servings;

    // Multiply recipe nutrition by servings planned
    nutrition.calories += (recipe.calories_per_serving ?? 0) * servings;
    nutrition.protein += (recipe.protein_grams ?? 0) * servings;
    nutrition.carbs += (recipe.carbs_grams ?? 0) * servings;
    nutrition.fat += (recipe.fat_grams ?? 0) * servings;
    nutrition.fiber += (recipe.fiber_grams ?? 0) * servings;
  }

  return nutrition;
}

/**
 * Compare actual nutrition to targets
 */
export function compareToTargets(
  actual: DailyNutrition,
  targets: NutritionTarget | null
): NutritionComparison {
  const target: DailyNutrition = {
    calories: targets?.calories_target ?? 2000,
    protein: targets?.protein_target ?? 50,
    carbs: targets?.carbs_target ?? 250,
    fat: targets?.fat_target ?? 70,
    fiber: targets?.fiber_target ?? 25,
  };

  const remaining: DailyNutrition = {
    calories: target.calories - actual.calories,
    protein: target.protein - actual.protein,
    carbs: target.carbs - actual.carbs,
    fat: target.fat - actual.fat,
    fiber: target.fiber - actual.fiber,
  };

  // Determine status for each nutrient (within 10% tolerance = "met")
  const getStatus = (actualValue: number, targetValue: number): 'below' | 'met' | 'exceeded' => {
    if (targetValue === 0) return 'met';
    const percentage = (actualValue / targetValue) * 100;
    if (percentage < 90) return 'below';
    if (percentage > 110) return 'exceeded';
    return 'met';
  };

  return {
    actual,
    target,
    remaining,
    status: {
      calories: getStatus(actual.calories, target.calories),
      protein: getStatus(actual.protein, target.protein),
      carbs: getStatus(actual.carbs, target.carbs),
      fat: getStatus(actual.fat, target.fat),
      fiber: getStatus(actual.fiber, target.fiber),
    },
  };
}

/**
 * Validate if meal plan aligns with nutrition targets
 */
export function validateDietAlignment(comparison: NutritionComparison): {
  isAligned: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  let isAligned = true;

  if (comparison.status.calories === 'below') {
    warnings.push('Calorie intake is below target');
    isAligned = false;
  } else if (comparison.status.calories === 'exceeded') {
    warnings.push('Calorie intake exceeds target');
    isAligned = false;
  }

  if (comparison.status.protein === 'below') {
    warnings.push('Protein intake is below target');
    isAligned = false;
  }

  if (comparison.status.carbs === 'exceeded') {
    warnings.push('Carbohydrate intake exceeds target');
  }

  if (comparison.status.fat === 'exceeded') {
    warnings.push('Fat intake exceeds target');
  }

  if (comparison.status.fiber === 'below') {
    warnings.push('Fiber intake is below target');
  }

  return { isAligned, warnings };
}

/**
 * Aggregate ingredient requirements from multiple meal plans
 */
export function aggregateIngredientRequirements(
  recipeIngredients: { [recipeId: number]: RecipeIngredient[] },
  mealPlans: MealPlan[]
): Map<number, { pantryItemId: number; quantity: number; unit: string }> {
  const aggregated = new Map<number, { pantryItemId: number; quantity: number; unit: string }>();

  for (const mealPlan of mealPlans) {
    const ingredients = recipeIngredients[mealPlan.recipe_id] || [];

    for (const ingredient of ingredients) {
      const requiredQuantity = ingredient.quantity * mealPlan.servings;
      const existing = aggregated.get(ingredient.pantry_item_id);

      if (existing) {
        // Aggregate quantities (assumes same unit)
        existing.quantity += requiredQuantity;
      } else {
        aggregated.set(ingredient.pantry_item_id, {
          pantryItemId: ingredient.pantry_item_id,
          quantity: requiredQuantity,
          unit: ingredient.unit,
        });
      }
    }
  }

  return aggregated;
}

/**
 * Compare required ingredients against pantry inventory
 */
export function getMissingIngredients(
  required: Map<number, { pantryItemId: number; quantity: number; unit: string }>,
  pantryItems: PantryItem[]
): IngredientRequirement[] {
  const pantryMap = new Map<number, PantryItem>();
  for (const item of pantryItems) {
    pantryMap.set(item.id, item);
  }

  const missing: IngredientRequirement[] = [];

  for (const [pantryItemId, requirement] of required.entries()) {
    const pantryItem = pantryMap.get(pantryItemId);

    if (!pantryItem) {
      // Pantry item not found (recipe references non-existent item)
      continue;
    }

    const availableQuantity = pantryItem.quantity;
    const requiredQuantity = requirement.quantity;
    const missingQuantity = Math.max(0, requiredQuantity - availableQuantity);

    if (missingQuantity > 0) {
      missing.push({
        pantryItemId,
        name: pantryItem.name,
        requiredQuantity,
        unit: requirement.unit,
        availableQuantity,
        missingQuantity,
      });
    }
  }

  return missing;
}

/**
 * Format date as YYYY-MM-DD (SQLite date format)
 */
export function formatDateForDB(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date for display (DD/MM/YYYY)
 */
export function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Get date relative to today
 */
export function getRelativeDate(daysOffset: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Check if date is in the past
 */
export function isPastDate(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Check if recipe has incomplete nutrition data
 */
export function hasIncompleteNutrition(recipe: Recipe): boolean {
  return (
    recipe.calories_per_serving === null ||
    recipe.protein_grams === null ||
    recipe.carbs_grams === null ||
    recipe.fat_grams === null ||
    recipe.fiber_grams === null
  );
}

/**
 * Round number to specified decimal places
 */
export function roundToDecimal(value: number, decimals: number = 1): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
