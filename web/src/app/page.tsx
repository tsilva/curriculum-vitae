import dynamic from "next/dynamic";
import { Hero } from "@/components/Hero";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ScrollRevealProvider } from "@/components/ScrollRevealProvider";

// Lazy load below-the-fold sections to reduce initial bundle size
const Backstory = dynamic(() => import("@/components/Backstory").then((mod) => ({ default: mod.Backstory })), {
  loading: () => <div className="h-32 animate-pulse bg-surface/50" />,
});

const PerksTree = dynamic(() => import("@/components/PerksTree").then((mod) => ({ default: mod.PerksTree })), {
  loading: () => <div className="h-40 animate-pulse bg-surface/50" />,
});

const Experience = dynamic(() => import("@/components/Experience").then((mod) => ({ default: mod.Experience })), {
  loading: () => <div className="h-32 animate-pulse bg-surface/50" />,
});

const Projects = dynamic(() => import("@/components/Projects").then((mod) => ({ default: mod.Projects })), {
  loading: () => <div className="h-32 animate-pulse bg-surface/50" />,
});

const Education = dynamic(() => import("@/components/Education").then((mod) => ({ default: mod.Education })), {
  loading: () => <div className="h-32 animate-pulse bg-surface/50" />,
});

const OpenSource = dynamic(() => import("@/components/OpenSource").then((mod) => ({ default: mod.OpenSource })), {
  loading: () => <div className="h-32 animate-pulse bg-surface/50" />,
});

export default function Home() {
  return (
    <>
      <ScrollRevealProvider>
        <Nav />
        <main>
          <Hero />
          <div className="content-visibility-auto">
            <PerksTree />
          </div>
          <div className="content-visibility-auto">
            <Backstory />
          </div>
          <div className="content-visibility-auto">
            <Experience />
          </div>
          <div className="content-visibility-auto">
            <Projects />
          </div>
          <div className="content-visibility-auto">
            <OpenSource />
          </div>
          <div className="content-visibility-auto">
            <Education />
          </div>
        </main>
        <Footer />
      </ScrollRevealProvider>
    </>
  );
}
