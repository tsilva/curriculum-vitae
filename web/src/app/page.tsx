import { Hero } from "@/components/Hero";
import { Backstory } from "@/components/Backstory";
import { Experience } from "@/components/Experience";
import { Projects } from "@/components/Projects";
import { Education } from "@/components/Education";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ScrollRevealProvider } from "@/components/ScrollRevealProvider";

export default function Home() {
  return (
    <>
      <ScrollRevealProvider>
        <Nav />
        <main>
          <Hero />
          <Backstory />
          <Experience />
          <Projects />
          <Education />
        </main>
        <Footer />
      </ScrollRevealProvider>
    </>
  );
}
