import type { Metadata } from "next";
import { Orbitron, Share_Tech_Mono, Fira_Code, Press_Start_2P } from "next/font/google";
import { MatrixRain } from "@/components/MatrixRain";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "tsilva@cv:~$ — Software Engineer",
  description:
    "20+ years of experience, 60+ projects shipped. From ZX Spectrum to Large Language Models.",
  openGraph: {
    title: "tsilva@cv:~$ — Software Engineer",
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
      className={`${orbitron.variable} ${shareTechMono.variable} ${firaCode.variable} ${pressStart2P.variable}`}
    >
      <body className="font-[family-name:var(--font-body)] dot-grid scanlines crt-vignette antialiased">
        <MatrixRain />
        {children}
      </body>
    </html>
  );
}
