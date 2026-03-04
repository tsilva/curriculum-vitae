import { getCVData, getAllTechnologies } from "@/lib/cv-data";
import { Hero } from "@/components/Hero";
import { Experience } from "@/components/Experience";
import { Projects } from "@/components/Projects";
import { Education } from "@/components/Education";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ScrollRevealProvider } from "@/components/ScrollRevealProvider";
import { BootSequence } from "@/components/BootSequence";

export default function Home() {
  const data = getCVData();
  const technologies = getAllTechnologies();

  return (
    <>
      <BootSequence />
      <ScrollRevealProvider>
        <Nav />
        <main>
          <Hero />
          <Experience employers={data.employers} />
          <Projects projects={data.projects} technologies={technologies} />
          <Education entries={data.education} />
        </main>
        <Footer />
      </ScrollRevealProvider>
    </>
  );
}
