import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { LOCALES, DEFAULT_LOCALE } from '@/lib/i18n'

const PROTECTED_PATHS = ['/dashboard', '/profil', '/feed', '/messages', '/matchs', '/recherche']

function getLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (cookieLocale && LOCALES.includes(cookieLocale as never)) return cookieLocale

  const lang = request.headers.get('accept-language')?.split(',')[0]?.slice(0, 2)
  return LOCALES.includes(lang as never) ? lang! : DEFAULT_LOCALE
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
  if (isProtected) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  const locale = getLocale(request)
  const response = NextResponse.next()
  response.headers.set('x-locale', locale)
  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
