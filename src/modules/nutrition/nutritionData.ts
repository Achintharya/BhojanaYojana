/**
 * Nutrition targets data access layer
 */
import { getDatabase } from '../../database/db';
import { NutritionTarget, NewNutritionTarget } from '../../database/types';

/**
 * Get nutrition target for a specific date
 */
export async function getNutritionTargetByDate(date: string): Promise<NutritionTarget | null> {
  const db = getDatabase();
  return await db.getFirstAsync<NutritionTarget>(
    'SELECT * FROM nutrition_targets WHERE target_date = ?',
    [date]
  );
}

/**
 * Get all nutrition targets
 */
export async function getAllNutritionTargets(): Promise<NutritionTarget[]> {
  const db = getDatabase();
  return await db.getAllAsync<NutritionTarget>(
    'SELECT * FROM nutrition_targets ORDER BY target_date DESC'
  );
}

/**
 * Create or update nutrition target
 */
export async function setNutritionTarget(target: NewNutritionTarget): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    `INSERT INTO nutrition_targets (target_date, calories_target, protein_target, carbs_target, fat_target, fiber_target) 
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(target_date) DO UPDATE SET
       calories_target = excluded.calories_target,
       protein_target = excluded.protein_target,
       carbs_target = excluded.carbs_target,
       fat_target = excluded.fat_target,
       fiber_target = excluded.fiber_target`,
    [
      target.target_date,
      target.calories_target ?? null,
      target.protein_target ?? null,
      target.carbs_target ?? null,
      target.fat_target ?? null,
      target.fiber_target ?? null,
    ]
  );
}

/**
 * Delete nutrition target
 */
export async function deleteNutritionTarget(date: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM nutrition_targets WHERE target_date = ?', [date]);
}
