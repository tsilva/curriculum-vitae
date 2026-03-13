import type { Metadata } from "next";
import { Orbitron, Share_Tech_Mono, Fira_Code } from "next/font/google";
import dynamic from "next/dynamic";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import "./globals.css";

const SITE_URL = "https://www.tsilva.eu";
const SITE_TITLE = "Tiago Silva | Full-Stack Software Engineer with AI Skills";
const SITE_DESCRIPTION =
  "Full-stack software engineer with 20+ years of experience building backend, frontend, mobile, and AI products. Python, TypeScript, React, Next.js, Node.js, LLMs, and cloud architecture.";

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
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: [
    "software engineer",
    "fullstack software engineer",
    "full-stack developer",
    "full stack engineer",
    "AI software engineer",
    "Python developer",
    "TypeScript developer",
    "React developer",
    "Next.js developer",
    "Node.js developer",
    "AI engineer",
    "LLM engineer",
    "AI agents",
    "machine learning engineer",
    "cloud architecture",
    "senior developer",
    "20 years experience",
    "Tiago Silva",
  ],
  authors: [{ name: "Tiago Silva" }],
  creator: "Tiago Silva",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_TITLE,
    description:
      "20+ years building backend, frontend, mobile, and AI products. CV, projects, open source, and experience.",
    type: "website",
    url: SITE_URL,
    siteName: "Tiago Silva",
    locale: "en_US",
    images: [
      {
        url: "/avatar.webp",
        width: 144,
        height: 144,
        alt: "Tiago Silva - Software Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description:
      "Full-stack software engineer with AI skills. Python, TypeScript, React, Node.js, LLMs, and cloud architecture.",
    creator: "@tiagosilva",
    images: ["/avatar.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Tiago Silva",
    url: SITE_URL,
    description: SITE_DESCRIPTION,
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Tiago Silva",
    jobTitle: "Full-Stack Software Engineer",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    image: `${SITE_URL}/avatar.webp`,
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
        <GoogleAnalytics />
        <MatrixRain />
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
