/**
 * Database connection and initialization
 */
import * as SQLite from 'expo-sqlite';
import { SCHEMA_VERSION, MIGRATIONS } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the database and run migrations
 */
export async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  try {
    // Open or create the database
    db = await SQLite.openDatabaseAsync('bhojanayojana.db');

    // Enable foreign keys
    await db.execAsync('PRAGMA foreign_keys = ON;');

    // Check current schema version
    const currentVersion = await getCurrentSchemaVersion(db);

    // Run migrations if needed
    if (currentVersion < SCHEMA_VERSION) {
      await runMigrations(db, currentVersion);
    }

    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Get the current schema version from the database
 */
async function getCurrentSchemaVersion(database: SQLite.SQLiteDatabase): Promise<number> {
  try {
    const result = await database.getFirstAsync<{ user_version: number }>(
      'PRAGMA user_version;'
    );
    return result?.user_version ?? 0;
  } catch (error) {
    console.error('Failed to get schema version:', error);
    return 0;
  }
}

/**
 * Run database migrations
 */
async function runMigrations(database: SQLite.SQLiteDatabase, fromVersion: number): Promise<void> {
  console.log(`Running migrations from version ${fromVersion} to ${SCHEMA_VERSION}`);

  try {
    // Run each migration in sequence
    for (const migration of MIGRATIONS) {
      if (migration.version > fromVersion) {
        console.log(`Applying migration ${migration.version}`);
        await database.execAsync(migration.up);
      }
    }

    // Update schema version
    await database.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

/**
 * Get the database instance
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
    console.log('Database connection closed');
  }
}
