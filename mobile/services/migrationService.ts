import { apiPost } from './api';
import { cartRepository } from '../lib/local/repositories/cartRepository';
import { supermarketRepository } from '../lib/local/repositories/supermarketRepository';
import { syncQueue } from '../lib/local/syncQueue';
import { SYNC_ACTIONS, SYNC_TABLES, type SyncOperation, type SyncResponse } from '../types/sync';

export const migrationService = {
  async migrateGuestData(
    oldUserId: string,
    newUserId: string,
    options?: { email?: string; authProvider?: string }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const localCarts = await cartRepository.getAll(oldUserId);
      const localSupermarkets = await supermarketRepository.getAll();
      const pendingOps = await syncQueue.getPending(100);

      const operations: SyncOperation[] = [
        ...pendingOps.map(item => ({
          table: item.tableName,
          action: item.action,
          payload: { ...JSON.parse(item.payload), userId: newUserId },
          timestamp: new Date(item.createdAt).getTime(),
          localId: item.localId,
        })),
        ...localCarts.map(cart => ({
          table: SYNC_TABLES.CARTS,
          action: SYNC_ACTIONS.INSERT,
          payload: {
            id: cart.id,
            supermarketId: cart.supermarketId,
            supermarketName: cart.supermarketName,
            userId: newUserId,
            budgetBs: cart.budgetBs,
            budgetUsd: cart.budgetUsd,
          },
          timestamp: Date.now(),
          localId: cart.id,
        })),
        ...localSupermarkets
          .filter(s => s.isCustom)
          .map(s => ({
            table: SYNC_TABLES.SUPERMARKETS,
            action: SYNC_ACTIONS.INSERT,
            payload: {
              id: s.id,
              name: s.name,
              isCustom: true,
              userId: newUserId,
            },
            timestamp: Date.now(),
            localId: s.id,
          })),
      ];

      if (operations.length === 0) {
        return { success: true };
      }

      const response = await apiPost<SyncResponse>('/auth/internal/migrate-user-data', newUserId, {
        fromBetterAuthUserId: oldUserId,
        toBetterAuthUserId: newUserId,
        email: options?.email ?? '',
        authProvider: options?.authProvider ?? 'email',
        operations,
      });

      const allOk = response.results.every(r => r.success);
      if (!allOk) {
        const errors = response.results
          .filter(r => !r.success)
          .map(r => r.error)
          .join(', ');
        return { success: false, error: errors || 'Migration failed' };
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Migration failed',
      };
    }
  },
};
