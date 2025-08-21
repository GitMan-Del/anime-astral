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
  subsets: ["devanagari"],
  weight: "400"
});

export const metadata: Metadata = {
  title: "Anime Astral - website.",
  description: "Un anime website unde sa te poti unita la animeurile tale preferate alaturi de prietenii tai.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
