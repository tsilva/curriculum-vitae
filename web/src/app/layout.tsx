import type { Metadata } from "next";
import { Orbitron, Share_Tech_Mono, Fira_Code } from "next/font/google";
import { MatrixRain } from "@/components/MatrixRain";
import * as fs from "fs";
import * as path from "path";
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

// Read manifest to get current data filename for preloading
function getDataManifest() {
  try {
    const manifestPath = path.join(process.cwd(), "public", "cv-data-manifest.json");
    if (fs.existsSync(manifestPath)) {
      const content = fs.readFileSync(manifestPath, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.warn("Could not read cv-data-manifest.json");
  }
  return null;
}

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
        url: "/avatar.jpg",
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
    images: ["/avatar.jpg"],
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
  image: "https://cv.tsilva.eu/avatar.jpg",
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
  const manifest = getDataManifest();
  const dataUrl = manifest?.filename ? `/${manifest.filename}` : "/cv-data.json";
  
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
        
        {/* Critical preconnects - start DNS/TCP/TLS early */}
        <link rel="preconnect" href="https://curriculum-vitae-r2.tsilva.eu" />
        <link rel="dns-prefetch" href="https://curriculum-vitae-r2.tsilva.eu" />
        
        {/* Preload critical fonts - prevent FOIT/FOUT */}
        <link rel="preload" href="/_next/static/media/03f2d74f5e7b171e-s.p.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/_next/static/media/3703c28dcda155b1-s.p.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/_next/static/media/9a4ee768fed045da-s.p.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* Preload critical data - highest priority */}
        <link rel="preload" href={dataUrl} as="fetch" crossOrigin="anonymous" fetchPriority="high" />
        <link rel="prefetch" href={dataUrl} />
        
        {/* Preload avatar image - hero LCP element */}
        <link rel="preload" href="/avatar.jpg" as="image" fetchPriority="high" />
        
        {/* Priority hints for other critical resources */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Inline critical data fetch script - start immediately */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              window.__CV_DATA_URL__ = ${JSON.stringify(dataUrl)};
              // Preload manifest immediately in parallel
              fetch('/cv-data-manifest.json', { 
                cache: 'no-store',
                priority: 'high'
              }).then(r => {
                if (!r.ok) throw new Error('Manifest fetch failed: ' + r.status);
                return r.json();
              }).then(m => {
                window.__CV_MANIFEST__ = m;
                // Preload the actual data file
                return fetch('/' + m.filename, { 
                  cache: 'force-cache',
                  priority: 'high'
                });
              }).then(r => {
                if (!r.ok) throw new Error('Data fetch failed: ' + r.status);
                return r.json();
              }).then(d => {
                window.__CV_DATA__ = d;
                console.log('[CV] Data preloaded successfully');
              }).catch(err => {
                console.error('[CV] Failed to preload data:', err);
                window.__CV_LOAD_ERROR__ = err.message;
              });
              
              // Register service worker for offline caching
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/service-worker.js').catch(function() {});
                });
              }
            })();
          `
        }} />
      </head>
      <body className="font-[family-name:var(--font-body)] dot-grid scanlines crt-vignette antialiased">
        <MatrixRain />
        {children}
      </body>
    </html>
  );
}
