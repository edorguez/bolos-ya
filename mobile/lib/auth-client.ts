import { createAuthClient } from 'better-auth/react'
import { expo } from '@better-auth/expo'

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_BETTER_AUTH_URL || 'http://localhost:8081/api/auth',
  plugins: [expo()],
})

export const { signIn, signUp, signOut, useSession } = authClient
