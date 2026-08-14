/**
 * Sample data seeding for testing
 * Seeds recipes, pantry items, and default nutrition targets
 */
import { getDatabase, isMockDatabase } from './db';

export async function seedSampleData(): Promise<void> {
  const db = getDatabase();

  // Use minimal seed data for Web platform
  if (isMockDatabase()) {
    console.log('Seeding minimal Web sample data...');
    await seedWebData(db);
    return;
  }

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
        dosaResult.lastInsertRowId,
        'kn',
        '1. ಅಕ್ಕಿ ಮತ್ತು ಉದ್ದಿನ ಬೇಳೆಯನ್ನು 4-6 ಗಂಟೆ ನೆನೆಸಿ\n2. ಮೃದುವಾದ ಹಿಟ್ಟಾಗುವವರೆಗೆ ಅರೆಯಿರಿ\n3. ರಾತ್ರಿಯಿಡೀ ಹುಳಿಮಾಡಿ\n4. ತವೆಯನ್ನು ಕಾಯಿಸಿ ಹಿಟ್ಟು ಸುರಿಯಿರಿ\n5. ಗರಿಗರಿಯಾಗುವವರೆಗೆ ಬೇಯಿಸಿ',
        'ಚಟ್ನಿ ಮತ್ತು ಸಾಂಬಾರ್ ಜೊತೆ ಬಡಿಸುವುದು ಉತ್ತಮ',
      ]
    );

    await db.runAsync(
      `INSERT INTO recipe_content (recipe_id, language, instructions, notes)
       VALUES (?, ?, ?, ?)`,
      [
        dosaResult.lastInsertRowId,
        'mr',
        '1. तांदूळ आणि उडीद डाळ 4-6 तास भिजवा\n2. गुळगुळीत पिठाचे पीठ करा\n3. रात्रभर आंबवा\n4. तवा गरम करा आणि पीठ ओता\n5. कुरकुरीत होईपर्यंत शिजवा',
        'चटणी आणि सांबार सोबत सर्व्ह करा',
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
        dalResult.lastInsertRowId,
        'kn',
        '1. ಬೇಳೆಯನ್ನು ಅರಿಶಿಣದೊಂದಿಗೆ ಪ್ರೆಶರ್ ಕುಕ್ ಮಾಡಿ\n2. ತುಪ್ಪ, ಜೀರಿಗೆ, ಈರುಳ್ಳಿಯಿಂದ ಒಗ್ಗರಣೆ ಮಾಡಿ\n3. ಟೊಮೇಟೊ ಸೇರಿಸಿ ಬೇಯಿಸಿ\n4. ಬೇಯಿಸಿದ ಬೇಳೆಯೊಂದಿಗೆ ಬೆರೆಸಿ\n5. ಕೊತ್ತಂಬರಿ ಸೊಪ್ಪಿನಿಂದ ಅಲಂಕರಿಸಿ',
        'ಪ್ರೋಟೀನ್ ಭರಿತ ಮತ್ತು ಪೌಷ್ಟಿಕ',
      ]
    );

    await db.runAsync(
      `INSERT INTO recipe_content (recipe_id, language, instructions, notes)
       VALUES (?, ?, ?, ?)`,
      [
        dalResult.lastInsertRowId,
        'mr',
        '1. डाळ हळद सोबत प्रेशर कुकरमध्ये शिजवा\n2. तूप, जिरे, कांदे यांचा फोडणी घाला\n3. टोमॅटो घालून शिजवा\n4. शिजलेल्या डाळीत मिक्स करा\n5. कोथिंबीर घालून सजवा',
        'प्रथिनेयुक्त आणि पौष्टिक',
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
        riceResult.lastInsertRowId,
        'kn',
        '1. ಅಕ್ಕಿಯನ್ನು ಚೆನ್ನಾಗಿ ತೊಳೆಯಿರಿ\n2. ನೀರು ಸೇರಿಸಿ (1:2 ಅನುಪಾತ)\n3. 2 ಸಿಟ್ಟಿಗೆಗಳಿಗೆ ಪ್ರೆಶರ್ ಕುಕ್ ಮಾಡಿ\n4. ಉಗಿ ನೈಸರ್ಗಿಕವಾಗಿ ಬಿಡುಗಡೆಯಾಗಲಿ\n5. ಪಫ್ ಮಾಡಿ ಬಡಿಸಿ',
        'ಯಾವುದೇ ಕರಿಗೆ ಪರಿಪೂರ್ಣ ಜೊತೆಗಾರ',
      ]
    );

    await db.runAsync(
      `INSERT INTO recipe_content (recipe_id, language, instructions, notes)
       VALUES (?, ?, ?, ?)`,
      [
        riceResult.lastInsertRowId,
        'mr',
        '1. तांदूळ चांगले धुवा\n2. पाणी घाला (1:2 प्रमाण)\n3. 2 शिट्ट्या येईपर्यंत प्रेशर कुकरमध्ये शिजवा\n4. वाफ नैसर्गिकरित्या सोडा\n5. फुगवून सर्व्ह करा',
        'कोणत्याही भाजीसाठी उत्तम',
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
        chapatiResult.lastInsertRowId,
        'kn',
        '1. ಹಿಟ್ಟನ್ನು ನೀರಿನೊಂದಿಗೆ ನಯವಾಗಿ ಕಲೆಯಿರಿ\n2. 15 ನಿಮಿಷಗಳ ಕಾಲ ವಿಶ್ರಾಂತಿ ಮಾಡಿ\n3. ತೆಳುವಾದ ವೃತ್ತಗಳಾಗಿ ಉರುಳಿಸಿ\n4. ಬಿಸಿ ತವೆಯ ಮೇಲೆ ಬೇಯಿಸಿ\n5. ತುಪ್ಪ ಹಚ್ಚಿ ಬಿಸಿಬಿಸಿಯಾಗಿ ಬಡಿಸಿ',
        'ಗೋಧಿ ಹಿಟ್ಟಿನ ರೊಟ್ಟಿ',
      ]
    );

    await db.runAsync(
      `INSERT INTO recipe_content (recipe_id, language, instructions, notes)
       VALUES (?, ?, ?, ?)`,
      [
        chapatiResult.lastInsertRowId,
        'mr',
        '1. पीठ पाण्यात मळून घ्या\n2. 15 मिनिटे विश्रांती द्या\n3. पातळ गोल वाढून घ्या\n4. गरम तव्यावर भाजून घ्या\n5. तूप लावून गरमागरम सर्व्ह करा',
        'संपूर्ण गव्हाची पोळी',
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
        alooResult.lastInsertRowId,
        'kn',
        '1. ಆಲೂಗಡ್ಡೆಯನ್ನು ತುಂಡುಗಳಾಗಿ ಕತ್ತರಿಸಿ\n2. ಎಣ್ಣೆ ಕಾಯಿಸಿ, ಜೀರಿಗೆ ಸೇರಿಸಿ\n3. ಈರುಳ್ಳಿ ಮತ್ತು ಟೊಮೇಟೊವನ್ನು ಬೇಯಿಸಿ\n4. ಆಲೂಗಡ್ಡೆ ಮತ್ತು ಮಸಾಲೆ ಸೇರಿಸಿ\n5. ಮೃದುವಾಗುವವರೆಗೆ ಬೇಯಿಸಿ',
        'ರುಚಿಕರವಾದ ಆಲೂ ಪಲ್ಯ',
      ]
    );

    await db.runAsync(
      `INSERT INTO recipe_content (recipe_id, language, instructions, notes)
       VALUES (?, ?, ?, ?)`,
      [
        alooResult.lastInsertRowId,
        'mr',
        '1. बटाटे चौकोन कापा\n2. तेल गरम करा, जिरे घाला\n3. कांदे आणि टोमॅटो परतून घ्या\n4. बटाटे आणि मसाले घाला\n5. मऊ होईपर्यंत शिजवा',
        'चविष्ट बटाटा भाजी',
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

    await db.runAsync(
      `INSERT INTO recipe_content (recipe_id, language, instructions, notes)
       VALUES (?, ?, ?, ?)`,
      [
        upmaResult.lastInsertRowId,
        'kn',
        '1. ರವೆಯನ್ನು ಹುರಿಯಿರಿ\n2. ಎಣ್ಣೆ ಕಾಯಿಸಿ, ಸಾಸಿವೆ ಸೇರಿಸಿ\n3. ತರಕಾರಿಗಳನ್ನು ಸೇರಿಸಿ\n4. ನೀರು ಮತ್ತು ಹುರಿದ ರವೆ ಸೇರಿಸಿ\n5. ಪಫ್ಫಿ ಆಗುವವರೆಗೆ ಬೇಯಿಸಿ',
        'ತ್ವರಿತ ಮತ್ತು ಆರೋಗ್ಯಕರ ಉಪಹಾರ',
      ]
    );

    await db.runAsync(
      `INSERT INTO recipe_content (recipe_id, language, instructions, notes)
       VALUES (?, ?, ?, ?)`,
      [
        upmaResult.lastInsertRowId,
        'mr',
        '1. रवा भाजून घ्या\n2. तेल गरम करा, मोहरी घाला\n3. भाज्या घाला\n4. पाणी आणि भाजलेला रवा घाला\n5. फुगेपर्यंत शिजवा',
        'जलद आणि आरोग्यदायी नाश्ता',
      ]
    );

    console.log('Sample data seeded successfully!');
    console.log('- 10 pantry items');
    console.log('- 6 recipes with nutrition data');
    console.log('- Recipe ingredients linked to pantry');
    console.log('- Multilingual content (English, Kannada, Marathi)');
    console.log('- Default nutrition targets set');
  } catch (error) {
    console.error('Error seeding sample data:', error);
    throw error;
  }
}

