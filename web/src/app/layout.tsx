import type { Metadata } from "next";
import { Orbitron, Share_Tech_Mono, Fira_Code } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Tiago Silva — Software Engineer | 20+ Years Experience",
  description:
    "Senior software engineer with 20+ years of experience and 60+ projects shipped. Expertise in Python, JavaScript, AI/ML, cloud architecture, and full-stack development.",
  keywords: [
    "software engineer",
    "full-stack developer",
    "Python developer",
    "JavaScript developer",
    "AI engineer",
    "machine learning",
    "cloud architecture",
    "senior developer",
    "20 years experience",
    "Tiago Silva",
  ],
  authors: [{ name: "Tiago Silva" }],
  creator: "Tiago Silva",
  metadataBase: new URL("https://cv.tsilva.eu"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Tiago Silva — Software Engineer",
    description:
      "20+ years of experience, 60+ projects shipped. From ZX Spectrum to Large Language Models.",
    type: "website",
    url: "https://cv.tsilva.eu",
    siteName: "Tiago Silva CV",
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
    title: "Tiago Silva — Software Engineer",
    description:
      "20+ years of experience, 60+ projects shipped. Expertise in Python, AI/ML, and full-stack development.",
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
  verification: {
    google: "your-google-verification-code",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Tiago Silva",
  jobTitle: "Software Engineer",
  description: "Senior software engineer with 20+ years of experience and 60+ projects shipped",
  url: "https://cv.tsilva.eu",
  image: "https://cv.tsilva.eu/avatar.webp",
  sameAs: [
    "https://github.com/tsilva",
    "https://www.linkedin.com/in/engtiagosilva/",
    "https://x.com/tiagosilva",
    "https://photos.app.goo.gl/QQkFqqXiNBvnRaZm6",
  ],
  knowsAbout: [
    "Python",
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "AI",
    "Machine Learning",
    "Cloud Architecture",
    "Full-Stack Development",
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
};

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
        <link rel="preconnect" href="https://curriculum-vitae-r2.tsilva.eu" />
        <link rel="dns-prefetch" href="https://curriculum-vitae-r2.tsilva.eu" />
        
        {/* Preload critical fonts */}
        <link rel="preload" href="/_next/static/media/03f2d74f5e7b171e-s.p.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/_next/static/media/3703c28dcda155b1-s.p.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/_next/static/media/9a4ee768fed045da-s.p.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* Preload avatar image */}
        <link rel="preload" href="/avatar.webp" as="image" fetchPriority="high" />
      </head>
      <body className="font-[family-name:var(--font-body)] dot-grid scanlines crt-vignette antialiased">
        <MatrixRain />
        {children}
      </body>
    </html>
  );
}
