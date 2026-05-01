import githubRepos from "@/data/github-data.json";
import { cvData } from "@/lib/cv-data";
import { Hero } from "@/components/Hero";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Backstory } from "@/components/Backstory";
import { Experience } from "@/components/Experience";
import { LazySections } from "@/components/LazySections";
import { ScrollRevealProvider } from "@/components/ScrollRevealProvider";

const publicGithubRepos = githubRepos.filter(
  (repo) => !repo.name.startsWith("template-") && !repo.name.startsWith("sandbox-")
);
const ossCount = publicGithubRepos.length;
const relatedSites = publicGithubRepos.filter(
  (repo) =>
    repo.homepageUrl &&
    repo.homepageUrl.endsWith(".tsilva.eu") &&
    repo.homepageUrl !== "https://www.tsilva.eu"
);

export default function Home() {
  return (
    <>
      <ScrollRevealProvider>
        <Nav />
        <main>
          <Hero ossCount={ossCount} />
          <div className="content-visibility-auto">
            <Backstory tldr={cvData.tldr} />
          </div>
          <div className="content-visibility-auto">
            <Experience employers={cvData.employers} />
          </div>
          <aside aria-label="RELATED_SITES" className="sr-only">
            <h2>RELATED_SITES</h2>
            <ul>
              {relatedSites.map((repo) => (
                <li key={repo.id}>
                  <a href={repo.homepageUrl ?? undefined}>{repo.name}</a>
                </li>
              ))}
            </ul>
          </aside>
          <LazySections />
        </main>
        <Footer />
      </ScrollRevealProvider>
    </>
  );
}
