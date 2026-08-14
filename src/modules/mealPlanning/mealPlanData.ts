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
 * Delete meal plan
 */
export async function deleteMealPlan(id: number): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM meal_plans WHERE id = ?', [id]);
}
