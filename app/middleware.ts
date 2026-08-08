import { NextRequest, NextResponse } from 'next/server';

// المسارات العامة فقط — أي حاجة تانية محمية افتراضيًا
const publicPaths = ['/login'];

function isPublicPath(pathname: string): boolean {
  return publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  const isPublic = isPublicPath(pathname);

  // مفيش توكن ومحاول يدخل صفحة محمية → رجّعه للوجن
  if (!isPublic && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // فيه توكن ومحاول يدخل صفحة اللوجن → رجّعه للداشبورد
  if (isPublic && token && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};