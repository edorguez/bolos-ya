import { apiPost } from './api';
import { syncQueue } from '../lib/local/syncQueue';
import { cartRepository } from '../lib/local/repositories/cartRepository';
import { supermarketRepository } from '../lib/local/repositories/supermarketRepository';
import { useCartStore } from '../store/cartStore';
import type { ApiResponse } from '../types';
import type { SyncOperation, SyncResponse } from '../types/sync';

let isSyncing = false;

export const syncService = {
  async syncAll(userId?: string): Promise<{ synced: number; failed: number }> {
    if (isSyncing) return { synced: 0, failed: 0 };
    isSyncing = true;

    try {
      await syncQueue.resetStuck();
      const pending = await syncQueue.getPending(50);

      if (pending.length === 0) {
        return { synced: 0, failed: 0 };
      }

      const operations: SyncOperation[] = pending.map(item => ({
        table: item.tableName as SyncOperation['table'],
        action: item.action as SyncOperation['action'],
        payload: JSON.parse(item.payload),
        timestamp: new Date(item.createdAt).getTime(),
        localId: item.localId,
      }));

      for (const item of pending) {
        await syncQueue.markSyncing(item.id);
      }

      let synced = 0;
      let failed = 0;

      try {
        const response = await apiPost<ApiResponse<SyncResponse>>('/sync', userId, { operations });
        const results = response.data?.results ?? [];

        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          const item = pending[i];
          if (!item) continue;

          if (result.success) {
            await syncQueue.markCompleted(item.id);

            if (result.serverVersion) {
              await handleServerVersion(item, result.serverVersion);
            }

            synced++;
          } else {
            await syncQueue.markFailed(item.id, result.error || 'Unknown error');
            failed++;
          }
        }

        // Defensive: if the server returned fewer results than ops sent, fail the
        // remaining ops so they are retried instead of being dropped.
        for (let i = results.length; i < pending.length; i++) {
          await syncQueue.markFailed(pending[i].id, 'no result from server');
          failed++;
        }
      } catch {
        for (const item of pending) {
          await syncQueue.markFailed(item.id, 'sync_error');
        }
        failed = pending.length;
      }

      return { synced, failed };
    } finally {
      isSyncing = false;
    }
  },

  async enqueueAndSync(
    table: 'carts' | 'cart_products' | 'supermarkets',
    action: 'INSERT' | 'UPDATE' | 'DELETE',
    localId: string,
    payload: Record<string, unknown>,
    userId?: string
  ): Promise<void> {
    await syncQueue.enqueue(table, action, localId, payload);

    try {
      const network = await import('expo-network');
      const state = await network.getNetworkStateAsync();
      if (state.isConnected && state.isInternetReachable !== false) {
        await this.syncAll(userId);
      }
    } catch {
      // offline, will sync later
    }
  },

  async getPendingCount(): Promise<number> {
    return syncQueue.getPendingCount();
  },

  isSyncing(): boolean {
    return isSyncing;
  },
};

async function handleServerVersion(
  item: { tableName: string; localId: string; action: string },
  serverVersion: Record<string, unknown>
): Promise<void> {
  const serverId = serverVersion.id as string;
  if (!serverId) return;

  if (item.tableName === 'carts' && item.action === 'INSERT') {
    await cartRepository.replaceId(item.localId, serverId);
    reconcileCartId(item.localId, serverId);
  }

  if (item.tableName === 'supermarkets' && item.action === 'INSERT') {
    await supermarketRepository.replaceId(item.localId, serverId);
  }
}

// After a cart is synced, the server assigns its own id. Reconcile the zustand
// store (and active cart) so subsequent product ops target the server cart.
function reconcileCartId(localId: string, serverId: string): void {
  const { carts, activeCartId, updateCart, setActiveCart } = useCartStore.getState();
  if (carts.some(cart => cart.id === localId)) {
    updateCart(localId, { id: serverId });
    if (activeCartId === localId) {
      setActiveCart(serverId);
    }
  }
}
