"use client";

import { useMemo, useState } from "react";
import type { GitHubRepo } from "@/types/cv";
import { RepoCard } from "./RepoCard";
import { FilterBar } from "./FilterBar";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

// Import GitHub data - this is generated at build time
import githubRepos from "@/data/github-data.json";

// Filter out template-* and sandbox-* repos
const filteredGithubRepos = githubRepos.filter(
  repo => !repo.name.startsWith('template-') && !repo.name.startsWith('sandbox-')
);

export function OpenSource() {
  const repos = useMemo(() => filteredGithubRepos as GitHubRepo[], []);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const languages = useMemo(() => {
    const langMap: Record<string, number> = {};
    for (const repo of repos) {
      if (repo.language) {
        langMap[repo.language] = (langMap[repo.language] || 0) + 1;
      }
    }
    return Object.entries(langMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [repos]);

  const filteredRepos = useMemo(() => {
    if (selectedLanguages.length === 0) return repos;
    return repos.filter((repo) =>
      selectedLanguages.some((lang) => repo.language === lang)
    );
  }, [repos, selectedLanguages]);

  const { visible, remaining, loadMoreRef, ITEMS_PER_PAGE } = useInfiniteScroll(filteredRepos, [selectedLanguages]);

  const handleLanguageSelect = (lang: string | null) => {
    if (lang === null) {
      setSelectedLanguages([]);
    } else {
      setSelectedLanguages((prev) =>
        prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
      );
    }
  };

  return (
    <section id="opensource" className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-cyan mb-10 reveal neon-glow-cyan">
        <span className="text-magenta">&gt;</span> OPEN_SOURCE
      </h2>

      <FilterBar
        technologies={languages}
        selected={selectedLanguages}
        onSelect={handleLanguageSelect}
      />

      <div className="mt-6 font-[family-name:var(--font-mono)] text-sm text-steel">
        <span className="text-steel-dim">{"//"}</span> Displaying {visible.length}{" "}
        of {repos.length} repositories
        {selectedLanguages.length > 0 && (
          <span className="text-cyan ml-2">
            (matching {selectedLanguages.length} filter
            {selectedLanguages.length > 1 ? "s" : ""})
          </span>
        )}
        {remaining > 0 && (
          <span className="text-steel-dim ml-2">
            — {remaining} more below
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8 content-visibility-auto">
        {visible.map((repo, index) => (
          <div
            key={repo.id}
            className="h-full contain-layout"
            style={{
              animation: index < ITEMS_PER_PAGE
                ? `stagger-fade-in 0.4s ease-out ${index * 0.04}s both`
                : undefined,
            }}
          >
            <RepoCard repo={repo} />
          </div>
        ))}
      </div>

      {remaining > 0 && (
        <div ref={loadMoreRef} className="mt-8 py-8 text-center">
          <div className="font-[family-name:var(--font-mono)] text-sm text-steel-dim animate-pulse">
            <span className="text-cyan">...</span> Loading more repositories <span className="text-cyan">...</span>
          </div>
        </div>
      )}
    </section>
  );
}
