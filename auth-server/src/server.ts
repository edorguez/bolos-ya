import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { auth, pool } from './auth-config.js'

// Static HTML pages served by dedicated routes. Kept out of the source so no
// markup is hardcoded in code. Resolved from the `public/` folder next to
// `src/` (dev) / `dist/` (build) and read once at startup.
const publicDir = fileURLToPath(new URL('../public', import.meta.url))

const pages = {
  resetPassword: readFileSync(`${publicDir}/reset-password.html`, 'utf8'),
  resetPasswordInvalid: readFileSync(`${publicDir}/reset-password-invalid.html`, 'utf8'),
  expoAuthProxy: readFileSync(`${publicDir}/expo-auth-proxy.html`, 'utf8'),
}

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
    `SELECT id, email, name, "isAnonymous", role FROM "user" WHERE id = $1`,
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
      name: user.name,
      isAnonymous: user.isAnonymous,
      role: user.role,
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

// Expo OAuth authorization proxy — returns HTML with client-side redirect
// instead of HTTP 302 because ASWebAuthenticationSession on iOS doesn't
// follow 302 redirects from HTTP to HTTPS, causing a blank page.
app.get('/api/auth/expo-authorization-proxy', async (c) => {
  const authorizationURL = c.req.query('authorizationURL')

  if (!authorizationURL) {
    return c.json({ error: 'authorizationURL is required' }, 400)
  }

  // Forward to Better Auth's built-in proxy to set OAuth state cookies
  const reqUrl = new URL(c.req.url)
  const syntheticReq = new Request(reqUrl, { method: 'GET', headers: c.req.raw.headers })
  const authResponse = await auth.handler(syntheticReq)

  if (authResponse.status !== 302) {
    return authResponse
  }

  // Collect Set-Cookie headers from Better Auth
  const setCookies: string[] = []
  const rawSetCookie = authResponse.headers.getSetCookie?.()
  if (rawSetCookie) {
    setCookies.push(...rawSetCookie)
  } else {
    const sc = authResponse.headers.get('set-cookie')
    if (sc) setCookies.push(sc)
  }

  // 1s delay before redirect ensures cookies are committed before navigation
  const headers = new Headers()
  headers.set('Content-Type', 'text/html; charset=utf-8')
  for (const cookie of setCookies) {
    headers.append('Set-Cookie', cookie)
  }

  return new Response(pages.expoAuthProxy, { status: 200, headers })
})

// Password reset deep-link redirect. Email clients (Gmail) block custom URL
// schemes, so the email link is an https URL that jumps into the app here.
app.get('/reset-password', (c) => {
  const token = c.req.query('token') || ''

  if (!token) {
    return c.html(pages.resetPasswordInvalid, 400)
  }

  return c.html(pages.resetPassword)
})

app.all('/api/auth/*', async (c) => {
  const req = c.req.raw

  // better-auth/better-call throws "Unexpected end of JSON input" on POSTs
  // with Content-Type: application/json but an empty body (e.g. anonymous
  // sign-in, sign-out). Normalize those to an empty JSON object.
  if (req.method === 'POST' && (req.headers.get('content-type') || '').includes('application/json')) {
    const rawBody = await req.clone().text()
    if (!rawBody.trim()) {
      const headers = new Headers(req.headers)
      headers.delete('content-length')
      return auth.handler(new Request(req.url, { method: req.method, headers, body: '{}' }))
    }
  }

  return auth.handler(req)
})

app.get('/health', (c) => c.text('OK'))

const port = parseInt(process.env.PORT || '3001')

serve({ fetch: app.fetch, port })

console.log(`Auth server running on http://localhost:${port}`)
