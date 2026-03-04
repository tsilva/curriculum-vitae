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
    icon: "/avatar.jpg",
    shortcut: "/avatar.jpg",
    apple: "/avatar.jpg",
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
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${shareTechMono.variable} ${firaCode.variable} ${pressStart2P.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-[family-name:var(--font-body)] dot-grid scanlines crt-vignette antialiased">
        <MatrixRain />
        {children}
      </body>
    </html>
  );
}
