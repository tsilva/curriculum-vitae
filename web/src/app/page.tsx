import { getCVData, getAllTechnologies } from "@/lib/cv-data";
import { Hero } from "@/components/Hero";
import { Experience } from "@/components/Experience";
import { Projects } from "@/components/Projects";
import { Education } from "@/components/Education";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ScrollRevealProvider } from "@/components/ScrollRevealProvider";

export default function Home() {
  const data = getCVData();
  const technologies = getAllTechnologies();
  
  // Debug logging
  console.log(`[Build] Total projects: ${data.projects.length}`);
  const withGalleries = data.projects.filter(p => p.gallery && p.gallery.length > 0);
  console.log(`[Build] Projects with galleries: ${withGalleries.length}`);
  console.log(`[Build] Crystal Clash:`, data.projects.find(p => p.id === 'crystal-clash')?.gallery?.length || 'NO GALLERY');

  return (
    <>
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
