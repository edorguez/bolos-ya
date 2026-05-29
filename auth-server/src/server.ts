import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { auth, pool } from './auth-config.js'

const app = new Hono()

app.use(
  '*',
  cors({
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    credentials: true,
  }),
)

app.post('/api/auth/validate-session', async (c) => {
  const { token } = await c.req.json<{ token: string }>()
  if (!token) {
    return c.json({ error: 'token is required' }, 400)
  }

  // 1. Fast path: direct DB lookup
  const sessionResult = await pool.query(
    `SELECT "userId" FROM "session" WHERE token = $1 AND "expiresAt" > NOW()`,
    [token],
  )

  let userId: string | undefined
  if (sessionResult.rows.length > 0) {
    userId = sessionResult.rows[0].userId
  } else {
    // 2. Fallback: pass through better-auth's get-session to unsign cookie
    const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3001'
    const syntheticReq = new Request(`${baseUrl}/api/auth/get-session`, {
      headers: { Cookie: `better-auth.session_token=${token}` },
    })
    const betterAuthResponse = await auth.handler(syntheticReq)
    const data = await betterAuthResponse.json()
    if (!data?.user?.id) {
      return c.json(null, 200)
    }
    userId = data.user.id
    return c.json({ user: data.user })
  }

  const userResult = await pool.query(
    `SELECT id, email, "isAnonymous" FROM "user" WHERE id = $1`,
    [userId],
  )

  if (userResult.rows.length === 0) {
    return c.json(null, 200)
  }

  const user = userResult.rows[0]
  return c.json({
    user: {
      id: user.id,
      email: user.email,
      isAnonymous: user.isAnonymous,
    },
  })
})

app.post('/api/auth/update-premium', async (c) => {
  const { userId, isPremium, premiumUntil } = await c.req.json<{
    userId: string
    isPremium: boolean
    premiumUntil: string | null
  }>()

  if (!userId) {
    return c.json({ error: 'userId is required' }, 400)
  }

  await pool.query(
    `UPDATE "user" SET "isPremium" = $1, "premiumUntil" = $2, "updatedAt" = NOW() WHERE id = $3`,
    [isPremium, premiumUntil || null, userId],
  )

  return c.json({ success: true })
})

app.all('/api/auth/*', async (c) => {
  return auth.handler(c.req.raw)
})

app.get('/health', (c) => c.text('OK'))

const port = parseInt(process.env.PORT || '3001')

serve({ fetch: app.fetch, port })

console.log(`Auth server running on http://localhost:${port}`)
