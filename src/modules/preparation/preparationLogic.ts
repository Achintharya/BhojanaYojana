/**
 * Preparation task business logic
 * Defines recipe preparation requirements and generates tasks
 */
import { Recipe, MealPlan } from '../../database/types';

export interface PreparationRequirement {
  taskType: string;
  description: string;
  hoursBeforeMeal: number;
}

/**
 * Hardcoded preparation requirements for specific recipes
 * Maps recipe names to their preparation tasks
 */
export const RECIPE_PREPARATION_REQUIREMENTS: Record<string, PreparationRequirement[]> = {
  'Dosa': [
    {
      taskType: 'soaking',
      description: 'Soak rice and urad dal in water',
      hoursBeforeMeal: 6,
    },
    {
      taskType: 'fermentation',
      description: 'Grind soaked ingredients and let batter ferment',
      hoursBeforeMeal: 12,
    },
  ],
  'Dal Tadka': [
    {
      taskType: 'soaking',
      description: 'Soak toor dal in water for faster cooking',
      hoursBeforeMeal: 2,
    },
  ],
  'Chapati (4 pieces)': [
    {
      taskType: 'preparation',
      description: 'Knead wheat flour dough and let it rest',
      hoursBeforeMeal: 1,
    },
  ],
  'Upma': [
    {
      taskType: 'preparation',
      description: 'Roast semolina in advance',
      hoursBeforeMeal: 1,
    },
  ],
};

/**
 * Get preparation requirements for a recipe
 */
export function getPreparationRequirements(recipeName: string): PreparationRequirement[] {
  return RECIPE_PREPARATION_REQUIREMENTS[recipeName] || [];
}

/**
 * Check if a recipe has preparation requirements
 */
export function hasPreparationRequirements(recipeName: string): boolean {
  return recipeName in RECIPE_PREPARATION_REQUIREMENTS;
}

/**
 * Calculate reminder time based on meal plan date and hours before
 */
export function calculateReminderTime(mealPlanDate: string, mealType: string, hoursBeforeMeal: number): string {
  // Parse the meal plan date (YYYY-MM-DD format)
  const [year, month, day] = mealPlanDate.split('-').map(Number);
  
  // Estimate meal time based on meal type
  let mealHour = 12; // Default to noon
  if (mealType === 'breakfast') {
    mealHour = 8; // 8 AM
  } else if (mealType === 'lunch') {
    mealHour = 13; // 1 PM
  } else if (mealType === 'dinner') {
    mealHour = 20; // 8 PM
  }

  // Create date object for the meal time
  const mealDateTime = new Date(year, month - 1, day, mealHour, 0, 0);
  
  // Subtract hours to get reminder time
  const reminderDateTime = new Date(mealDateTime.getTime() - hoursBeforeMeal * 60 * 60 * 1000);
  
  // Format as ISO string (SQLite datetime compatible)
  return reminderDateTime.toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * Generate preparation tasks for a meal plan
 */
export function generatePreparationTasksForMeal(
  mealPlan: MealPlan,
  recipe: Recipe
): Array<{
  meal_plan_id: number;
  task_type: string;
  description: string;
  hours_before_meal: number;
  reminder_time: string;
  is_completed: number;
}> {
  const requirements = getPreparationRequirements(recipe.name);
  
  if (requirements.length === 0) {
    return [];
  }

  return requirements.map((req) => ({
    meal_plan_id: mealPlan.id,
    task_type: req.taskType,
    description: req.description,
    hours_before_meal: req.hoursBeforeMeal,
    reminder_time: calculateReminderTime(
      mealPlan.planned_date,
      mealPlan.meal_type,
      req.hoursBeforeMeal
    ),
    is_completed: 0,
  }));
}

/**
 * Format reminder time for display (relative to now)
 */
export function formatReminderTimeRelative(reminderTime: string): string {
  const now = new Date();
  const reminder = new Date(reminderTime.replace(' ', 'T'));
  
  const diffMs = reminder.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffMs < 0) {
    // Past
    const absDiffHours = Math.abs(diffHours);
    if (absDiffHours < 1) {
      return 'Overdue';
    } else if (absDiffHours < 24) {
      return `${absDiffHours}h ago`;
    } else {
      const days = Math.floor(absDiffHours / 24);
      return `${days}d ago`;
    }
  } else {
    // Future
    if (diffHours < 1) {
      if (diffMinutes < 1) {
        return 'Now';
      }
      return `In ${diffMinutes}m`;
    } else if (diffHours < 24) {
      return `In ${diffHours}h`;
    } else {
      const days = Math.floor(diffHours / 24);
      const remainingHours = diffHours % 24;
      if (remainingHours > 0) {
        return `In ${days}d ${remainingHours}h`;
      }
      return `In ${days}d`;
    }
  }
}

/**
 * Format reminder time for absolute display
 */
export function formatReminderTimeAbsolute(reminderTime: string): string {
  const date = new Date(reminderTime.replace(' ', 'T'));
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const reminderDate = new Date(date);
  reminderDate.setHours(0, 0, 0, 0);
  
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  
  if (reminderDate.getTime() === today.getTime()) {
    return `Today at ${timeStr}`;
  } else if (reminderDate.getTime() === tomorrow.getTime()) {
    return `Tomorrow at ${timeStr}`;
  } else {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day}/${month} at ${timeStr}`;
  }
}

/**
 * Check if a reminder time is in the past
 */
export function isReminderOverdue(reminderTime: string): boolean {
  const now = new Date();
  const reminder = new Date(reminderTime.replace(' ', 'T'));
  return reminder < now;
}

/**
 * Get task priority based on how soon it's due
 */
export function getTaskPriority(reminderTime: string): 'urgent' | 'soon' | 'upcoming' | 'later' {
  const now = new Date();
  const reminder = new Date(reminderTime.replace(' ', 'T'));
  const diffHours = (reminder.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours < 0) {
    return 'urgent'; // Overdue
  } else if (diffHours < 2) {
    return 'urgent'; // Due within 2 hours
  } else if (diffHours < 6) {
    return 'soon'; // Due within 6 hours
  } else if (diffHours < 24) {
    return 'upcoming'; // Due today
  } else {
    return 'later'; // Due tomorrow or later
  }
}
