const BETTER_AUTH_URL = process.env.EXPO_PUBLIC_BETTER_AUTH_URL || 'http://localhost:8081/api/auth'
const GO_BACKEND_URL = process.env.GO_BACKEND_URL || 'http://localhost:8080/api/v1'
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || ''

async function getSession(headers: Headers) {
  try {
    const response = await fetch(`${BETTER_AUTH_URL}/get-session`, { headers })
    if (!response.ok) return null
    return response.json() as Promise<{ user: { id: string; email: string; authProvider?: string } } | null>
  } catch {
    return null
  }
}

async function proxyRequest(request: Request, pathSegments: string[]): Promise<Response> {
  const session = await getSession(request.headers)

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const path = pathSegments.join('/')
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

export async function GET(request: Request, { params }: { params: { route: string[] } }) {
  return proxyRequest(request, params.route)
}

export async function POST(request: Request, { params }: { params: { route: string[] } }) {
  return proxyRequest(request, params.route)
}

export async function PUT(request: Request, { params }: { params: { route: string[] } }) {
  return proxyRequest(request, params.route)
}

export async function PATCH(request: Request, { params }: { params: { route: string[] } }) {
  return proxyRequest(request, params.route)
}

export async function DELETE(request: Request, { params }: { params: { route: string[] } }) {
  return proxyRequest(request, params.route)
}
