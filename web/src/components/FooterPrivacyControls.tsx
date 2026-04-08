"use client";

import dynamic from "next/dynamic";

const PrivacyControls = dynamic(
  () => import("./PrivacyControls").then((mod) => ({ default: mod.PrivacyControls })),
  { ssr: false }
);

export function FooterPrivacyControls() {
  return <PrivacyControls />;
}
