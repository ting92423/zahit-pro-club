import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function requireAuth(req: NextRequest, loginPath: string) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = loginPath;
    url.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return null;
}

function requireRole(req: NextRequest, role: string, loginPath: string) {
  const redirect = requireAuth(req, loginPath);
  if (redirect) return redirect;
  const authRole = req.cookies.get('auth_role')?.value;
  if (authRole !== role) {
    const url = req.nextUrl.clone();
    url.pathname = loginPath;
    url.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return null;
}

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // 1. Capture sales_code if present in URL
  const salesCode = searchParams.get('sales_code');
  let response = NextResponse.next();

  if (pathname.startsWith('/admin/login')) {
    // skip auth
  } else if (pathname.startsWith('/admin')) {
    const redirect = requireRole(req, 'ADMIN', '/admin/login');
    if (redirect) response = redirect;
  } else if (pathname.startsWith('/staff')) {
    const redirect = requireRole(req, 'STAFF', '/login');
    if (redirect) response = redirect;
  } else if (pathname.startsWith('/sales')) {
    const redirect = requireRole(req, 'SALES', '/login');
    if (redirect) response = redirect;
  } else if (pathname.startsWith('/me')) {
    const redirect = requireRole(req, 'MEMBER', '/login');
    if (redirect) response = redirect;
  }

  if (salesCode) {
    // PRD: last-touch, 7 days TTL
    response.cookies.set('sales_code', salesCode, {
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

