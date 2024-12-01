import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

const locales = ['en', 'lv'];

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en'
});

export default function middleware(req: NextRequest) {
  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};