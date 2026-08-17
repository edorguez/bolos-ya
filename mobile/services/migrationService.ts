import { getDb } from '../lib/local/database';
import { cartRepository } from '../lib/local/repositories/cartRepository';
import { syncQueue } from '../lib/local/syncQueue';
import { syncService } from './syncService';
import { toCents } from '../utils/priceUtils';
import { SYNC_ACTIONS, SYNC_TABLES } from '../types/sync';

export const migrationService = {
  async migrateGuestData(
    oldUserId: string,
    newUserId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const unsyncedCarts = (await cartRepository.getAll(oldUserId)).filter(
        cart => cart.syncedAt === null && cart.id.startsWith('local_')
      );

      const database = await getDb();
      await database.runAsync('UPDATE carts SET user_id = ? WHERE user_id = ?', [
        newUserId,
        oldUserId,
      ]);
      await database.runAsync('UPDATE supermarkets SET user_id = ? WHERE user_id = ?', [
        newUserId,
        oldUserId,
      ]);
      await syncQueue.rewriteUserId(oldUserId, newUserId);

      for (const cart of unsyncedCarts) {
        const alreadyQueued = await syncQueue.hasPendingOp(SYNC_TABLES.CARTS, cart.id);
        if (alreadyQueued) continue;

        const isCustom = cart.supermarketId.startsWith('local_');
        await syncQueue.enqueue(SYNC_TABLES.CARTS, SYNC_ACTIONS.INSERT, cart.id, {
          id: cart.id,
          supermarketId: isCustom ? undefined : cart.supermarketId,
          newSupermarket: isCustom ? { name: cart.supermarketName } : undefined,
          budgetBs: toCents(cart.budgetBs),
          budgetUsd: toCents(cart.budgetUsd),
          userId: newUserId,
        });
      }

      await syncService.syncAll(newUserId);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Migration failed',
      };
    }
  },
};
