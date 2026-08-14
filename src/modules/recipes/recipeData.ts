/**
 * Recipe data access layer
 */
import { getDatabase } from '../../database/db';
import { Recipe, RecipeContent, RecipeIngredient, NewRecipe, NewRecipeContent, NewRecipeIngredient, Language } from '../../database/types';

/**
 * Get all recipes
 */
export async function getAllRecipes(): Promise<Recipe[]> {
  const db = getDatabase();
  return await db.getAllAsync<Recipe>('SELECT * FROM recipes ORDER BY name ASC');
}

/**
 * Get recipe by ID
 */
export async function getRecipeById(id: number): Promise<Recipe | null> {
  const db = getDatabase();
  return await db.getFirstAsync<Recipe>('SELECT * FROM recipes WHERE id = ?', [id]);
}

/**
 * Get recipe content by recipe ID and language
 */
export async function getRecipeContent(recipeId: number, language: Language): Promise<RecipeContent | null> {
  const db = getDatabase();
  return await db.getFirstAsync<RecipeContent>(
    'SELECT * FROM recipe_content WHERE recipe_id = ? AND language = ?',
    [recipeId, language]
  );
}

/**
 * Get all content for a recipe (all languages)
 */
export async function getAllRecipeContent(recipeId: number): Promise<RecipeContent[]> {
  const db = getDatabase();
  return await db.getAllAsync<RecipeContent>(
    'SELECT * FROM recipe_content WHERE recipe_id = ?',
    [recipeId]
  );
}

/**
 * Get recipe ingredients
 */
export async function getRecipeIngredients(recipeId: number): Promise<RecipeIngredient[]> {
  const db = getDatabase();
  return await db.getAllAsync<RecipeIngredient>(
    'SELECT * FROM recipe_ingredients WHERE recipe_id = ?',
    [recipeId]
  );
}

/**
 * Create a new recipe
 */
export async function createRecipe(recipe: NewRecipe): Promise<number> {
  const db = getDatabase();
  const result = await db.runAsync(
    `INSERT INTO recipes (name, prep_time_minutes, cook_time_minutes, servings, calories_per_serving, protein_grams, carbs_grams, fat_grams, fiber_grams) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      recipe.name,
      recipe.prep_time_minutes ?? null,
      recipe.cook_time_minutes ?? null,
      recipe.servings,
      recipe.calories_per_serving ?? null,
      recipe.protein_grams ?? null,
      recipe.carbs_grams ?? null,
      recipe.fat_grams ?? null,
      recipe.fiber_grams ?? null,
    ]
  );
  return result.lastInsertRowId;
}

/**
 * Create recipe content
 */
export async function createRecipeContent(content: NewRecipeContent): Promise<number> {
  const db = getDatabase();
  const result = await db.runAsync(
    `INSERT INTO recipe_content (recipe_id, language, instructions, video_url, notes) 
     VALUES (?, ?, ?, ?, ?)`,
    [content.recipe_id, content.language, content.instructions, content.video_url ?? null, content.notes ?? null]
  );
  return result.lastInsertRowId;
}

/**
 * Add recipe ingredient
 */
export async function addRecipeIngredient(ingredient: NewRecipeIngredient): Promise<number> {
  const db = getDatabase();
  const result = await db.runAsync(
    `INSERT INTO recipe_ingredients (recipe_id, pantry_item_id, quantity, unit, is_optional) 
     VALUES (?, ?, ?, ?, ?)`,
    [ingredient.recipe_id, ingredient.pantry_item_id, ingredient.quantity, ingredient.unit, ingredient.is_optional]
  );
  return result.lastInsertRowId;
}

/**
 * Delete recipe (cascades to content and ingredients)
 */
export async function deleteRecipe(id: number): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM recipes WHERE id = ?', [id]);
}
