import { useState, useEffect } from 'react';
import { useSession, signOut } from '../lib/auth-client';
import { apiGet } from '../services/api';

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

export function useAuth() {
  const { data: session, isPending } = useSession();
  const [internalUserId, setInternalUserId] = useState<string | null>(null);
  const [premiumData, setPremiumData] = useState<{ isPremium: boolean; premiumUntil?: string | null } | null>(null);

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
        isPremium: premiumData?.isPremium ?? (session.user as Record<string, unknown>).isPremium === true,
        isAnonymous: (session.user as Record<string, unknown>).isAnonymous === true,
        premiumUntil: premiumData?.premiumUntil,
        name: session.user.name,
        image: (session.user as Record<string, unknown>).image as string | null | undefined,
      }
    : null;

  const handleLogout = async () => {
    await signOut();
  };

  return {
    user,
    isLoading: isPending,
    isAuthenticated: !!session,
    logout: handleLogout,
  };
}
