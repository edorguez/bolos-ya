import { auth } from './auth-config.js'

const GO_BACKEND_URL = process.env.GO_BACKEND_URL || 'http://localhost:8080/api/v1'
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || ''

export async function proxyRequest(request: Request, path: string): Promise<Response> {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const url = `${GO_BACKEND_URL}/${path}`
  const searchParams = new URL(request.url).search
  const targetUrl = url + searchParams

  const headers: Record<string, string> = {
    Authorization: `Bearer ${INTERNAL_API_KEY}`,
    'X-User-ID': session.user.id,
    'X-User-Email': session.user.email,
    'X-Auth-Provider': (session.user.authProvider as string) || 'email',
  }

  const contentType = request.headers.get('Content-Type')
  if (contentType) {
    headers['Content-Type'] = contentType
  }

  let body: BodyInit | null = null
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.text()
  }

  const goResponse = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
  })

  return new Response(goResponse.body, {
    status: goResponse.status,
    statusText: goResponse.statusText,
    headers: goResponse.headers,
  })
}
