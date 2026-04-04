import { NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|assets|scripts|styles).*)',
  ],
};

export default function middleware(req) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host');

  if (hostname && hostname.includes('events.parkconscious.in')) {
    // Rewrite to the Events folder
    // Note: React builds into the index.html
    if (url.pathname === '/') {
       // We serve the events.html as a fallback or index.html from React build
       url.pathname = '/Events/index.html';
    } else if (!url.pathname.startsWith('/Events')) {
       url.pathname = `/Events${url.pathname}`;
    }
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
