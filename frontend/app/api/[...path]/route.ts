import { NextRequest, NextResponse } from 'next/server'

const BACKEND_API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || 'http://127.0.0.1:8000'

async function proxyRequest(req: NextRequest, pathSegments: string[] = []): Promise<NextResponse> {
  if (pathSegments.length === 0) {
    return NextResponse.json({ error: 'API path required' }, { status: 400 })
  }

  const backendPath = pathSegments.join('/')
  const targetUrl = new URL(`${BACKEND_API_BASE}/api/${backendPath}${req.nextUrl.search}`)

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('host', targetUrl.host)

  const fetchOptions: RequestInit = {
    method: req.method,
    headers: requestHeaders,
    redirect: 'manual',
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    fetchOptions.body = await req.text()
  }

  const backendResponse = await fetch(targetUrl.toString(), fetchOptions)

  const responseHeaders = new Headers(backendResponse.headers)
  responseHeaders.set('x-proxy-target', targetUrl.origin)

  const body = await backendResponse.arrayBuffer()
  return new NextResponse(body, {
    status: backendResponse.status,
    headers: responseHeaders,
  })
}

export async function GET(req: NextRequest, context: any) {
  const params = await context?.params;
  return proxyRequest(req, params?.path ?? [])
}

export async function POST(req: NextRequest, context: any) {
  const params = await context?.params;
  return proxyRequest(req, params?.path ?? [])
}

export async function PUT(req: NextRequest, context: any) {
  const params = await context?.params;
  return proxyRequest(req, params?.path ?? [])
}

export async function DELETE(req: NextRequest, context: any) {
  const params = await context?.params;
  return proxyRequest(req, params?.path ?? [])
}

export async function PATCH(req: NextRequest, context: any) {
  const params = await context?.params;
  return proxyRequest(req, params?.path ?? [])
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    },
  })
}
