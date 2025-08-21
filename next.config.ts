import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 
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

export default nextConfig;
