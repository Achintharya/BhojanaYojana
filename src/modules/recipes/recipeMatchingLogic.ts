/**
 * Recipe matching business logic
 * Deterministic "What's in my fridge?" functionality
 */
import { Recipe, RecipeIngredient, PantryItem } from '../../database/types';

export interface IngredientMatch {
  pantryItemId: number;
  name: string;
  required: number;
  available: number;
  unit: string;
  isSufficient: boolean;
  isOptional: boolean;
}

export interface RecipeMatch {
  recipe: Recipe;
  allRequiredIngredientsAvailable: boolean;
  matchedIngredients: IngredientMatch[];
  missingIngredients: IngredientMatch[];
  optionalIngredients: IngredientMatch[];
}

/**
 * Match recipes against current pantry inventory
 * Returns only recipes where ALL required ingredients are available in sufficient quantity
 */
export function matchRecipesWithPantry(
  recipes: Recipe[],
  recipeIngredients: Map<number, RecipeIngredient[]>,
  pantryItems: PantryItem[]
): RecipeMatch[] {
  // Create pantry lookup map for quick access
  const pantryMap = new Map<number, PantryItem>();
  for (const item of pantryItems) {
    pantryMap.set(item.id, item);
  }

  const matches: RecipeMatch[] = [];

  for (const recipe of recipes) {
    const ingredients = recipeIngredients.get(recipe.id) || [];
    const match = matchRecipeWithPantry(recipe, ingredients, pantryMap);
    matches.push(match);
  }

  return matches;
}

/**
 * Match a single recipe against pantry inventory
 */
function matchRecipeWithPantry(
  recipe: Recipe,
  ingredients: RecipeIngredient[],
  pantryMap: Map<number, PantryItem>
): RecipeMatch {
  const matchedIngredients: IngredientMatch[] = [];
  const missingIngredients: IngredientMatch[] = [];
  const optionalIngredients: IngredientMatch[] = [];

  let allRequiredIngredientsAvailable = true;

  for (const ingredient of ingredients) {
    const pantryItem = pantryMap.get(ingredient.pantry_item_id);
    const isOptional = ingredient.is_optional === 1;

    if (!pantryItem) {
      // Pantry item doesn't exist (data integrity issue)
      const ingredientMatch: IngredientMatch = {
        pantryItemId: ingredient.pantry_item_id,
        name: 'Unknown Item',
        required: ingredient.quantity,
        available: 0,
        unit: ingredient.unit,
        isSufficient: false,
        isOptional,
      };

      if (isOptional) {
        optionalIngredients.push(ingredientMatch);
      } else {
        missingIngredients.push(ingredientMatch);
        allRequiredIngredientsAvailable = false;
      }
      continue;
    }

    const availableQuantity = pantryItem.quantity;
    const requiredQuantity = ingredient.quantity;

    // Check if units match (simple comparison, assumes data is consistent)
    // In a production app, you'd need unit conversion logic
    const unitMatches = ingredient.unit.toLowerCase() === pantryItem.unit.toLowerCase();
    
    let isSufficient = false;
    if (unitMatches) {
      isSufficient = availableQuantity >= requiredQuantity;
    } else {
      // If units don't match, we can't determine - treat as insufficient
      // This is a conservative approach for V1
      isSufficient = false;
    }

    const ingredientMatch: IngredientMatch = {
      pantryItemId: pantryItem.id,
      name: pantryItem.name,
      required: requiredQuantity,
      available: availableQuantity,
      unit: ingredient.unit,
      isSufficient,
      isOptional,
    };

    if (isOptional) {
      optionalIngredients.push(ingredientMatch);
    } else if (isSufficient) {
      matchedIngredients.push(ingredientMatch);
    } else {
      missingIngredients.push(ingredientMatch);
      allRequiredIngredientsAvailable = false;
    }
  }

  return {
    recipe,
    allRequiredIngredientsAvailable,
    matchedIngredients,
    missingIngredients,
    optionalIngredients,
  };
}

/**
 * Filter recipes to return only those with all required ingredients available
 */
export function getAvailableRecipes(matches: RecipeMatch[]): RecipeMatch[] {
  return matches.filter((match) => match.allRequiredIngredientsAvailable);
}

/**
 * Sort matches by how many ingredients are matched (most matched first)
 */
export function sortByMatchQuality(matches: RecipeMatch[]): RecipeMatch[] {
  return [...matches].sort((a, b) => {
    // First, prioritize recipes with all ingredients available
    if (a.allRequiredIngredientsAvailable && !b.allRequiredIngredientsAvailable) {
      return -1;
    }
    if (!a.allRequiredIngredientsAvailable && b.allRequiredIngredientsAvailable) {
      return 1;
    }

    // Then sort by number of matched ingredients
    const aMatched = a.matchedIngredients.length;
    const bMatched = b.matchedIngredients.length;
    
    if (aMatched !== bMatched) {
      return bMatched - aMatched;
    }

    // Finally, sort by fewest missing ingredients
    return a.missingIngredients.length - b.missingIngredients.length;
  });
}

/**
 * Get summary statistics for matches
 */
export function getMatchStatistics(matches: RecipeMatch[]): {
  totalRecipes: number;
  availableRecipes: number;
  partialMatches: number;
  noMatches: number;
} {
  let availableRecipes = 0;
  let partialMatches = 0;
  let noMatches = 0;

  for (const match of matches) {
    if (match.allRequiredIngredientsAvailable) {
      availableRecipes++;
    } else if (match.matchedIngredients.length > 0) {
      partialMatches++;
    } else {
      noMatches++;
    }
  }

  return {
    totalRecipes: matches.length,
    availableRecipes,
    partialMatches,
    noMatches,
  };
}

/**
 * Check if a specific recipe can be made with current pantry
 */
export function canMakeRecipe(
  recipe: Recipe,
  ingredients: RecipeIngredient[],
  pantryItems: PantryItem[]
): boolean {
  const pantryMap = new Map<number, PantryItem>();
  for (const item of pantryItems) {
    pantryMap.set(item.id, item);
  }

  const match = matchRecipeWithPantry(recipe, ingredients, pantryMap);
  return match.allRequiredIngredientsAvailable;
}
