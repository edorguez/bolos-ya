import { useState, useEffect } from 'react';
import { useSession, signOut } from '../lib/auth-client';
import { apiGet } from '../services/api';

interface AuthUser {
  id: string;
  userId?: string;
  email: string;
  isPremium: boolean;
  isAnonymous: boolean;
  name?: string | null;
  image?: string | null;
}

export function useAuth() {
  const { data: session, isPending } = useSession();
  const [internalUserId, setInternalUserId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user && !internalUserId) {
      apiGet<{ success: boolean; data: { userId: string } }>('/auth/me')
        .then(res => setInternalUserId(res.data.userId))
        .catch(() => setInternalUserId(session.user.id));
    }
  }, [session?.user, internalUserId]);

  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id,
        userId: internalUserId ?? undefined,
        email: session.user.email,
        isPremium: (session.user as Record<string, unknown>).isPremium === true,
        isAnonymous: (session.user as Record<string, unknown>).isAnonymous === true,
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
