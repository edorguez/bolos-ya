import { useState, useEffect } from 'react';
import { useSession, signOut } from '../lib/auth-client';
import { apiGet, clearSessionTokenCache } from '../services/api';

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
  name: string;
  isPremium: boolean;
  isAnonymous: boolean;
  premiumUntil?: string | null;
}

export function useAuth() {
  const { data: session, isPending } = useSession();
  const [internalUserId, setInternalUserId] = useState<string | null>(null);
  const [backendName, setBackendName] = useState<string | null>(null);
  const [premiumData, setPremiumData] = useState<{
    isPremium: boolean;
    premiumUntil?: string | null;
  } | null>(null);

  // The API client caches the bearer token at module level. Drop that cache
  // whenever the session user changes (login/logout/migration) so requests
  // always use the token for the CURRENT session, never a stale one.
  const sessionUserId = session?.user?.id;
  useEffect(() => {
    clearSessionTokenCache();
  }, [sessionUserId]);

  useEffect(() => {
    if (session?.user && !internalUserId) {
      apiGet<{ success: boolean; data: GetMeData }>('/auth/me')
        .then(res => {
          setInternalUserId(res.data.userId);
          setBackendName(res.data.name || null);
          setPremiumData({
            isPremium: res.data.isPremium,
            premiumUntil: res.data.premiumUntil,
          });
        })
        .catch(() => {
          setInternalUserId(session.user.id);
          setBackendName(null);
          setPremiumData({
            isPremium: (session.user as Record<string, unknown>).isPremium === true,
            premiumUntil: (session.user as Record<string, unknown>).premiumUntil as
              | string
              | null
              | undefined,
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
        name: backendName ?? session.user.name,
        image: (session.user as Record<string, unknown>).image as string | null | undefined,
      }
    : null;

  // True once we know the user's premium status with certainty (from /auth/me
  // or a settled logged-out session). Until then, ad components must render
  // nothing so premium users never see a flash of ads.
  const premiumResolved = premiumData !== null || (!isPending && !session?.user);

  const handleLogout = async () => {
    clearSessionTokenCache();
    await signOut();
  };

  return {
    user,
    isLoading: isPending,
    premiumResolved,
    logout: handleLogout,
  };
}

// Single source of truth for ad gating: a user is premium only while the flag
// is set AND premiumUntil (when present) is still in the future. `isResolved`
// is false while the premium status is still loading — ads must not render then.
export function useIsPremium(): { isPremium: boolean; isResolved: boolean } {
  const { user, premiumResolved } = useAuth();

  let isPremium = user?.isPremium === true;
  if (isPremium && user?.premiumUntil) {
    isPremium = new Date(user.premiumUntil).getTime() > Date.now();
  }

  return { isPremium, isResolved: premiumResolved };
}
