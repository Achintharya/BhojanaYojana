/**
 * TypeScript type definitions for database entities
 */

export type Language = 'en' | 'kn' | 'mr';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface PantryItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  low_stock_threshold: number | null;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: number;
  name: string;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number;
  calories_per_serving: number | null;
  protein_grams: number | null;
  carbs_grams: number | null;
  fat_grams: number | null;
  fiber_grams: number | null;
  created_at: string;
  updated_at: string;
}

export interface RecipeContent {
  id: number;
  recipe_id: number;
  language: Language;
  instructions: string;
  video_url: string | null;
  notes: string | null;
}

export interface RecipeIngredient {
  id: number;
  recipe_id: number;
  pantry_item_id: number;
  quantity: number;
  unit: string;
  is_optional: number;
}

export interface MealPlan {
  id: number;
  recipe_id: number;
  meal_type: MealType;
  planned_date: string;
  servings: number;
  is_completed: number;
  created_at: string;
}

export interface NutritionTarget {
  id: number;
  target_date: string;
  calories_target: number | null;
  protein_target: number | null;
  carbs_target: number | null;
  fat_target: number | null;
  fiber_target: number | null;
}

export interface GroceryItem {
  id: number;
  pantry_item_id: number | null;
  name: string;
  quantity: number;
  unit: string;
  is_purchased: number;
  auto_generated: number;
  source: string | null;
  created_at: string;
}

export interface PreparationTask {
  id: number;
  meal_plan_id: number;
  task_type: string;
  description: string;
  hours_before_meal: number;
  reminder_time: string;
  is_completed: number;
  created_at: string;
}

// Input types for creating new records (without auto-generated fields)
export type NewPantryItem = Omit<PantryItem, 'id' | 'created_at' | 'updated_at'>;
export type NewRecipe = Omit<Recipe, 'id' | 'created_at' | 'updated_at'>;
export type NewRecipeContent = Omit<RecipeContent, 'id'>;
export type NewRecipeIngredient = Omit<RecipeIngredient, 'id'>;
export type NewMealPlan = Omit<MealPlan, 'id' | 'created_at'>;
export type NewNutritionTarget = Omit<NutritionTarget, 'id'>;
export type NewGroceryItem = Omit<GroceryItem, 'id' | 'created_at'>;
export type NewPreparationTask = Omit<PreparationTask, 'id' | 'created_at'>;
