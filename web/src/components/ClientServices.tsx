"use client";

import dynamic from "next/dynamic";

const GoogleAnalytics = dynamic(
  () => import("@/components/GoogleAnalytics").then((mod) => ({ default: mod.GoogleAnalytics })),
  { ssr: false }
);
const SpeedInsights = dynamic(
  () => import("@vercel/speed-insights/next").then((mod) => ({ default: mod.SpeedInsights })),
  { ssr: false }
);

interface ClientServicesProps {
  enableSpeedInsights: boolean;
}

export function ClientServices({ enableSpeedInsights }: ClientServicesProps) {
  return (
    <>
      <GoogleAnalytics />
      {enableSpeedInsights ? <SpeedInsights /> : null}
    </>
  );
}
