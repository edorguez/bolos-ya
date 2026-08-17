import { getDb } from './database';
import { SYNC_STATUS, type SyncAction, type SyncStatus, type SyncTable } from '../../types/sync';

export interface SyncQueueItem {
  id: number;
  tableName: SyncTable;
  action: SyncAction;
  localId: string;
  payload: string;
  status: SyncStatus;
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
      VALUES (?, ?, ?, ?, ?, ?)`,
      [table, action, localId, JSON.stringify(payload), SYNC_STATUS.PENDING, now]
    );
  },

  async getPending(limit: number = 50): Promise<SyncQueueItem[]> {
    const database = await getDb();
    return database.getAllAsync<SyncQueueItem>(
      `SELECT ${SYNC_QUEUE_COLUMNS} FROM sync_queue WHERE status = ? ORDER BY id ASC LIMIT ?`,
      [SYNC_STATUS.PENDING, limit]
    );
  },

  async markSyncing(id: number): Promise<void> {
    const database = await getDb();
    await database.runAsync('UPDATE sync_queue SET status = ? WHERE id = ?', [
      SYNC_STATUS.SYNCING,
      id,
    ]);
  },

  async markCompleted(id: number): Promise<void> {
    const database = await getDb();
    await database.runAsync('UPDATE sync_queue SET status = ? WHERE id = ?', [
      SYNC_STATUS.COMPLETED,
      id,
    ]);
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
      [retryCount >= 5 ? SYNC_STATUS.FAILED : SYNC_STATUS.PENDING, error, retryCount, id]
    );
  },

  async getPendingCount(): Promise<number> {
    const database = await getDb();
    const row = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM sync_queue WHERE status = ?',
      [SYNC_STATUS.PENDING]
    );
    return row?.count ?? 0;
  },

  async hasPendingOp(table: SyncTable, localId: string): Promise<boolean> {
    const database = await getDb();
    const row = await database.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM sync_queue WHERE table_name = ? AND local_id = ? AND status = ?`,
      [table, localId, SYNC_STATUS.PENDING]
    );
    return (row?.count ?? 0) > 0;
  },

  async rewriteUserId(oldId: string, newId: string): Promise<void> {
    const database = await getDb();
    const rows = await database.getAllAsync<SyncQueueItem>(
      `SELECT ${SYNC_QUEUE_COLUMNS} FROM sync_queue`
    );

    for (const row of rows) {
      let payload: Record<string, unknown>;
      try {
        payload = JSON.parse(row.payload);
      } catch {
        continue;
      }

      let changed = false;
      for (const key of ['userId', 'user_id']) {
        if (payload[key] === oldId) {
          payload[key] = newId;
          changed = true;
        }
      }

      if (changed) {
        await database.runAsync('UPDATE sync_queue SET payload = ? WHERE id = ?', [
          JSON.stringify(payload),
          row.id,
        ]);
      }
    }
  },

  async clearFailed(): Promise<void> {
    const database = await getDb();
    await database.runAsync('DELETE FROM sync_queue WHERE status = ?', [SYNC_STATUS.FAILED]);
  },

  async clearCompleted(): Promise<void> {
    const database = await getDb();
    await database.runAsync('DELETE FROM sync_queue WHERE status = ?', [SYNC_STATUS.COMPLETED]);
  },

  async resetStuck(): Promise<void> {
    const database = await getDb();
    await database.runAsync('UPDATE sync_queue SET status = ? WHERE status = ?', [
      SYNC_STATUS.PENDING,
      SYNC_STATUS.SYNCING,
    ]);
  },
};
