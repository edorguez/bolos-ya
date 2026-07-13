import { useState, useEffect } from 'react';
import { useSession, signOut } from '../lib/auth-client';
import { apiGet } from '../services/api';
import * as SecureStore from 'expo-secure-store';

const OFFLINE_GUEST_KEY = 'bolosya.offline.guest';

interface AuthUser {
  id: string;
  userId?: string;
  email: string;
  isPremium: boolean;
  isAnonymous: boolean;
  premiumUntil?: string | null;
  name?: string | null;
  image?: string | null;
}

interface GetMeData {
  userId: string;
  isPremium: boolean;
  isAnonymous: boolean;
  premiumUntil?: string | null;
}

interface OfflineGuest {
  id: string;
  isAnonymous: boolean;
  createdAt: string;
}

export function useAuth() {
  const { data: session, isPending } = useSession();
  const [internalUserId, setInternalUserId] = useState<string | null>(null);
  const [premiumData, setPremiumData] = useState<{
    isPremium: boolean;
    premiumUntil?: string | null;
  } | null>(null);
  const [offlineGuest, setOfflineGuest] = useState<OfflineGuest | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync(OFFLINE_GUEST_KEY).then(raw => {
      if (raw) {
        try {
          setOfflineGuest(JSON.parse(raw));
        } catch {
          // ignore
        }
      }
    });
  }, []);

  useEffect(() => {
    if (session?.user && !internalUserId) {
      apiGet<{ success: boolean; data: GetMeData }>('/auth/me')
        .then(res => {
          setInternalUserId(res.data.userId);
          setPremiumData({
            isPremium: res.data.isPremium,
            premiumUntil: res.data.premiumUntil,
          });
        })
        .catch(() => {
          setInternalUserId(session.user.id);
          setPremiumData({
            isPremium: (session.user as Record<string, unknown>).isPremium === true,
            premiumUntil: null,
          });
        });
    }
  }, [session?.user, internalUserId]);

  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id,
        userId: internalUserId ?? undefined,
        email: session.user.email,
        isPremium:
          premiumData?.isPremium ?? (session.user as Record<string, unknown>).isPremium === true,
        isAnonymous: (session.user as Record<string, unknown>).isAnonymous === true,
        premiumUntil: premiumData?.premiumUntil,
        name: session.user.name,
        image: (session.user as Record<string, unknown>).image as string | null | undefined,
      }
    : offlineGuest
      ? {
          id: offlineGuest.id,
          userId: offlineGuest.id,
          email: '',
          isPremium: false,
          isAnonymous: true,
          premiumUntil: null,
          name: 'Invitado',
          image: null,
        }
      : null;

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync(OFFLINE_GUEST_KEY);
    await signOut();
    setOfflineGuest(null);
  };

  return {
    user,
    isLoading: isPending && !offlineGuest,
    isAuthenticated: !!session || !!offlineGuest,
    logout: handleLogout,
  };
}
