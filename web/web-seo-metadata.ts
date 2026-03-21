import type { Metadata } from "next";

export const APP_THEME_COLOR = "#00E6E6";

const payload: Omit<Metadata, "metadataBase"> = {
  title: "Tiago Silva | Interactive Cyberpunk CV, AI Engineer & 60+ Projects",
  description:
    "Explore Tiago Silva's interactive cyberpunk CV: 20+ years across AI agents, deep learning, full-stack engineering, Microsoft, Tynker, and 60+ shipped products.",
  keywords: [
    "Tiago Silva",
    "software engineer",
    "AI engineer",
    "AI research engineer",
    "full-stack engineer",
    "interactive CV",
    "cyberpunk portfolio",
    "portfolio",
    "curriculum vitae",
    "resume",
    "TypeScript",
    "Python",
    "React",
    "Next.js",
    "Node.js",
    "LLM",
    "AI agents",
    "deep learning",
    "Tynker",
    "Microsoft",
  ],
  openGraph: {
    title: "Tiago Silva | Interactive Cyberpunk CV, AI Engineer & 60+ Projects",
    description:
      "Explore Tiago Silva's interactive cyberpunk CV: 20+ years across AI agents, deep learning, full-stack engineering, Microsoft, Tynker, and 60+ shipped products.",
    images: [
      {
        url: "/brand/web-seo/og-image-1200x630.png",
        width: 1200,
        height: 630,
        alt: "Tiago Silva interactive cyberpunk CV brand card",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tiago Silva | Interactive Cyberpunk CV, AI Engineer & 60+ Projects",
    description:
      "Explore Tiago Silva's interactive cyberpunk CV: 20+ years across AI agents, deep learning, full-stack engineering, Microsoft, Tynker, and 60+ shipped products.",
    images: ["/brand/web-seo/og-image-1200x630.png"],
  },
  icons: {
    icon: [
      {
        url: "/brand/web-seo/favicon/favicon-16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/brand/web-seo/favicon/favicon-32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/brand/web-seo/favicon/favicon-48.png",
        sizes: "48x48",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/brand/web-seo/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: ["/brand/web-seo/favicon/favicon.ico"],
  },
  manifest: "/brand/web-seo/site.webmanifest",
};

export function createMetadata(metadataBase: URL): Metadata {
  return {
    metadataBase,
    ...payload,
  };
}

export default createMetadata;
