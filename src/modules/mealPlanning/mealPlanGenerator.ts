/**
 * Meal plan generation business logic
 * Deterministic diet-aligned meal plan generation
 */
import { Recipe, NutritionTarget } from '../../database/types';
import { DailyNutrition, calculateDailyNutrition } from './mealPlanningLogic';

export interface GeneratedMealPlan {
  breakfast: Recipe;
  lunch: Recipe;
  dinner: Recipe;
  totalNutrition: DailyNutrition;
  alignmentScore: number;
  warnings: string[];
}

export interface GenerationOptions {
  preferredBreakfastRecipes?: number[];
  preferredLunchRecipes?: number[];
  preferredDinnerRecipes?: number[];
  maxAttempts?: number;
}

/**
 * Generate a meal plan aligned with nutrition targets
 */
export function generateMealPlan(
  recipes: Recipe[],
  nutritionTarget: NutritionTarget | null,
  options: GenerationOptions = {}
): GeneratedMealPlan | null {
  // Filter out recipes without complete nutrition data
  const recipesWithNutrition = recipes.filter(
    (r) =>
      r.calories_per_serving !== null &&
      r.protein_grams !== null &&
      r.carbs_grams !== null &&
      r.fat_grams !== null &&
      r.fiber_grams !== null
  );

  if (recipesWithNutrition.length < 3) {
    // Not enough recipes to generate a plan
    return null;
  }

  // Set default targets if not provided
  const targets = {
    calories: nutritionTarget?.calories_target ?? 2000,
    protein: nutritionTarget?.protein_target ?? 50,
    carbs: nutritionTarget?.carbs_target ?? 250,
    fat: nutritionTarget?.fat_target ?? 70,
    fiber: nutritionTarget?.fiber_target ?? 25,
  };

  // Categorize recipes by likely meal type (heuristic based on calories)
  const breakfastRecipes = recipesWithNutrition.filter(
    (r) => (r.calories_per_serving ?? 0) <= 350
  );
  const lunchRecipes = recipesWithNutrition.filter(
    (r) => (r.calories_per_serving ?? 0) > 250 && (r.calories_per_serving ?? 0) <= 600
  );
  const dinnerRecipes = recipesWithNutrition.filter(
    (r) => (r.calories_per_serving ?? 0) > 250 && (r.calories_per_serving ?? 0) <= 600
  );

  // Fallback: if categories are empty, use all recipes
  const breakfastPool = breakfastRecipes.length > 0 ? breakfastRecipes : recipesWithNutrition;
  const lunchPool = lunchRecipes.length > 0 ? lunchRecipes : recipesWithNutrition;
  const dinnerPool = dinnerRecipes.length > 0 ? dinnerRecipes : recipesWithNutrition;

  const maxAttempts = options.maxAttempts ?? 100;
  let bestPlan: GeneratedMealPlan | null = null;
  let bestScore = Infinity;

  // Try different combinations
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const breakfast = breakfastPool[Math.floor(Math.random() * breakfastPool.length)];
    const lunch = lunchPool[Math.floor(Math.random() * lunchPool.length)];
    const dinner = dinnerPool[Math.floor(Math.random() * dinnerPool.length)];

    // Calculate total nutrition
    const totalNutrition = calculateDailyNutrition([
      { recipe: breakfast, servings: 1, meal_type: 'breakfast' } as any,
      { recipe: lunch, servings: 1, meal_type: 'lunch' } as any,
      { recipe: dinner, servings: 1, meal_type: 'dinner' } as any,
    ]);

    // Calculate alignment score (lower is better)
    const score = calculateAlignmentScore(totalNutrition, targets);

    // Check warnings
    const warnings = generateWarnings(totalNutrition, targets);

    const plan: GeneratedMealPlan = {
      breakfast,
      lunch,
      dinner,
      totalNutrition,
      alignmentScore: score,
      warnings,
    };

    if (score < bestScore) {
      bestScore = score;
      bestPlan = plan;
    }

    // If we found a very good match, stop early
    if (score < 50) {
      break;
    }
  }

  return bestPlan;
}

