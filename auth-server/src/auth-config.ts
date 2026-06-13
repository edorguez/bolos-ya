import { betterAuth } from 'better-auth'
import { Pool } from 'pg'
import { anonymous } from 'better-auth/plugins/anonymous'
import { expo } from '@better-auth/expo'

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001/api/auth',
  trustedOrigins: [
    'bolosya://',
    ...(process.env.TRUSTED_ORIGINS?.split(',').map((o) => o.trim()) || []),
  ],
  database: pool,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'user',
      },
      isPremium: {
        type: 'boolean',
        defaultValue: false,
      },
      premiumUntil: {
        type: 'date',
        required: false,
      },
      authProvider: {
        type: 'string',
        required: false,
      },
      deletedAt: {
        type: 'date',
        required: false,
      },
    },
  },
  plugins: [
    expo(),
    anonymous({
      onLinkAccount: async (data) => {
        const goBackendUrl = process.env.GO_BACKEND_URL || 'http://localhost:8080'

        const response = await fetch(`${goBackendUrl}/api/v1/auth/internal/migrate-user-data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.anonymousUser.session?.token}`,
          },
          body: JSON.stringify({
            fromBetterAuthUserId: data.anonymousUser.user.id,
            toBetterAuthUserId: data.newUser.user.id,
            email: data.newUser.user.email,
            authProvider: (data.newUser.user as Record<string, unknown>).authProvider || 'email',
          }),
        })

        if (!response.ok) {
          console.error('migrate-user-data failed:', response.status, await response.text())
        }
      },
    }),
  ],
  secret: process.env.BETTER_AUTH_SECRET,
})
