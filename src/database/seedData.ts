/**
 * Sample data seeding for testing
 * Seeds recipes, pantry items, and default nutrition targets
 */
import { getDatabase } from './db';

export async function seedSampleData(): Promise<void> {
  const db = getDatabase();

  try {
    // Check if data already exists
    const existingRecipes = await db.getAllAsync<{ count: number }>('SELECT COUNT(*) as count FROM recipes');
    if (existingRecipes[0].count > 0) {
      console.log('Sample data already seeded');
      return;
    }

    console.log('Seeding sample data...');

    // 1. Create pantry items
    const pantryItems = [
      { name: 'Rice', quantity: 5, unit: 'kg' },
      { name: 'Urad Dal', quantity: 1, unit: 'kg' },
      { name: 'Toor Dal', quantity: 0.5, unit: 'kg' },
      { name: 'Ghee', quantity: 0.5, unit: 'kg' },
      { name: 'Wheat Flour', quantity: 3, unit: 'kg' },
      { name: 'Oil', quantity: 1, unit: 'L' },
      { name: 'Onions', quantity: 2, unit: 'kg' },
      { name: 'Tomatoes', quantity: 1, unit: 'kg' },
      { name: 'Potatoes', quantity: 2, unit: 'kg' },
      { name: 'Green Chilies', quantity: 0.1, unit: 'kg' },
    ];

    const pantryIds: number[] = [];
    for (const item of pantryItems) {
      const result = await db.runAsync(
        'INSERT INTO pantry_items (name, quantity, unit, low_stock_threshold) VALUES (?, ?, ?, ?)',
        [item.name, item.quantity, item.unit, item.quantity * 0.2]
      );
      pantryIds.push(result.lastInsertRowId);
    }

    // 2. Create recipes with nutrition data
    // Recipe 1: Dosa
    const dosaResult = await db.runAsync(
      `INSERT INTO recipes (name, prep_time_minutes, cook_time_minutes, servings, 
       calories_per_serving, protein_grams, carbs_grams, fat_grams, fiber_grams)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Dosa', 15, 20, 4, 200, 5, 38, 2, 2]
    );
    // Add dosa ingredients
    await db.runAsync(
      'INSERT INTO recipe_ingredients (recipe_id, pantry_item_id, quantity, unit) VALUES (?, ?, ?, ?)',
      [dosaResult.lastInsertRowId, pantryIds[0], 100, 'g'] // Rice
    );
    await db.runAsync(
      'INSERT INTO recipe_ingredients (recipe_id, pantry_item_id, quantity, unit) VALUES (?, ?, ?, ?)',
      [dosaResult.lastInsertRowId, pantryIds[1], 50, 'g'] // Urad Dal
    );
    await db.runAsync(
      'INSERT INTO recipe_ingredients (recipe_id, pantry_item_id, quantity, unit) VALUES (?, ?, ?, ?)',
      [dosaResult.lastInsertRowId, pantryIds[5], 10, 'ml'] // Oil
    );

    // Recipe 2: Dal Tadka
    const dalResult = await db.runAsync(
      `INSERT INTO recipes (name, prep_time_minutes, cook_time_minutes, servings,
       calories_per_serving, protein_grams, carbs_grams, fat_grams, fiber_grams)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Dal Tadka', 10, 30, 4, 250, 12, 35, 6, 8]
    );
    await db.runAsync(
      'INSERT INTO recipe_ingredients (recipe_id, pantry_item_id, quantity, unit) VALUES (?, ?, ?, ?)',
      [dalResult.lastInsertRowId, pantryIds[2], 100, 'g'] // Toor Dal
    );
    await db.runAsync(
      'INSERT INTO recipe_ingredients (recipe_id, pantry_item_id, quantity, unit) VALUES (?, ?, ?, ?)',
      [dalResult.lastInsertRowId, pantryIds[3], 20, 'g'] // Ghee
    );
    await db.runAsync(
      'INSERT INTO recipe_ingredients (recipe_id, pantry_item_id, quantity, unit) VALUES (?, ?, ?, ?)',
      [dalResult.lastInsertRowId, pantryIds[6], 50, 'g'] // Onions
    );
    await db.runAsync(
      'INSERT INTO recipe_ingredients (recipe_id, pantry_item_id, quantity, unit) VALUES (?, ?, ?, ?)',
      [dalResult.lastInsertRowId, pantryIds[7], 50, 'g'] // Tomatoes
    );

    // Recipe 3: Plain Rice
    const riceResult = await db.runAsync(
      `INSERT INTO recipes (name, prep_time_minutes, cook_time_minutes, servings,
       calories_per_serving, protein_grams, carbs_grams, fat_grams, fiber_grams)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Steamed Rice', 5, 20, 4, 180, 4, 40, 0.5, 1]
    );
    await db.runAsync(
      'INSERT INTO recipe_ingredients (recipe_id, pantry_item_id, quantity, unit) VALUES (?, ?, ?, ?)',
      [riceResult.lastInsertRowId, pantryIds[0], 100, 'g'] // Rice
    );

    // Recipe 4: Chapati
    const chapatiResult = await db.runAsync(
      `INSERT INTO recipes (name, prep_time_minutes, cook_time_minutes, servings,
       calories_per_serving, protein_grams, carbs_grams, fat_grams, fiber_grams)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Chapati (4 pieces)', 15, 15, 2, 240, 8, 45, 3, 4]
    );
    await db.runAsync(
      'INSERT INTO recipe_ingredients (recipe_id, pantry_item_id, quantity, unit) VALUES (?, ?, ?, ?)',
      [chapatiResult.lastInsertRowId, pantryIds[4], 100, 'g'] // Wheat Flour
    );
    await db.runAsync(
      'INSERT INTO recipe_ingredients (recipe_id, pantry_item_id, quantity, unit) VALUES (?, ?, ?, ?)',
      [chapatiResult.lastInsertRowId, pantryIds[3], 10, 'g'] // Ghee
    );

    // Recipe 5: Aloo Sabzi (Potato Curry)
    const alooResult = await db.runAsync(
      `INSERT INTO recipes (name, prep_time_minutes, cook_time_minutes, servings,
       calories_per_serving, protein_grams, carbs_grams, fat_grams, fiber_grams)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Aloo Sabzi', 10, 20, 4, 220, 3, 30, 8, 4]
    );
    await db.runAsync(
      'INSERT INTO recipe_ingredients (recipe_id, pantry_item_id, quantity, unit) VALUES (?, ?, ?, ?)',
      [alooResult.lastInsertRowId, pantryIds[8], 300, 'g'] // Potatoes
    );
    await db.runAsync(
      'INSERT INTO recipe_ingredients (recipe_id, pantry_item_id, quantity, unit) VALUES (?, ?, ?, ?)',
      [alooResult.lastInsertRowId, pantryIds[5], 30, 'ml'] // Oil
    );
    await db.runAsync(
      'INSERT INTO recipe_ingredients (recipe_id, pantry_item_id, quantity, unit) VALUES (?, ?, ?, ?)',
      [alooResult.lastInsertRowId, pantryIds[6], 50, 'g'] // Onions
    );
    await db.runAsync(
      'INSERT INTO recipe_ingredients (recipe_id, pantry_item_id, quantity, unit) VALUES (?, ?, ?, ?)',
      [alooResult.lastInsertRowId, pantryIds[7], 50, 'g'] // Tomatoes
    );
    await db.runAsync(
      'INSERT INTO recipe_ingredients (recipe_id, pantry_item_id, quantity, unit) VALUES (?, ?, ?, ?)',
      [alooResult.lastInsertRowId, pantryIds[9], 10, 'g'] // Green Chilies
    );

    // Recipe 6: Simple Breakfast - Upma
    const upmaResult = await db.runAsync(
      `INSERT INTO recipes (name, prep_time_minutes, cook_time_minutes, servings,
       calories_per_serving, protein_grams, carbs_grams, fat_grams, fiber_grams)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Upma', 10, 15, 3, 280, 6, 45, 8, 3]
    );

    // 3. Create default nutrition targets
    await db.runAsync(
      `INSERT INTO nutrition_targets (target_date, calories_target, protein_target, 
       carbs_target, fat_target, fiber_target) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['default', 2000, 50, 250, 70, 25]
    );

    // 4. Add recipe content (English only for simplicity)
    await db.runAsync(
      `INSERT INTO recipe_content (recipe_id, language, instructions, notes)
       VALUES (?, ?, ?, ?)`,
      [
        dosaResult.lastInsertRowId,
        'en',
        '1. Soak rice and urad dal for 4-6 hours\n2. Grind to smooth batter\n3. Ferment overnight\n4. Heat pan and pour batter\n5. Cook until crispy',
        'Best served with chutney and sambar',
      ]
    );

    await db.runAsync(
      `INSERT INTO recipe_content (recipe_id, language, instructions, notes)
       VALUES (?, ?, ?, ?)`,
      [
        dalResult.lastInsertRowId,
        'en',
        '1. Pressure cook dal with turmeric\n2. Temper with ghee, cumin, onions\n3. Add tomatoes and cook\n4. Mix with cooked dal\n5. Garnish with coriander',
        'Protein-rich and nutritious',
      ]
    );

    await db.runAsync(
      `INSERT INTO recipe_content (recipe_id, language, instructions, notes)
       VALUES (?, ?, ?, ?)`,
      [
        riceResult.lastInsertRowId,
        'en',
        '1. Wash rice thoroughly\n2. Add water (1:2 ratio)\n3. Pressure cook for 2 whistles\n4. Let steam release naturally\n5. Fluff and serve',
        'Perfect accompaniment for any curry',
      ]
    );

    await db.runAsync(
      `INSERT INTO recipe_content (recipe_id, language, instructions, notes)
       VALUES (?, ?, ?, ?)`,
      [
        chapatiResult.lastInsertRowId,
        'en',
        '1. Knead flour with water\n2. Rest for 15 minutes\n3. Roll into thin circles\n4. Cook on hot tava\n5. Apply ghee and serve hot',
        'Whole wheat flatbread',
      ]
    );

    await db.runAsync(
      `INSERT INTO recipe_content (recipe_id, language, instructions, notes)
       VALUES (?, ?, ?, ?)`,
      [
        alooResult.lastInsertRowId,
        'en',
        '1. Cube potatoes\n2. Heat oil, add cumin\n3. Sauté onions and tomatoes\n4. Add potatoes and spices\n5. Cook until tender',
        'Delicious potato curry',
      ]
    );

    await db.runAsync(
      `INSERT INTO recipe_content (recipe_id, language, instructions, notes)
       VALUES (?, ?, ?, ?)`,
      [
        upmaResult.lastInsertRowId,
        'en',
        '1. Roast semolina\n2. Heat oil, add mustard seeds\n3. Add vegetables\n4. Add water and roasted semolina\n5. Cook until fluffy',
        'Quick and healthy breakfast',
      ]
    );

    console.log('Sample data seeded successfully!');
    console.log('- 10 pantry items');
    console.log('- 6 recipes with nutrition data');
    console.log('- Recipe ingredients linked to pantry');
    console.log('- Default nutrition targets set');
  } catch (error) {
    console.error('Error seeding sample data:', error);
    throw error;
  }
}
