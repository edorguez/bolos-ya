import { betterAuth } from 'better-auth'
import { Pool } from 'pg'
import { anonymous } from 'better-auth/plugins/anonymous'

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
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
  plugins: [anonymous()],
  secret: process.env.BETTER_AUTH_SECRET,
})
