/**
 * Pantry business logic
 * Pure, deterministic functions for pantry-related operations
 */
import { PantryItem, GroceryItem } from '../../database/types';
import { 
  createGroceryItem, 
  deleteGroceryItem,
  updateGroceryItem as updateGroceryItemData
} from '../grocery/groceryData';

export type ExpiryState = 'expired' | 'expiring_soon' | 'normal' | 'none';

/**
 * Check if a pantry item is low on stock
 */
export function isLowStock(item: PantryItem): boolean {
  return item.low_stock_threshold !== null && item.quantity <= item.low_stock_threshold;
}

/**
 * Get the expiry state of an item
 */
export function getExpiryState(expiryDate: string | null, daysThreshold: number = 7): ExpiryState {
  if (!expiryDate) {
    return 'none';
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'expired';
  } else if (diffDays <= daysThreshold) {
    return 'expiring_soon';
  } else {
    return 'normal';
  }
}

/**
 * Get color for expiry state
 */
export function getExpiryColor(state: ExpiryState): string {
  switch (state) {
    case 'expired':
      return '#f44336'; // Red
    case 'expiring_soon':
      return '#FF9800'; // Orange
    case 'normal':
      return '#4CAF50'; // Green
    case 'none':
      return '#999'; // Gray
  }
}

/**
 * Get label for expiry state
 */
export function getExpiryLabel(state: ExpiryState, expiryDate: string | null): string {
  switch (state) {
    case 'expired':
      return 'Expired';
    case 'expiring_soon':
      return 'Expiring Soon';
    case 'normal':
      return expiryDate ? `Expires: ${formatDate(expiryDate)}` : '';
    case 'none':
      return '';
  }
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Sync a pantry item to the grocery list
 * This is the core logic for automatic grocery list generation
 */
export async function syncPantryToGrocery(
  pantryItem: PantryItem,
  existingGroceryItem: GroceryItem | null
): Promise<void> {
  const lowStock = isLowStock(pantryItem);

  if (lowStock) {
    // Item is low stock - should be on grocery list
    if (existingGroceryItem) {
      // Update existing grocery item
      await updateGroceryItemData(existingGroceryItem.id, {
        name: pantryItem.name,
        quantity: pantryItem.low_stock_threshold || pantryItem.quantity,
        unit: pantryItem.unit,
      });
    } else {
      // Create new grocery item
      await createGroceryItem({
        pantry_item_id: pantryItem.id,
        name: pantryItem.name,
        quantity: pantryItem.low_stock_threshold || pantryItem.quantity,
        unit: pantryItem.unit,
        is_purchased: 0,
        auto_generated: 1,
        source: 'low_stock',
      });
    }
  } else {
    // Item is not low stock
    if (existingGroceryItem && !existingGroceryItem.is_purchased) {
      // Remove auto-generated item that's no longer needed
      // But only if it hasn't been purchased yet
      await deleteGroceryItem(existingGroceryItem.id);
    }
  }
}

/**
 * Calculate suggested restock quantity
 * Simple heuristic: 2x the low stock threshold, or a minimum reasonable amount
 */
export function calculateRestockQuantity(item: PantryItem): number {
  if (item.low_stock_threshold && item.low_stock_threshold > 0) {
    return item.low_stock_threshold * 2;
  }
  // Default suggestion based on unit
  switch (item.unit.toLowerCase()) {
    case 'kg':
      return 1;
    case 'g':
      return 500;
    case 'l':
      return 1;
    case 'ml':
      return 500;
    default:
      return 10; // For items like eggs
  }
}
