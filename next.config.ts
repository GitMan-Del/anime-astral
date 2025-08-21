// next.config.js
/** @type {import('next').NextConfig} */
const isProd = process.env.NEXTAUTH_URL === 'production';

const securityHeaders = [
  // Force HTTPS for 2 years + include subdomains + allow preload.
  // Do NOT send this on localhost/non-HTTPS.
  ...(isProd ? [{
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  }] : []),

  // Stop MIME sniffing.
  { key: 'X-Content-Type-Options', value: 'nosniff' },

  // Clickjacking protection. Prefer CSP frame-ancestors, but this helps older UAs.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },

  // Limit referrers for cross-origin requests.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

  // Lock down powerful APIs.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },

  // Helpful for DNS prefetching where applicable.
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

const csp = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' https: data: blob:;
  font-src 'self' https: data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig = {
  poweredByHeader: false, // remove “X-Powered-By: Next.js”
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          ...securityHeaders,
          // If you don’t use a nonce yet, start with a permissive CSP and tighten later.
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.myanimelist.net",
      },
    ],
    domains: [
      "lh3.googleusercontent.com", // Pentru Google
      "avatars.githubusercontent.com", // Pentru GitHub, dacă folosești
      // Adaugă alte domenii dacă stochezi imagini în Supabase
    ],
  },
};

module.exports = nextConfig;
