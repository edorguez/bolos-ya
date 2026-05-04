import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { auth } from './auth-config'
import { proxyRequest } from './proxy-handler'

const app = new Hono()

app.use(
  '*',
  cors({
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    credentials: true,
  }),
)

app.all('/api/auth/*', async (c) => {
  return auth.handler(c.req.raw)
})

app.all('/api/proxy/*', async (c) => {
  const path = c.req.path.replace('/api/proxy/', '')
  return proxyRequest(c.req.raw, path)
})

app.get('/health', (c) => c.text('OK'))

const port = parseInt(process.env.PORT || '3001')

serve({ fetch: app.fetch, port })

console.log(`Auth server running on http://localhost:${port}`)
