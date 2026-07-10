import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

const DB_NAME = 'bolosya_offline.db';

const MIGRATIONS = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS supermarkets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        is_custom INTEGER NOT NULL DEFAULT 0,
        image_url TEXT,
        user_id TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        deleted_at TEXT
      );

      CREATE TABLE IF NOT EXISTS carts (
        id TEXT PRIMARY KEY,
        supermarket_id TEXT NOT NULL,
        supermarket_name TEXT NOT NULL DEFAULT '',
        user_id TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        budget_bs REAL NOT NULL DEFAULT 0,
        budget_usd REAL NOT NULL DEFAULT 0,
        total_estimated_bs REAL,
        total_estimated_usd REAL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        deleted_at TEXT,
        synced_at TEXT
      );

      CREATE TABLE IF NOT EXISTS cart_products (
        id TEXT PRIMARY KEY,
        cart_id TEXT NOT NULL,
        product_id TEXT,
        name TEXT NOT NULL,
        price_bs REAL NOT NULL DEFAULT 0,
        price_usd REAL NOT NULL DEFAULT 0,
        quantity INTEGER NOT NULL DEFAULT 1,
        is_manual_entry INTEGER NOT NULL DEFAULT 0,
        image_url TEXT,
        supermarket TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        deleted_at TEXT,
        FOREIGN KEY (cart_id) REFERENCES carts(id)
      );

      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        action TEXT NOT NULL,
        local_id TEXT NOT NULL,
        payload TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        error TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        retry_count INTEGER NOT NULL DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_cart_products_cart_id ON cart_products(cart_id);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
      CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
      CREATE INDEX IF NOT EXISTS idx_carts_synced ON carts(synced_at);
    `,
  },
  {
    version: 2,
    sql: `
      CREATE TABLE IF NOT EXISTS auth_cache (
        id TEXT PRIMARY KEY,
        session_data TEXT NOT NULL,
        user_id TEXT,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `,
  },
];

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync(DB_NAME);
  await runMigrations(db);
  return db;
}

async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  const currentVersion = await database
    .getFirstAsync<{ version: number }>('PRAGMA user_version')
    .then(r => r?.version ?? 0);

  const pending = MIGRATIONS.filter(m => m.version > currentVersion);
  for (const migration of pending) {
    const statements = migration.sql.split(';').filter(s => s.trim().length > 0);
    for (const stmt of statements) {
      await database.execAsync(stmt.trim() + ';');
    }
    await database.execAsync(`PRAGMA user_version = ${migration.version};`);
  }
}

export async function closeDb(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}

export async function isLocalId(id: string): Promise<boolean> {
  return id.startsWith('local_');
}

export function generateLocalId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
