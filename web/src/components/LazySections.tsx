"use client";

import dynamic from "next/dynamic";

const Projects = dynamic(
  () => import("@/components/Projects").then((mod) => ({ default: mod.Projects })),
  {
    ssr: false,
    loading: () => <div className="h-32 animate-pulse bg-surface/50" />,
  }
);

const Education = dynamic(
  () => import("@/components/Education").then((mod) => ({ default: mod.Education })),
  {
    ssr: false,
    loading: () => <div className="h-32 animate-pulse bg-surface/50" />,
  }
);

const OpenSource = dynamic(
  () => import("@/components/OpenSource").then((mod) => ({ default: mod.OpenSource })),
  {
    ssr: false,
    loading: () => <div className="h-32 animate-pulse bg-surface/50" />,
  }
);

const MainGallery = dynamic(
  () => import("@/components/MainGallery").then((mod) => ({ default: mod.MainGallery })),
  {
    ssr: false,
    loading: () => <div className="h-32 animate-pulse bg-surface/50" />,
  }
);

export function LazySections() {
  return (
    <>
      <div className="content-visibility-auto">
        <Projects />
      </div>
      <div className="content-visibility-auto">
        <MainGallery />
      </div>
      <div className="content-visibility-auto">
        <OpenSource />
      </div>
      <div className="content-visibility-auto">
        <Education />
      </div>
    </>
  );
}
