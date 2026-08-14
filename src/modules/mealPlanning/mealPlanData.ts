/**
 * Meal planning data access layer
 */
import { getDatabase } from '../../database/db';
import { MealPlan, NewMealPlan } from '../../database/types';

/**
 * Get meal plans for a specific date
 */
export async function getMealPlansByDate(date: string): Promise<MealPlan[]> {
  const db = getDatabase();
  return await db.getAllAsync<MealPlan>(
    'SELECT * FROM meal_plans WHERE planned_date = ? ORDER BY meal_type',
    [date]
  );
}

/**
 * Get meal plans for a date range
 */
export async function getMealPlansInRange(startDate: string, endDate: string): Promise<MealPlan[]> {
  const db = getDatabase();
  return await db.getAllAsync<MealPlan>(
    'SELECT * FROM meal_plans WHERE planned_date >= ? AND planned_date <= ? ORDER BY planned_date, meal_type',
    [startDate, endDate]
  );
}

/**
 * Get upcoming meal plans
 */
export async function getUpcomingMealPlans(daysAhead: number = 7): Promise<MealPlan[]> {
  const db = getDatabase();
  return await db.getAllAsync<MealPlan>(
    `SELECT * FROM meal_plans 
     WHERE planned_date >= date('now') 
     AND planned_date <= date('now', '+' || ? || ' days')
     ORDER BY planned_date, meal_type`,
    [daysAhead]
  );
}

/**
 * Create a new meal plan
 */
export async function createMealPlan(mealPlan: NewMealPlan): Promise<number> {
  const db = getDatabase();
  const result = await db.runAsync(
    `INSERT INTO meal_plans (recipe_id, meal_type, planned_date, servings, is_completed) 
     VALUES (?, ?, ?, ?, ?)`,
    [mealPlan.recipe_id, mealPlan.meal_type, mealPlan.planned_date, mealPlan.servings, mealPlan.is_completed]
  );
  return result.lastInsertRowId;
}

/**
 * Mark meal plan as completed
 */
export async function markMealPlanCompleted(id: number): Promise<void> {
  const db = getDatabase();
  await db.runAsync('UPDATE meal_plans SET is_completed = 1 WHERE id = ?', [id]);
}

/**
 * Update meal plan
 */
export async function updateMealPlan(id: number, updates: Partial<NewMealPlan>): Promise<void> {
  const db = getDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.recipe_id !== undefined) {
    fields.push('recipe_id = ?');
    values.push(updates.recipe_id);
  }
  if (updates.meal_type !== undefined) {
    fields.push('meal_type = ?');
    values.push(updates.meal_type);
  }
  if (updates.planned_date !== undefined) {
    fields.push('planned_date = ?');
    values.push(updates.planned_date);
  }
  if (updates.servings !== undefined) {
    fields.push('servings = ?');
    values.push(updates.servings);
  }
  if (updates.is_completed !== undefined) {
    fields.push('is_completed = ?');
    values.push(updates.is_completed);
  }

  if (fields.length > 0) {
    values.push(id);
    await db.runAsync(
      `UPDATE meal_plans SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }
}

/**
 * Delete meal plan
 */
export async function deleteMealPlan(id: number): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM meal_plans WHERE id = ?', [id]);
}

/**
 * Get meal plans with recipe details (JOIN)
 */
export async function getMealPlansWithRecipes(startDate: string, endDate: string): Promise<any[]> {
  const db = getDatabase();
  return await db.getAllAsync(
    `SELECT 
      mp.*,
      r.name as recipe_name,
      r.prep_time_minutes,
      r.cook_time_minutes,
      r.servings as recipe_servings,
      r.calories_per_serving,
      r.protein_grams,
      r.carbs_grams,
      r.fat_grams,
      r.fiber_grams
    FROM meal_plans mp
    INNER JOIN recipes r ON mp.recipe_id = r.id
    WHERE mp.planned_date >= ? AND mp.planned_date <= ?
    ORDER BY mp.planned_date, mp.meal_type`,
    [startDate, endDate]
  );
}

/**
 * Check if a meal plan exists for a specific date and meal type
 */
export async function getMealPlanByDateAndType(date: string, mealType: string): Promise<MealPlan | null> {
  const db = getDatabase();
  return await db.getFirstAsync<MealPlan>(
    'SELECT * FROM meal_plans WHERE planned_date = ? AND meal_type = ?',
    [date, mealType]
  );
}
