/**
 * Database schema for Bhojana Yojana
 * SQLite database structure for V1 requirements
 */

export const SCHEMA_VERSION = 1;

/**
 * SQL statements to create all tables
 */
export const CREATE_TABLES = `
-- Pantry items tracking
CREATE TABLE IF NOT EXISTS pantry_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  quantity REAL NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  low_stock_threshold REAL,
  expiry_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Recipes
CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  servings INTEGER NOT NULL DEFAULT 1,
  calories_per_serving REAL,
  protein_grams REAL,
  carbs_grams REAL,
  fat_grams REAL,
  fiber_grams REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Localized recipe content (supports English, Kannada, Marathi)
CREATE TABLE IF NOT EXISTS recipe_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER NOT NULL,
  language TEXT NOT NULL CHECK(language IN ('en', 'kn', 'mr')),
  instructions TEXT NOT NULL,
  video_url TEXT,
  notes TEXT,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  UNIQUE(recipe_id, language)
);

-- Recipe ingredients (junction table linking recipes to pantry items)
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER NOT NULL,
  pantry_item_id INTEGER NOT NULL,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  is_optional INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (pantry_item_id) REFERENCES pantry_items(id) ON DELETE CASCADE
);

-- Meal plans
CREATE TABLE IF NOT EXISTS meal_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER NOT NULL,
  meal_type TEXT NOT NULL CHECK(meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  planned_date TEXT NOT NULL,
  servings INTEGER NOT NULL DEFAULT 1,
  is_completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- Nutrition targets
CREATE TABLE IF NOT EXISTS nutrition_targets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_date TEXT NOT NULL UNIQUE,
  calories_target REAL,
  protein_target REAL,
  carbs_target REAL,
  fat_target REAL,
  fiber_target REAL
);

-- Grocery list items
CREATE TABLE IF NOT EXISTS grocery_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pantry_item_id INTEGER,
  name TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  is_purchased INTEGER NOT NULL DEFAULT 0,
  auto_generated INTEGER NOT NULL DEFAULT 0,
  source TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (pantry_item_id) REFERENCES pantry_items(id) ON DELETE SET NULL
);

-- Preparation tasks (soaking, marinating, etc.)
CREATE TABLE IF NOT EXISTS preparation_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meal_plan_id INTEGER NOT NULL,
  task_type TEXT NOT NULL,
  description TEXT NOT NULL,
  hours_before_meal INTEGER NOT NULL,
  reminder_time TEXT NOT NULL,
  is_completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pantry_items_name ON pantry_items(name);
CREATE INDEX IF NOT EXISTS idx_pantry_items_expiry ON pantry_items(expiry_date);
CREATE INDEX IF NOT EXISTS idx_recipes_name ON recipes(name);
CREATE INDEX IF NOT EXISTS idx_recipe_content_recipe ON recipe_content(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_content_language ON recipe_content(language);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_pantry ON recipe_ingredients(pantry_item_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_date ON meal_plans(planned_date);
CREATE INDEX IF NOT EXISTS idx_meal_plans_recipe ON meal_plans(recipe_id);
CREATE INDEX IF NOT EXISTS idx_grocery_items_purchased ON grocery_items(is_purchased);
CREATE INDEX IF NOT EXISTS idx_preparation_tasks_meal ON preparation_tasks(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_preparation_tasks_reminder ON preparation_tasks(reminder_time);
`;

/**
 * Database migration interface
 */
export interface Migration {
  version: number;
  up: string;
}

/**
 * Migration history - future versions will add to this array
 */
export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    up: CREATE_TABLES,
  },
];
