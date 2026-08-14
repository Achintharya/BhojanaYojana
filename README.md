# Bhojana Yojana

A local-first household grocery, pantry, meal-planning, recipe, and meal-preparation app for Android tablets and Web.

## Project Status

**Phase: Foundation Complete ✅**

This is V1 foundation - the core architecture, database, and navigation structure are in place.

## Technology Stack

- **React Native** with **Expo SDK 57**
- **TypeScript** (strict mode enabled)
- **Expo Router** for file-based navigation
- **SQLite** (expo-sqlite) for native platforms (iOS/Android)
- **localStorage** for Web platform persistence
- Target: Android tablets (cheap hardware, local-first) + Web

## Platform Support

| Platform | Storage | Status |
|----------|---------|--------|
| **Android** | SQLite | ✅ Fully Supported |
| **iOS** | SQLite | ✅ Fully Supported |
| **Web** | localStorage | ✅ Fully Supported |

### Web Platform Notes
- Uses custom localStorage-based persistence layer
- SQLite-compatible API for seamless cross-platform development
- ~5-10MB storage limit (sufficient for household data)
- Data persists across browser sessions
- See [Web Persistence Documentation](docs/WEB_PERSISTENCE.md)

## Project Structure

```
BhojanaYojana/
├── app/                          # Expo Router app directory
│   ├── _layout.tsx              # Root layout with DB initialization
│   └── (tabs)/                  # Tab navigation group
│       ├── _layout.tsx          # Tab navigator configuration
│       ├── index.tsx            # Home/Dashboard screen
│       ├── pantry.tsx           # Pantry management screen
│       ├── grocery.tsx          # Grocery list screen
│       ├── recipes.tsx          # Recipe browser screen
│       ├── mealplan.tsx         # Meal planning screen
│       └── nutrition.tsx        # Nutrition tracking screen
├── src/
│   ├── database/
│   │   ├── db.ts                # Database connection & initialization
│   │   ├── schema.ts            # Database schema & migrations
│   │   └── types.ts             # TypeScript type definitions
│   └── modules/
│       ├── pantry/
│       │   └── pantryData.ts    # Pantry data access layer
│       ├── grocery/
│       │   └── groceryData.ts   # Grocery data access layer
│       ├── recipes/
│       │   └── recipeData.ts    # Recipe data access layer
│       ├── mealPlanning/
│       │   └── mealPlanData.ts  # Meal plan data access layer
│       ├── nutrition/
│       │   └── nutritionData.ts # Nutrition data access layer
│       └── preparation/
│           └── preparationData.ts # Prep task data access layer
├── assets/                       # Images and icons
├── package.json
├── tsconfig.json
└── app.json                      # Expo configuration
```

## Database Schema

The SQLite database includes the following tables:

- **pantry_items** - Track inventory, quantities, low-stock thresholds, expiry dates
- **recipes** - Recipe metadata and nutrition information
- **recipe_content** - Localized content (English, Kannada, Marathi) for recipes
- **recipe_ingredients** - Junction table linking recipes to pantry items
- **meal_plans** - Scheduled meals with date and meal type
- **nutrition_targets** - Daily nutritional goals
- **grocery_items** - Shopping list (auto-generated + manual)
- **preparation_tasks** - Meal prep reminders (soaking, marinating, etc.)

## Architecture Principles

✅ **Clean separation of concerns:**
- UI (React Native screens)
- Data access layer (typed functions per module)
- Database schema (SQLite)
- Business logic (to be implemented in next phases)

✅ **Type-safe:**
- TypeScript strict mode
- Typed database entities
- No `any` types

✅ **Local-first:**
- All data stored in SQLite
- No backend dependencies
- Works offline

✅ **Modular:**
- Each feature has its own module directory
- Data access functions exported per module
- Easy to extend in future phases

## V1 Requirements (Locked Scope)

### 1. Smart Grocery List & Pantry Tracker
- Track pantry items and quantities
- Low-stock threshold tracking
- Auto-add to grocery list when low
- Check meal plans against pantry
- Track expiry dates
- Reduce food waste

### 2. Meal Prep & Automated Reminders
- Preparation task support (soaking, marinating, etc.)
- Reminder generation for prep tasks
- Daily prep alerts
- Consider next day's menu

### 3. Multilingual Recipes & Video Support
- Support English, Kannada, Marathi
- Step-by-step instructions
- Video links/embeds
- Single recipe with localized content

### 4. Recipe Generator & Meal Planning
- "What's in my fridge?" mode
- Use only available ingredients
- Daily nutritional goals
- Deterministic nutrition calculations

## What's Implemented (Foundation Phase)

✅ Project initialization with Expo + TypeScript  
✅ Expo Router navigation structure  
✅ SQLite database integration  
✅ Complete database schema for V1 requirements  
✅ Type-safe database entity definitions  
✅ Data access layer for all modules  
✅ Basic tablet-friendly UI shell  
✅ Six main screens with navigation  
✅ Database migration system  
✅ Clean module separation  

## What's NOT Implemented Yet

❌ Full UI for pantry, grocery, recipes, meal planning  
❌ Business logic (auto-add to grocery, "what's in my fridge?", etc.)  
❌ Notification/reminder system  
❌ Actual CRUD operations in UI  
❌ Recipe input/editing forms  
❌ Meal planning calendar  
❌ Nutrition calculation engine  

**These will be implemented in subsequent phases.**

## Development

### Prerequisites

- Node.js 24.x
- npm 11.x
- Expo CLI

### Install Dependencies

```bash
npm install
```

### Run the App

```bash
# Start Expo development server
npm start

# Run on Android device/emulator
npm run android

# Run on web (for testing)
npm run web
```

### TypeScript Check

```bash
npx tsc --noEmit
```

## Next Steps

After this foundation, the next phases will implement:

1. **Pantry Management UI** - Add/edit items, track quantities
2. **Recipe Management** - Add recipes with multilingual content
3. **Meal Planning** - Calendar view, schedule meals
4. **Smart Grocery Logic** - Auto-generation based on pantry + meals
5. **Preparation Reminders** - Task scheduling and notifications
6. **Nutrition Tracking** - Goal setting and progress tracking
7. **"What's in my fridge?"** - Recipe suggestions from available ingredients

## License

See LICENSE file.
