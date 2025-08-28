// Middleware pentru NextAuth - gestionează sesiunile și autentificarea
// Nu protejează rutele, doar menține sesiunile active
export { auth as middleware } from "./auth"

// Configurare pentru a specifica că acest middleware se aplică doar la rutele publice
export const config = {
  matcher: [
    // Include doar rutele publice (nu API-urile protejate)
    '/((?!api/verify-code|api/send-verification-code).*)',
    "/api/:path*",
  ],
};