/**
 * Calculate how well nutrition aligns with targets
 * Lower score = better alignment
 */
function calculateAlignmentScore(
  actual: DailyNutrition,
  target: DailyNutrition
): number {
  // Calculate percentage differences
  const caloriesDiff = Math.abs((actual.calories - target.calories) / target.calories);
  const proteinDiff = Math.abs((actual.protein - target.protein) / target.protein);
  const carbsDiff = Math.abs((actual.carbs - target.carbs) / target.carbs);
  const fatDiff = Math.abs((actual.fat - target.fat) / target.fat);
  const fiberDiff = Math.abs((actual.fiber - target.fiber) / target.fiber);

  // Weight calories and protein more heavily
  const score =
    caloriesDiff * 100 * 2 + // Calories weighted 2x
    proteinDiff * 100 * 2 + // Protein weighted 2x
    carbsDiff * 100 +
    fatDiff * 100 +
    fiberDiff * 100;

  return score;
}

/**
 * Generate warnings for nutrition deviations
 */
function generateWarnings(
  actual: DailyNutrition,
  target: DailyNutrition
): string[] {
  const warnings: string[] = [];

  const caloriesPercent = (actual.calories / target.calories) * 100;
  const proteinPercent = (actual.protein / target.protein) * 100;
  const carbsPercent = (actual.carbs / target.carbs) * 100;
  const fatPercent = (actual.fat / target.fat) * 100;
  const fiberPercent = (actual.fiber / target.fiber) * 100;

  if (caloriesPercent < 80) {
    warnings.push('Calories are significantly below target');
  } else if (caloriesPercent > 120) {
    warnings.push('Calories exceed target by more than 20%');
  }

  if (proteinPercent < 80) {
    warnings.push('Protein intake is below target');
  }

  if (carbsPercent > 120) {
    warnings.push('Carbohydrate intake is high');
  }

  if (fatPercent > 120) {
    warnings.push('Fat intake is high');
  }

  if (fiberPercent < 80) {
    warnings.push('Fiber intake is below target');
  }

  return warnings;
}

/**
 * Generate multiple meal plan options
 */
export function generateMultiplePlans(
  recipes: Recipe[],
  nutritionTarget: NutritionTarget | null,
  count: number = 3
): GeneratedMealPlan[] {
  const plans: GeneratedMealPlan[] = [];
  const usedCombinations = new Set<string>();

  let attempts = 0;
  const maxAttempts = count * 50;

  while (plans.length < count && attempts < maxAttempts) {
    attempts++;
    const plan = generateMealPlan(recipes, nutritionTarget, { maxAttempts: 20 });

    if (plan) {
      // Create a unique key for this combination
      const key = `${plan.breakfast.id}-${plan.lunch.id}-${plan.dinner.id}`;

      if (!usedCombinations.has(key)) {
        usedCombinations.add(key);
        plans.push(plan);
      }
    }
  }

  // Sort by alignment score (best first)
  return plans.sort((a, b) => a.alignmentScore - b.alignmentScore);
}

/**
 * Evaluate how good a generated plan is
 */
export function evaluatePlanQuality(plan: GeneratedMealPlan): {
  rating: 'excellent' | 'good' | 'fair' | 'poor';
  message: string;
} {
  if (plan.alignmentScore < 50) {
    return {
      rating: 'excellent',
      message: 'This plan closely matches your nutrition targets',
    };
  } else if (plan.alignmentScore < 100) {
    return {
      rating: 'good',
      message: 'This plan is well-aligned with your nutrition targets',
    };
  } else if (plan.alignmentScore < 200) {
    return {
      rating: 'fair',
      message: 'This plan is reasonably aligned with your targets',
    };
  } else {
    return {
      rating: 'poor',
      message: 'This plan deviates significantly from your targets',
    };
  }
}
