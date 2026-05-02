export async function GET(request: Request) {
  const { auth } = await import('../../../lib/auth-server')
  return auth.handler(request)
}

export async function POST(request: Request) {
  const { auth } = await import('../../../lib/auth-server')
  return auth.handler(request)
}
