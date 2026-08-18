import { useEffect, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../store/authStore';
import { migrationService } from '../services/migrationService';

const PREV_IDENTITY_KEY = 'merki.prev.identity';

interface StoredIdentity {
  id: string;
  isAnonymous: boolean;
}

export function useGuestDataMigration() {
  const { user } = useAuth();
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    (async () => {
      let prevRaw: string | null = null;
      try {
        prevRaw = await SecureStore.getItemAsync(PREV_IDENTITY_KEY);
      } catch {
        return;
      }

      let prev: StoredIdentity | null = null;
      if (prevRaw) {
        try {
          prev = JSON.parse(prevRaw) as StoredIdentity;
        } catch {
          // corrupted value — ignore
        }
      }

      const shouldMigrate =
        !cancelled &&
        !user.isAnonymous &&
        !!prev?.id &&
        prev.isAnonymous === true &&
        prev.id !== user.id &&
        !attemptedRef.current;

      if (shouldMigrate && prev?.id) {
        attemptedRef.current = true;
        const result = await migrationService.migrateGuestData(prev.id, user.id);
        if (result.success) {
          await SecureStore.deleteItemAsync(PREV_IDENTITY_KEY).catch(() => {});
        } else {
          // Allow a retry on the next identity change or app restart.
          attemptedRef.current = false;
        }
      }

      // Always record the current identity so the next anonymous → registered
      // transition knows where the previous data lives.
      if (!cancelled) {
        const current = JSON.stringify({ id: user.id, isAnonymous: user.isAnonymous });
        if (prevRaw !== current) {
          await SecureStore.setItemAsync(PREV_IDENTITY_KEY, current).catch(() => {});
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.isAnonymous]);
}
