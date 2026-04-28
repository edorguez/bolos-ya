import { auth } from '../../../lib/auth-server'

const handler = auth.handler

export async function GET(request: Request) {
  return handler(request)
}

export async function POST(request: Request) {
  return handler(request)
}
