/**
 * Server-side API proxy — replaces Turbopack's rewrite-based proxy for /api/*
 * requests in development. The browser talks same-origin to localhost:3000,
 * and this Route Handler forwards the request to the PHP backend (127.0.0.1:8000)
 * using Node.js fetch (which is far more reliable than Turbopack's built-in proxy).
 *
 * In production the frontend uses NEXT_PUBLIC_API_URL to talk directly to
 * the backend, so this file is never reached.
 */

import { type NextRequest, NextResponse } from "next/server"

const BACKEND = process.env.PHP_BACKEND_URL ?? "http://127.0.0.1:8000"

/** Headers that must not be forwarded between hops */
const HOP_BY_HOP = new Set([
  "host",
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "upgrade",
  "proxy-authorization",
  "proxy-connection",
])

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  const target = `${BACKEND}/api/${path.join("/")}${req.nextUrl.search}`

  // Handle CORS preflight locally — no need to round-trip to PHP
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": req.headers.get("origin") ?? "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Max-Age": "86400",
      },
    })
  }

  // Forward request headers, stripping hop-by-hop ones
  const fwdHeaders = new Headers()
  req.headers.forEach((v, k) => {
    if (!HOP_BY_HOP.has(k)) fwdHeaders.set(k, v)
  })

  try {
    const init: RequestInit & { duplex?: string } = {
      method: req.method,
      headers: fwdHeaders,
    }

    if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      init.body = req.body
      init.duplex = "half" // required for streaming request body in Node 18+
    }

    const upstream = await fetch(target, init)

    // Read the full body so we return a complete, non-chunked response
    const body = await upstream.arrayBuffer()

    const resHeaders = new Headers()
    upstream.headers.forEach((v, k) => {
      if (!HOP_BY_HOP.has(k)) resHeaders.set(k, v)
    })

    return new NextResponse(body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: resHeaders,
    })
  } catch (err) {
    console.error(`[api-proxy] ${req.method} ${target} failed:`, err)
    return NextResponse.json(
      { success: false, error: "Backend unavailable" },
      { status: 502 },
    )
  }
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
export const OPTIONS = handler

// Only meaningful in development — production uses direct backend URL
export const dynamic = "force-dynamic"
