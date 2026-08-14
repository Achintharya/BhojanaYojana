/**
 * Meal Plan → Grocery List Integration
 * Syncs upcoming meal plan ingredients to grocery list
 */
import { getUpcomingMealPlans } from './mealPlanData';
import { getRecipeIngredients } from '../recipes/recipeData';
import { getAllPantryItems } from '../pantry/pantryData';
import { createGroceryItem, deleteGroceryItemsBySource } from '../grocery/groceryData';
import { aggregateIngredientRequirements, getMissingIngredients } from './mealPlanningLogic';
import { RecipeIngredient, PantryItem } from '../../database/types';

export interface MealPlanSyncResult {
  success: boolean;
  itemsAdded: number;
  message: string;
  missingIngredients: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
}

/**
 * Sync meal plan ingredients to grocery list
 * - Gets upcoming meal plans (next 7 days)
 * - Aggregates required ingredients
 * - Compares with pantry inventory
 * - Adds missing items to grocery list with source='meal_plan'
 */
export async function syncMealPlanToGrocery(daysAhead: number = 7): Promise<MealPlanSyncResult> {
  try {
    // 1. Clear existing meal_plan grocery items to avoid duplicates
    await deleteGroceryItemsBySource('meal_plan');

    // 2. Get upcoming meal plans
    const mealPlans = await getUpcomingMealPlans(daysAhead);

    if (mealPlans.length === 0) {
      return {
        success: true,
        itemsAdded: 0,
        message: `No meal plans found for the next ${daysAhead} days`,
        missingIngredients: [],
      };
    }

    // 3. Get recipe ingredients for all planned recipes
    const recipeIngredientsMap: { [recipeId: number]: RecipeIngredient[] } = {};
    const uniqueRecipeIds = [...new Set(mealPlans.map((mp) => mp.recipe_id))];

    for (const recipeId of uniqueRecipeIds) {
      const ingredients = await getRecipeIngredients(recipeId);
      recipeIngredientsMap[recipeId] = ingredients;
    }

    // 4. Aggregate ingredient requirements across all meal plans
    const aggregated = aggregateIngredientRequirements(recipeIngredientsMap, mealPlans);

    if (aggregated.size === 0) {
      return {
        success: true,
        itemsAdded: 0,
        message: 'No ingredients found in planned recipes',
        missingIngredients: [],
      };
    }

    // 5. Get current pantry inventory
    const pantryItems = await getAllPantryItems();

    // 6. Compare required vs available and get missing ingredients
    const missingIngredients = getMissingIngredients(aggregated, pantryItems);

    if (missingIngredients.length === 0) {
      return {
        success: true,
        itemsAdded: 0,
        message: 'All ingredients are available in pantry!',
        missingIngredients: [],
      };
    }

    // 7. Create grocery items for missing ingredients
    let itemsAdded = 0;
    for (const missing of missingIngredients) {
      await createGroceryItem({
        pantry_item_id: missing.pantryItemId,
        name: missing.name,
        quantity: missing.missingQuantity,
        unit: missing.unit,
        is_purchased: 0,
        auto_generated: 1,
        source: 'meal_plan',
      });
      itemsAdded++;
    }

    // 8. Return success result
    return {
      success: true,
      itemsAdded,
      message: `Added ${itemsAdded} missing ingredient${itemsAdded !== 1 ? 's' : ''} to grocery list`,
      missingIngredients: missingIngredients.map((m) => ({
        name: m.name,
        quantity: m.missingQuantity,
        unit: m.unit,
      })),
    };
  } catch (error) {
    console.error('Error syncing meal plan to grocery:', error);
    return {
      success: false,
      itemsAdded: 0,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      missingIngredients: [],
    };
  }
}

/**
 * Get summary of meal plan ingredient requirements
 * Useful for displaying what will be needed without syncing
 */
export async function getMealPlanIngredientSummary(daysAhead: number = 7): Promise<{
  totalMeals: number;
  totalIngredients: number;
  ingredients: Array<{ name: string; required: number; available: number; unit: string }>;
}> {
  try {
    const mealPlans = await getUpcomingMealPlans(daysAhead);

    if (mealPlans.length === 0) {
      return { totalMeals: 0, totalIngredients: 0, ingredients: [] };
    }

    // Get recipe ingredients
    const recipeIngredientsMap: { [recipeId: number]: RecipeIngredient[] } = {};
    const uniqueRecipeIds = [...new Set(mealPlans.map((mp) => mp.recipe_id))];

    for (const recipeId of uniqueRecipeIds) {
      const ingredients = await getRecipeIngredients(recipeId);
      recipeIngredientsMap[recipeId] = ingredients;
    }

    // Aggregate requirements
    const aggregated = aggregateIngredientRequirements(recipeIngredientsMap, mealPlans);

    // Get pantry items
    const pantryItems = await getAllPantryItems();
    const pantryMap = new Map<number, PantryItem>();
    for (const item of pantryItems) {
      pantryMap.set(item.id, item);
    }

    // Build summary
    const ingredients = Array.from(aggregated.values()).map((req) => {
      const pantryItem = pantryMap.get(req.pantryItemId);
      return {
        name: pantryItem?.name ?? 'Unknown',
        required: req.quantity,
        available: pantryItem?.quantity ?? 0,
        unit: req.unit,
      };
    });

    return {
      totalMeals: mealPlans.length,
      totalIngredients: aggregated.size,
      ingredients,
    };
  } catch (error) {
    console.error('Error getting meal plan summary:', error);
    return { totalMeals: 0, totalIngredients: 0, ingredients: [] };
  }
}
