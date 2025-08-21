import type { Metadata } from "next";
import { Poppins, Protest_Strike } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const protest_strike = Protest_Strike({
  variable: "--font-protest-strike",
  subsets: ["latin"],
  weight: "400"
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin", "devanagari"],
  weight: "400"
});

export const metadata: Metadata = {
  title: "Anime Astral - Website Anime România",
  description:
    "Anime Astral este un website anime din România unde poți urmări anime-urile tale preferate alături de prieteni. Descoperă recomandări, recenzii și comunitatea anime din România.",
  keywords: [
    "anime",
    "anime România",
    "anime online",
    "anime streaming",
    "anime recomandate",
    "anime prieteni",
    "anime astral",
    "comunitate anime",
    "recenzii anime",
    "website anime"
  ],
  authors: [{ name: "Anime Astral", url: "https://anime-astral.vercel.app" }],
  creator: "Anime Astral",
  openGraph: {
    title: "Anime Astral - Website Anime România",
    description:
      "Urmărește anime-uri online, descoperă recomandări și alătură-te comunității anime din România pe Anime Astral.",
    url: "https://anime-astral.vercel.app",
    siteName: "Anime Astral",
    locale: "ro_RO",
    type: "website",
    images: [
      {
        url: "/OgImage.png",
        width: 1200,
        height: 600,
        alt: "Anime Astral - Website Anime România"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Anime Astral - Website Anime România",
    description:
      "Urmărește anime-uri online, descoperă recomandări și alătură-te comunității anime din România pe Anime Astral.",
    images: ["/OgImage.png"]
  },
  metadataBase: new URL("https://anime-astral.vercel.app"),
  alternates: {
    canonical: "https://anime-astral.vercel.app",
    languages: {
      "ro": "https://anime-astral.vercel.app"
    }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <head>
        <meta name="robots" content="index, follow" />
        <meta name="geo.region" content="RO" />
        <meta name="geo.placename" content="România" />
        <meta name="geo.position" content="45.9432;24.9668" />
        <meta name="ICBM" content="45.9432, 24.9668" />
      </head>
      <body
        className={`${protest_strike.variable} ${poppins.variable} antialiased`}
      >
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
