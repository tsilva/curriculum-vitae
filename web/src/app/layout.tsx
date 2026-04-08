import type { Metadata, Viewport } from "next";
import { Orbitron, Share_Tech_Mono, Fira_Code } from "next/font/google";
import dynamic from "next/dynamic";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AnalyticsConsent } from "@/components/AnalyticsConsent";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { siteUrl } from "@/lib/site-config";
import {
  APP_THEME_COLOR,
  createMetadata,
  SITE_DESCRIPTION,
  SITE_TITLE,
} from "../../web-seo-metadata";
import "./globals.css";

const ENABLE_SPEED_INSIGHTS = process.env.VERCEL === "1";
const generatedMetadata = createMetadata(new URL(siteUrl));
const generatedOpenGraph = (generatedMetadata.openGraph ?? {}) as NonNullable<Metadata["openGraph"]>;
const generatedTwitter = (generatedMetadata.twitter ?? {}) as NonNullable<Metadata["twitter"]>;

// Lazy load MatrixRain as it's a non-critical visual effect
const MatrixRain = dynamic(() => import("@/components/MatrixRain").then((mod) => ({ default: mod.MatrixRain })));

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  preload: true,
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  ...generatedMetadata,
  authors: [{ name: "Tiago Silva" }],
  creator: "Tiago Silva",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    ...generatedOpenGraph,
    type: "website",
    url: siteUrl,
    siteName: "Tiago Silva",
    locale: "en_US",
  },
  twitter: {
    ...generatedTwitter,
    creator: "@tiagosilva",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport: Viewport = {
  themeColor: APP_THEME_COLOR,
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_TITLE,
    alternateName: "Tiago Silva",
    url: siteUrl,
    description: SITE_DESCRIPTION,
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Tiago Silva",
    jobTitle: "AI-Powered Fullstack Software Engineer",
    description: SITE_DESCRIPTION,
    url: siteUrl,
    image: `${siteUrl}/avatar.webp`,
    sameAs: [
      "https://github.com/tsilva",
      "https://www.linkedin.com/in/engtiagosilva/",
      "https://huggingface.co/tsilva",
      "https://x.com/tiagosilva",
      "https://photos.app.goo.gl/QQkFqqXiNBvnRaZm6",
    ],
    knowsAbout: [
      "Python",
      "TypeScript",
      "JavaScript",
      "React",
      "Next.js",
      "Node.js",
      "Full-Stack Development",
      "Artificial Intelligence",
      "Large Language Models",
      "AI Agents",
      "Machine Learning",
      "Cloud Architecture",
      "PostgreSQL",
      "MongoDB",
      "Docker",
      "Kubernetes",
      "AWS",
      "Google Cloud",
    ],
    worksFor: {
      "@type": "Organization",
      name: "Freelance",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lisbon",
      addressCountry: "PT",
    },
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${shareTechMono.variable} ${firaCode.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Preconnect for R2 CDN */}
        <link rel="preconnect" href="https://curriculum-vitae-r2.tsilva.eu" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://curriculum-vitae-r2.tsilva.eu" />

        {/* Preload LCP image */}
        <link rel="preload" href="/avatar.webp" as="image" type="image/webp" />
      </head>
      <body className="font-[family-name:var(--font-body)] dot-grid scanlines crt-vignette antialiased">
        <AnalyticsConsent />
        <GoogleAnalytics />
        <MatrixRain />
        {children}
        {ENABLE_SPEED_INSIGHTS ? <SpeedInsights /> : null}
      </body>
    </html>
  );
}
