# Web Platform Persistence

## Overview

Bhojana Yojana uses a **localStorage-based persistence layer** for the Web platform since Web browsers don't support native SQLite. This provides a seamless experience across all platforms while maintaining data integrity.

## Architecture

### Native Platforms (iOS/Android)
- Uses `expo-sqlite` with SQLite database
- Full relational database support
- File-based storage: `bhojanayojana.db`

### Web Platform
- Uses `localStorage` for persistence
- Custom `WebDatabase` class mimics SQLite API
- Key-value storage with JSON serialization
- Auto-incrementing IDs with counters

## WebDatabase Class

Located in: `src/database/webDatabase.ts`

### Features
- ✅ SQLite-compatible API (runAsync, getAllAsync, getFirstAsync)
- ✅ Auto-incrementing primary keys
- ✅ Foreign key validation
- ✅ Transaction support (emulated)
- ✅ Schema creation and validation
- ✅ localStorage-based persistence

### Storage Keys

```typescript
// Main data tables
localStorage.setItem('db_recipes', JSON.stringify([...]));
localStorage.setItem('db_pantry_items', JSON.stringify([...]));
localStorage.setItem('db_recipe_ingredients', JSON.stringify([...]));
localStorage.setItem('db_recipe_content', JSON.stringify([...]));
localStorage.setItem('db_meal_plans', JSON.stringify([...]));
localStorage.setItem('db_planned_recipes', JSON.stringify([...]));
localStorage.setItem('db_prep_tasks', JSON.stringify([...]));
localStorage.setItem('db_nutrition_logs', JSON.stringify([...]));
localStorage.setItem('db_nutrition_targets', JSON.stringify([...]));
localStorage.setItem('db_grocery_lists', JSON.stringify([...]));
localStorage.setItem('db_grocery_items', JSON.stringify([...]));

// Auto-increment counters
localStorage.setItem('db_counter_recipes', '1');
localStorage.setItem('db_counter_pantry_items', '1');
// ... (one per table)
```

## Sample Data

The Web platform uses **minimal seed data** to reduce localStorage usage:

- **3 pantry items** (Rice, Toor Dal, Ghee)
- **2 recipes** (Steamed Rice, Dal Tadka)
- **Recipe ingredients** with pantry linking
- **Default nutrition targets**

Native platforms use full seed data with 10 pantry items and 6 recipes with multilingual content.

## API Compatibility

The `WebDatabase` class implements the same interface as `expo-sqlite`:

```typescript
// Create
const result = await db.runAsync(
  'INSERT INTO recipes (name, prep_time_minutes) VALUES (?, ?)',
  ['Dosa', 15]
);
console.log(result.lastInsertRowId); // Auto-generated ID

// Read All
const recipes = await db.getAllAsync('SELECT * FROM recipes');

// Read One
const recipe = await db.getFirstAsync(
  'SELECT * FROM recipes WHERE id = ?',
  [1]
);

// Update
await db.runAsync(
  'UPDATE recipes SET name = ? WHERE id = ?',
  ['Masala Dosa', 1]
);

// Delete
await db.runAsync('DELETE FROM recipes WHERE id = ?', [1]);
```

## Limitations

### Web Platform Constraints

1. **Storage Limit**: localStorage has ~5-10MB limit per domain
2. **No Complex Queries**: Only basic WHERE, ORDER BY, LIMIT supported
3. **No Joins**: Manual data relationships
4. **No Transactions**: Changes are immediate
5. **Synchronous**: Data saved on every operation
6. **No Indexes**: Full table scans for queries

### Recommended Usage

- **Small datasets**: Ideal for personal household data
- **Simple queries**: Basic CRUD operations
- **Client-side only**: No server synchronization
- **Development/Testing**: Perfect for rapid prototyping

## Data Structure

All tables store data as JSON arrays in localStorage:

```json
// db_recipes
[
  {
    "id": 1,
    "name": "Steamed Rice",
    "prep_time_minutes": 5,
    "cook_time_minutes": 20,
    "servings": 4,
    "calories_per_serving": 180,
    "protein_grams": 4,
    "carbs_grams": 40,
    "fat_grams": 0.5,
    "fiber_grams": 1,
    "video_url": null,
    "created_at": "2026-08-14T17:57:00.000Z",
    "updated_at": "2026-08-14T17:57:00.000Z"
  }
]
```

## Browser Compatibility

- ✅ Chrome 4+
- ✅ Firefox 3.5+
- ✅ Safari 4+
- ✅ Edge (all versions)
- ✅ Opera 10.5+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## Testing

To test Web persistence:

```bash
# Start development server
npm start

# Open in browser
# Visit: http://localhost:8081

# Test data persistence:
# 1. Add pantry items/recipes
# 2. Refresh browser (F5)
# 3. Verify data persists

# Clear data (browser console):
localStorage.clear();
location.reload();
```

## Performance

- **Read operations**: O(n) - Full table scan
- **Write operations**: O(n) - Update + save entire table
- **Storage overhead**: ~2x (JSON serialization)
- **Typical dataset size**: 1-5 KB (household data)
- **Maximum dataset**: 5 MB (localStorage limit)

## Migration Path

For users with larger datasets, consider:

1. **Progressive Web App (PWA)** with IndexedDB
2. **Server-side sync** with PostgreSQL/MongoDB
3. **Export/Import** to mobile app
4. **Cloud storage** (Firebase, Supabase)

## Security Considerations

⚠️ **localStorage is not encrypted**
- Don't store sensitive data
- Clear storage on logout
- Use HTTPS in production
- Consider IndexedDB for encryption support

## Future Enhancements

- [ ] IndexedDB support for larger datasets
- [ ] Query optimization with indexes
- [ ] Cloud sync support
- [ ] Data export/import (JSON/CSV)
- [ ] Compression for large datasets
- [ ] Encryption for sensitive data

## Troubleshooting

### Data not persisting
```javascript
// Check localStorage availability
if (typeof localStorage === 'undefined') {
  console.error('localStorage not supported');
}

// Check storage quota
const estimate = await navigator.storage.estimate();
console.log(`Using ${estimate.usage} of ${estimate.quota} bytes`);
```

### Storage quota exceeded
```javascript
try {
  localStorage.setItem('test', JSON.stringify(largeData));
} catch (e) {
  if (e.name === 'QuotaExceededError') {
    console.error('Storage quota exceeded');
    // Clear old data or implement data pruning
  }
}
```

### Corrupted data
```javascript
// Clear all database data
Object.keys(localStorage)
  .filter(key => key.startsWith('db_'))
  .forEach(key => localStorage.removeItem(key));

// Reload app to re-seed
location.reload();
```

## Related Files

- `src/database/webDatabase.ts` - Web persistence implementation
- `src/database/db.ts` - Database initialization and platform detection
- `src/database/seedData.ts` - Sample data seeding
- `src/utils/platform.ts` - Platform detection utilities

## Support

For issues or questions about Web persistence:
- Check browser console for errors
- Verify localStorage is enabled
- Test in incognito mode (clean state)
- Review console logs for "Web database" messages
