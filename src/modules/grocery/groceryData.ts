/**
 * Grocery list data access layer
 */
import { getDatabase } from '../../database/db';
import { GroceryItem, NewGroceryItem } from '../../database/types';

/**
 * Get all grocery items
 */
export async function getAllGroceryItems(): Promise<GroceryItem[]> {
  const db = getDatabase();
  return await db.getAllAsync<GroceryItem>(
    'SELECT * FROM grocery_items ORDER BY is_purchased ASC, name ASC'
  );
}

/**
 * Get unpurchased grocery items
 */
export async function getUnpurchasedItems(): Promise<GroceryItem[]> {
  const db = getDatabase();
  return await db.getAllAsync<GroceryItem>(
    'SELECT * FROM grocery_items WHERE is_purchased = 0 ORDER BY name ASC'
  );
}

/**
 * Create a new grocery item
 */
export async function createGroceryItem(item: NewGroceryItem): Promise<number> {
  const db = getDatabase();
  const result = await db.runAsync(
    `INSERT INTO grocery_items (pantry_item_id, name, quantity, unit, is_purchased, auto_generated, source) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      item.pantry_item_id ?? null,
      item.name,
      item.quantity,
      item.unit,
      item.is_purchased,
      item.auto_generated,
      item.source ?? null,
    ]
  );
  return result.lastInsertRowId;
}

/**
 * Mark grocery item as purchased
 */
export async function markItemPurchased(id: number): Promise<void> {
  const db = getDatabase();
  await db.runAsync('UPDATE grocery_items SET is_purchased = 1 WHERE id = ?', [id]);
}

/**
 * Delete grocery item
 */
export async function deleteGroceryItem(id: number): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM grocery_items WHERE id = ?', [id]);
}

/**
 * Clear all purchased items
 */
export async function clearPurchasedItems(): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM grocery_items WHERE is_purchased = 1');
}
