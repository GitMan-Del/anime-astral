import { NextRequest, NextResponse } from 'next/server';

// Configurare pentru a specifica rutele care trebuie protejate
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/verfication-cod',
    '/api/verify-code',
    '/api/send-verification-code'
  ],
};

export async function middleware(request: NextRequest) {
  try {
    // Verifică dacă ruta este în lista de protecție
    const protectedPaths = [
      '/dashboard',
      '/verfication-cod',
      '/api/verify-code',
      '/api/send-verification-code',
      '/api/friends'
    ];
    
    const isProtectedPath = protectedPaths.some(path => 
      request.nextUrl.pathname.startsWith(path)
    );
    
    // Dacă ruta nu este protejată, permite accesul
    if (!isProtectedPath) {
      return NextResponse.next();
    }

    // Pentru rutele protejate, verifică dacă există un cookie de sesiune
    const sessionToken = request.cookies.get('next-auth.session-token')?.value || 
                        request.cookies.get('__Secure-next-auth.session-token')?.value;

    if (!sessionToken) {
      // Pentru rutele API, returnează eroare 401
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized - Authentication required' },
          { status: 401 }
        );
      }

      // Pentru paginile web, redirecționează către pagina de înregistrare
      const signupUrl = new URL('/', request.url);
      return NextResponse.redirect(signupUrl);
    }

    // Dacă există un token de sesiune, permite accesul
    // Verificările detaliate vor fi făcute în componentele individuale
    return NextResponse.next();

  } catch (error) {
    console.error('Middleware error:', error);
    
    // În caz de eroare, permite accesul pentru a evita blocarea
    return NextResponse.next();
  }
}
