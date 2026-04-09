import githubRepos from "@/data/github-data.json";
import { cvData } from "@/lib/cv-data";
import { getNormalizedTsilvaEuUrl } from "@/lib/url-utils";
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
const relatedSites = Array.from(
  publicGithubRepos.reduce((sites, repo) => {
    const url = getNormalizedTsilvaEuUrl(repo.homepageUrl);
    if (url && !sites.has(url)) {
      sites.set(url, { name: repo.name, url });
    }
    return sites;
  }, new Map<string, { name: string; url: string }>())
).map(([, site]) => site);

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
          <LazySections />
          {relatedSites.length > 0 && (
            <section id="related-sites" className="max-w-6xl mx-auto px-6 py-20">
              <div className="border border-magenta/20 bg-surface/60 rounded-sm p-6 md:p-8 shadow-[0_0_20px_rgba(255,0,170,0.08)]">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-[family-name:var(--font-display)] text-3xl text-magenta">
                    +
                  </span>
                  <div>
                    <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold text-magenta">
                      RELATED_SITES
                    </h2>
                    <p className="font-[family-name:var(--font-mono)] text-sm text-steel mt-2">
                      Crawlable links to live projects hosted on <span className="text-cyan">tsilva.eu</span> subdomains.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                  {relatedSites.map((site) => (
                    <a
                      key={site.url}
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-4 rounded-sm border border-cyan/20 bg-base/60 px-4 py-3 transition-colors hover:border-cyan/40 hover:bg-base-light/80"
                    >
                      <div className="min-w-0">
                        <div className="font-[family-name:var(--font-display)] text-sm text-cool-white group-hover:text-cyan transition-colors truncate">
                          {site.name}
                        </div>
                        <div className="font-[family-name:var(--font-mono)] text-xs text-steel truncate">
                          {site.url}
                        </div>
                      </div>
                      <span className="font-[family-name:var(--font-mono)] text-xs text-cyan flex-shrink-0">
                        OPEN
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>
        <Footer />
      </ScrollRevealProvider>
    </>
  );
}
