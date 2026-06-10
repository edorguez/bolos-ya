import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import { anonymousClient } from 'better-auth/client/plugins';
import * as SecureStore from 'expo-secure-store';
import { getAuthBaseUrl } from '../lib/env';

export const authClient = createAuthClient({
  baseURL: getAuthBaseUrl(),
  plugins: [expoClient({ storage: SecureStore, scheme: 'bolosya' }), anonymousClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
