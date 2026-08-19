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
    'merki://',
    ...(process.env.TRUSTED_ORIGINS?.split(',').map((o) => o.trim()) || []),
  ],
  rateLimit: {
    enabled: true,
    window: 60,
    max: 20,
    customRules: {
      '/request-password-reset': { window: 60, max: 5 },
    },
  },
  database: pool,
  emailAndPassword: {
    enabled: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, token }) => {
      // The reset link points straight at the mobile deep link. The email is
      // rendered and sent by the Go backend, which owns all email templates.
      const resetUrl = `${process.env.RESET_PASSWORD_URL || 'https://auth.somosmerki.app/reset-password'}?token=${token}`
      const goBackendUrl = process.env.GO_BACKEND_URL || 'http://localhost:8080'

      const response = await fetch(
        `${goBackendUrl}/api/v1/auth/internal/send-reset-password-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`,
          },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            resetUrl,
          }),
        },
      )

      if (!response.ok) {
        throw new Error(
          `send reset password email failed: ${response.status} ${await response.text()}`,
        )
      }
    },
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
