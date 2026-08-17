import { useEffect, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../store/authStore';
import { migrationService } from '../services/migrationService';

const OFFLINE_GUEST_KEY = 'merki.offline.guest';

export function useGuestDataMigration() {
  const { user } = useAuth();
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (attemptedRef.current) return;
    if (!user?.id || user.isAnonymous) return;

    let cancelled = false;
    (async () => {
      let raw: string | null = null;
      try {
        raw = await SecureStore.getItemAsync(OFFLINE_GUEST_KEY);
      } catch {
        return;
      }
      if (cancelled || !raw) return;

      let guest: { id?: string } | null = null;
      try {
        guest = JSON.parse(raw);
      } catch {
        return;
      }
      if (!guest?.id) return;

      attemptedRef.current = true;
      const result = await migrationService.migrateGuestData(guest.id, user.id);
      if (result.success) {
        await SecureStore.deleteItemAsync(OFFLINE_GUEST_KEY).catch(() => {});
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.isAnonymous]);
}
