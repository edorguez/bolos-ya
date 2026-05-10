import { useSession, signOut } from '../lib/auth-client';

interface AuthUser {
  id: string;
  email: string;
  isPremium: boolean;
  isAnonymous: boolean;
  name?: string | null;
  image?: string | null;
}

export function useAuth() {
  const { data: session, isPending } = useSession();

  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id,
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
