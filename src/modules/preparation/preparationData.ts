/**
 * Preparation tasks data access layer
 */
import { getDatabase } from '../../database/db';
import { PreparationTask, NewPreparationTask } from '../../database/types';

/**
 * Get preparation tasks for a meal plan
 */
export async function getTasksForMealPlan(mealPlanId: number): Promise<PreparationTask[]> {
  const db = getDatabase();
  return await db.getAllAsync<PreparationTask>(
    'SELECT * FROM preparation_tasks WHERE meal_plan_id = ? ORDER BY reminder_time',
    [mealPlanId]
  );
}

/**
 * Get upcoming preparation tasks
 */
export async function getUpcomingTasks(hoursAhead: number = 48): Promise<PreparationTask[]> {
  const db = getDatabase();
  return await db.getAllAsync<PreparationTask>(
    `SELECT * FROM preparation_tasks 
     WHERE is_completed = 0 
     AND datetime(reminder_time) <= datetime('now', '+' || ? || ' hours')
     AND datetime(reminder_time) >= datetime('now')
     ORDER BY reminder_time`,
    [hoursAhead]
  );
}

/**
 * Get tasks due now
 */
export async function getTasksDueNow(): Promise<PreparationTask[]> {
  const db = getDatabase();
  return await db.getAllAsync<PreparationTask>(
    `SELECT * FROM preparation_tasks 
     WHERE is_completed = 0 
     AND datetime(reminder_time) <= datetime('now')
     ORDER BY reminder_time`,
    []
  );
}

/**
 * Create a new preparation task
 */
export async function createPreparationTask(task: NewPreparationTask): Promise<number> {
  const db = getDatabase();
  const result = await db.runAsync(
    `INSERT INTO preparation_tasks (meal_plan_id, task_type, description, hours_before_meal, reminder_time, is_completed) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      task.meal_plan_id,
      task.task_type,
      task.description,
      task.hours_before_meal,
      task.reminder_time,
      task.is_completed,
    ]
  );
  return result.lastInsertRowId;
}

/**
 * Update preparation task
 */
export async function updatePreparationTask(
  id: number,
  updates: Partial<Omit<PreparationTask, 'id' | 'created_at'>>
): Promise<void> {
  const db = getDatabase();
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  
  if (fields.length === 0) return;
  
  const setClause = fields.map((field) => `${field} = ?`).join(', ');
  await db.runAsync(`UPDATE preparation_tasks SET ${setClause} WHERE id = ?`, [...values, id]);
}

/**
 * Mark task as completed
 */
export async function markTaskCompleted(id: number): Promise<void> {
  const db = getDatabase();
  await db.runAsync('UPDATE preparation_tasks SET is_completed = 1 WHERE id = ?', [id]);
}

/**
 * Delete preparation task
 */
export async function deletePreparationTask(id: number): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM preparation_tasks WHERE id = ?', [id]);
}
