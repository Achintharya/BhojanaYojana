/**
 * Pantry data access layer
 */
import { getDatabase } from '../../database/db';
import { PantryItem, NewPantryItem } from '../../database/types';

/**
 * Get all pantry items
 */
export async function getAllPantryItems(): Promise<PantryItem[]> {
  const db = getDatabase();
  return await db.getAllAsync<PantryItem>('SELECT * FROM pantry_items ORDER BY name ASC');
}

/**
 * Get pantry item by ID
 */
export async function getPantryItemById(id: number): Promise<PantryItem | null> {
  const db = getDatabase();
  return await db.getFirstAsync<PantryItem>('SELECT * FROM pantry_items WHERE id = ?', [id]);
}

/**
 * Get items below low stock threshold
 */
export async function getLowStockItems(): Promise<PantryItem[]> {
  const db = getDatabase();
  return await db.getAllAsync<PantryItem>(
    'SELECT * FROM pantry_items WHERE low_stock_threshold IS NOT NULL AND quantity <= low_stock_threshold ORDER BY name ASC'
  );
}

/**
 * Get items expiring soon (within specified days)
 */
export async function getItemsExpiringSoon(daysAhead: number = 7): Promise<PantryItem[]> {
  const db = getDatabase();
  return await db.getAllAsync<PantryItem>(
    `SELECT * FROM pantry_items 
     WHERE expiry_date IS NOT NULL 
     AND date(expiry_date) <= date('now', '+' || ? || ' days')
     AND date(expiry_date) >= date('now')
     ORDER BY expiry_date ASC`,
    [daysAhead]
  );
}

/**
 * Create a new pantry item
 */
export async function createPantryItem(item: NewPantryItem): Promise<number> {
  const db = getDatabase();
  const result = await db.runAsync(
    `INSERT INTO pantry_items (name, quantity, unit, low_stock_threshold, expiry_date) 
     VALUES (?, ?, ?, ?, ?)`,
    [item.name, item.quantity, item.unit, item.low_stock_threshold ?? null, item.expiry_date ?? null]
  );
  return result.lastInsertRowId;
}

/**
 * Update pantry item quantity
 */
export async function updatePantryItemQuantity(id: number, quantity: number): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    `UPDATE pantry_items SET quantity = ?, updated_at = datetime('now') WHERE id = ?`,
    [quantity, id]
  );
}

/**
 * Update pantry item
 */
export async function updatePantryItem(id: number, item: Partial<NewPantryItem>): Promise<void> {
  const db = getDatabase();
  const updates: string[] = [];
  const values: any[] = [];

  if (item.name !== undefined) {
    updates.push('name = ?');
    values.push(item.name);
  }
  if (item.quantity !== undefined) {
    updates.push('quantity = ?');
    values.push(item.quantity);
  }
  if (item.unit !== undefined) {
    updates.push('unit = ?');
    values.push(item.unit);
  }
  if (item.low_stock_threshold !== undefined) {
    updates.push('low_stock_threshold = ?');
    values.push(item.low_stock_threshold);
  }
  if (item.expiry_date !== undefined) {
    updates.push('expiry_date = ?');
    values.push(item.expiry_date);
  }

  if (updates.length > 0) {
    updates.push("updated_at = datetime('now')");
    values.push(id);
    await db.runAsync(
      `UPDATE pantry_items SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }
}

/**
 * Delete pantry item
 */
export async function deletePantryItem(id: number): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM pantry_items WHERE id = ?', [id]);
}
