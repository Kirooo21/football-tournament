import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('admin_session')?.value
  const isLoginPage = request.nextUrl.pathname === '/admin/login'

  if (request.nextUrl.pathname.startsWith('/admin') && !isLoginPage && session !== process.env.ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  if (isLoginPage && session === process.env.ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}