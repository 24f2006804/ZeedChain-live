import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the wallet is connected by looking for a wallet address in the session
  const hasWallet = request.cookies.get('wallet_address')
  
  // Protected routes that require web3 connectivity
  const protectedPaths = [
    '/explore/[project]/invest',
    '/dashboard/investor',
    '/dashboard/founder'
  ]

  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.includes(path.replace('[project]', ''))
  )

  if (isProtectedPath && !hasWallet) {
    // Redirect to home page with a return URL
    const returnUrl = encodeURIComponent(request.nextUrl.pathname)
    return NextResponse.redirect(new URL(`/?returnUrl=${returnUrl}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/explore/:path*/invest',
    '/dashboard/:path*'
  ]
}