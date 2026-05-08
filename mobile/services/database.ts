import * as SQLite from 'expo-sqlite';

export interface DatabaseMigration {
  version: number;
  up: (db: SQLite.SQLiteDatabase) => Promise<void>;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('bolosya.db');
      await this.runMigrations();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async runMigrations(): Promise<void> {
    const migrations: DatabaseMigration[] = [
      {
        version: 1,
        up: async db => {
          await db.execAsync(`
            CREATE TABLE IF NOT EXISTS sync_queue (
              id TEXT PRIMARY KEY,
              table_name TEXT NOT NULL,
              action TEXT NOT NULL,
              payload TEXT NOT NULL,
              timestamp INTEGER NOT NULL,
              retry_count INTEGER DEFAULT 0,
              synced INTEGER DEFAULT 0
            );
            
            CREATE TABLE IF NOT EXISTS carts (
              id TEXT PRIMARY KEY,
              user_id TEXT,
              supermarket_id TEXT,
              status TEXT DEFAULT 'active',
              budget_bs REAL DEFAULT 0,
              budget_usd REAL DEFAULT 0,
              total_estimated_bs REAL DEFAULT 0,
              total_estimated_usd REAL DEFAULT 0,
              created_at INTEGER,
              updated_at INTEGER
            );
            
            CREATE TABLE IF NOT EXISTS cart_items (
              id TEXT PRIMARY KEY,
              cart_id TEXT,
              product_id TEXT,
              price_snapshot_bs REAL,
              price_snapshot_usd REAL,
              quantity INTEGER DEFAULT 1,
              is_manual_entry INTEGER DEFAULT 0,
              product_image_url TEXT,
              added_at INTEGER,
              updated_at INTEGER,
              FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE CASCADE
            );
            
            CREATE INDEX IF NOT EXISTS idx_sync_queue_synced ON sync_queue(synced);
            CREATE INDEX IF NOT EXISTS idx_carts_user_active ON carts(user_id, status);
            CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
          `);
        },
      },
    ];

    for (const migration of migrations) {
      await migration.up(this.db!);
    }
  }

  getDatabase(): SQLite.SQLiteDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

export const databaseService = new DatabaseService();
