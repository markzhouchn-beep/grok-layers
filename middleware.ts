import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = new URL(request.url);

  // Admin route protection — redirect to login if not authenticated
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminCookie = request.cookies.get('layers_admin');
    if (adminCookie?.value !== '1') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  const response = NextResponse.next();

  // Priority: 1. URL param (?lang=zh or ?lang=en), 2. Cookie, 3. Accept-Language
  const langParam = new URL(request.url).searchParams.get('lang');
  const langCookie = request.cookies.get('layers_lang');

  let lang: string;
  if (langParam === 'zh' || langParam === 'en') {
    lang = langParam;
  } else if (langCookie?.value === 'zh' || langCookie?.value === 'en') {
    lang = langCookie.value;
  } else {
    const acceptLang = request.headers.get('accept-language') || '';
    lang = acceptLang.toLowerCase().includes('zh') ? 'zh' : 'en';
  }

  // Set cookie so it persists (even across different hostnames like localhost vs LAN IP)
  response.cookies.set('layers_lang', lang, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon|images).*)'],
};
