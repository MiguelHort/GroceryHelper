import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// NextAuth v5 sets cookies named 'authjs.session-token' (dev) or '__Secure-authjs.session-token' (prod)
function getSessionToken(request: NextRequest): string | undefined {
  return (
    request.cookies.get('authjs.session-token')?.value ||
    request.cookies.get('__Secure-authjs.session-token')?.value
  )
}

export async function proxy(request: NextRequest) {
  const sessionToken = getSessionToken(request)
  const isLoggedIn = !!sessionToken

  const pathname = request.nextUrl.pathname

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password'

  const isApiAuthRoute = pathname.startsWith('/api/auth')

  if (isApiAuthRoute) {
    return NextResponse.next()
  }

  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
