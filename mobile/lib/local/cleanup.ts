import * as SecureStore from 'expo-secure-store';
import { getDb, closeDb } from './database';
import { safeClear } from '../../utils/storage';

const SECURE_KEYS = ['better-auth_cookie', 'better-auth_session_data', 'merki.prev.identity'];

export async function resetLocalDatabase(): Promise<void> {
  const db = await getDb().catch(() => null);
  if (db) {
    await db
      .execAsync(
        `
        DELETE FROM sync_queue;
        DELETE FROM cart_products;
        DELETE FROM carts;
        DELETE FROM supermarkets;
        DELETE FROM auth_cache;
      `
      )
      .catch(() => {});
  }
  await closeDb().catch(() => {});
}

export async function clearAllLocalData(): Promise<void> {
  await resetLocalDatabase();
  await safeClear();
  for (const key of SECURE_KEYS) {
    await SecureStore.deleteItemAsync(key).catch(() => {});
  }
}