/**
 * Seed minimal data for Web platform
 */
async function seedWebData(db: any): Promise<void> {
  try {
    // Check if data already exists
    const existingRecipes = await db.getAllAsync('SELECT * FROM recipes');
    if (existingRecipes.length > 0) {
      console.log('Web sample data already seeded');
      return;
    }

    console.log('Seeding minimal Web data...');

    // 1. Create a few pantry items
    const riceResult = await db.runAsync(
      'INSERT INTO pantry_items (name, quantity, unit, low_stock_threshold) VALUES (?, ?, ?, ?)',
      ['Rice', 5, 'kg', 1]
    );
    const ricePantryId = riceResult.lastInsertRowId;

    const dalResult = await db.runAsync(
      'INSERT INTO pantry_items (name, quantity, unit, low_stock_threshold) VALUES (?, ?, ?, ?)',
      ['Toor Dal', 2, 'kg', 0.5]
    );
    const dalPantryId = dalResult.lastInsertRowId;

    const gheeResult = await db.runAsync(
      'INSERT INTO pantry_items (name, quantity, unit, low_stock_threshold) VALUES (?, ?, ?, ?)',
      ['Ghee', 0.5, 'kg', 0.2]
    );
    const gheePantryId = gheeResult.lastInsertRowId;

    // 2. Create simple recipes
    // Recipe 1: Plain Rice
    const riceRecipeResult = await db.runAsync(
      `INSERT INTO recipes (name, prep_time_minutes, cook_time_minutes, servings, 
       calories_per_serving, protein_grams, carbs_grams, fat_grams, fiber_grams)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Steamed Rice', 5, 20, 4, 180, 4, 40, 0.5, 1]
    );
    const riceRecipeId = riceRecipeResult.lastInsertRowId;

    await db.runAsync(
      'INSERT INTO recipe_ingredients (recipe_id, pantry_item_id, quantity, unit, is_optional) VALUES (?, ?, ?, ?, ?)',
      [riceRecipeId, ricePantryId, 200, 'g', 0]
    );

    await db.runAsync(
      `INSERT INTO recipe_content (recipe_id, language, instructions, notes)
       VALUES (?, ?, ?, ?)`,
      [
        riceRecipeId,
        'en',
        '1. Wash rice thoroughly\n2. Add water (1:2 ratio)\n3. Pressure cook for 2 whistles\n4. Let steam release naturally\n5. Fluff and serve',
        'Perfect accompaniment for any curry',
      ]
    );

    // Recipe 2: Dal Tadka
    const dalRecipeResult = await db.runAsync(
      `INSERT INTO recipes (name, prep_time_minutes, cook_time_minutes, servings,
       calories_per_serving, protein_grams, carbs_grams, fat_grams, fiber_grams)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Dal Tadka', 10, 30, 4, 250, 12, 35, 6, 8]
    );
    const dalRecipeId = dalRecipeResult.lastInsertRowId;

    await db.runAsync(
      'INSERT INTO recipe_ingredients (recipe_id, pantry_item_id, quantity, unit, is_optional) VALUES (?, ?, ?, ?, ?)',
      [dalRecipeId, dalPantryId, 200, 'g', 0]
    );

    await db.runAsync(
      'INSERT INTO recipe_ingredients (recipe_id, pantry_item_id, quantity, unit, is_optional) VALUES (?, ?, ?, ?, ?)',
      [dalRecipeId, gheePantryId, 20, 'g', 0]
    );

    await db.runAsync(
      `INSERT INTO recipe_content (recipe_id, language, instructions, notes)
       VALUES (?, ?, ?, ?)`,
      [
        dalRecipeId,
        'en',
        '1. Pressure cook dal with turmeric\n2. Temper with ghee, cumin, onions\n3. Add tomatoes and cook\n4. Mix with cooked dal\n5. Garnish with coriander',
        'Protein-rich and nutritious',
      ]
    );

    // 3. Create default nutrition target
    await db.runAsync(
      `INSERT INTO nutrition_targets (target_date, calories_target, protein_target, 
       carbs_target, fat_target, fiber_target) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['default', 2000, 50, 250, 70, 25]
    );

    console.log('Web sample data seeded successfully!');
    console.log('- 3 pantry items');
    console.log('- 2 recipes with nutrition data');
    console.log('- Recipe ingredients linked to pantry');
    console.log('- Default nutrition target');
  } catch (error) {
    console.error('Error seeding Web data:', error);
    throw error;
  }
}
