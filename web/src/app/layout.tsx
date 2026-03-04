import type { Metadata } from "next";
import { Syne, Literata, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const literata = Literata({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tiago Silva — Software Engineer",
  description:
    "20+ years of experience, 60+ projects shipped. From ZX Spectrum to Large Language Models.",
  openGraph: {
    title: "Tiago Silva — Software Engineer",
    description:
      "20+ years of experience, 60+ projects shipped. From ZX Spectrum to Large Language Models.",
    type: "website",
    url: "https://cv.tsilva.eu",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${literata.variable} ${ibmPlexMono.variable}`}
    >
      <body className="font-[family-name:var(--font-body)] dot-grid scanlines antialiased">
        {children}
      </body>
    </html>
  );
}
