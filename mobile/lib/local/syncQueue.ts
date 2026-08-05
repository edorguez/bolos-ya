import { getDb } from './database';

export type SyncAction = 'INSERT' | 'UPDATE' | 'DELETE';
export type SyncTable = 'carts' | 'cart_products' | 'supermarkets';

export interface SyncQueueItem {
  id: number;
  tableName: string;
  action: SyncAction;
  localId: string;
  payload: string;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  error: string | null;
  createdAt: string;
  retryCount: number;
}

// expo-sqlite returns rows keyed by the snake_case column names, but the
// SyncQueueItem interface uses camelCase. Alias the columns so consumers get
// the expected fields.
const SYNC_QUEUE_COLUMNS = `id, table_name AS tableName, action, local_id AS localId, payload, status, error, created_at AS createdAt, retry_count AS retryCount`;

export const syncQueue = {
  async enqueue(
    table: SyncTable,
    action: SyncAction,
    localId: string,
    payload: Record<string, unknown>
  ): Promise<void> {
    const database = await getDb();
    const now = new Date().toISOString();
    await database.runAsync(
      `INSERT INTO sync_queue (table_name, action, local_id, payload, status, created_at)
      VALUES (?, ?, ?, ?, 'pending', ?)`,
      [table, action, localId, JSON.stringify(payload), now]
    );
  },

  async getPending(limit: number = 50): Promise<SyncQueueItem[]> {
    const database = await getDb();
    return database.getAllAsync<SyncQueueItem>(
      `SELECT ${SYNC_QUEUE_COLUMNS} FROM sync_queue WHERE status IN ('pending', 'failed') ORDER BY id ASC LIMIT ?`,
      [limit]
    );
  },

  async markSyncing(id: number): Promise<void> {
    const database = await getDb();
    await database.runAsync("UPDATE sync_queue SET status = 'syncing' WHERE id = ?", [id]);
  },

  async markCompleted(id: number): Promise<void> {
    const database = await getDb();
    await database.runAsync("UPDATE sync_queue SET status = 'completed' WHERE id = ?", [id]);
  },

  async markFailed(id: number, error: string): Promise<void> {
    const database = await getDb();
    const item = await database.getFirstAsync<SyncQueueItem>(
      `SELECT ${SYNC_QUEUE_COLUMNS} FROM sync_queue WHERE id = ?`,
      [id]
    );
    const retryCount = (item?.retryCount ?? 0) + 1;
    await database.runAsync(
      'UPDATE sync_queue SET status = ?, error = ?, retry_count = ? WHERE id = ?',
      [retryCount >= 5 ? 'failed' : 'pending', error, retryCount, id]
    );
  },

  async getPendingCount(): Promise<number> {
    const database = await getDb();
    const row = await database.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM sync_queue WHERE status IN ('pending', 'failed')"
    );
    return row?.count ?? 0;
  },

  async clearCompleted(): Promise<void> {
    const database = await getDb();
    await database.runAsync("DELETE FROM sync_queue WHERE status = 'completed'");
  },

  async resetStuck(): Promise<void> {
    const database = await getDb();
    await database.runAsync("UPDATE sync_queue SET status = 'pending' WHERE status = 'syncing'");
  },
};
