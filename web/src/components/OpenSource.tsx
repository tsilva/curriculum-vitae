"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import type { GitHubRepo } from "@/types/cv";
import { RepoCard } from "./RepoCard";
import { FilterBar } from "./FilterBar";

// Import GitHub data - this is generated at build time
import githubRepos from "@/data/github-data.json";

const ITEMS_PER_PAGE = 12;

// Filter out template-* and sandbox-* repos
const filteredGithubRepos = githubRepos.filter(
  repo => !repo.name.startsWith('template-') && !repo.name.startsWith('sandbox-')
);

export function OpenSource() {
  const repos = useMemo(() => filteredGithubRepos as GitHubRepo[], []);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Get unique languages and their counts (mapped to FilterBar's "technologies" format)
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

  // Filter repos by selected languages
  const filteredRepos = useMemo(() => {
    if (selectedLanguages.length === 0) return repos;
    return repos.filter((repo) =>
      selectedLanguages.some((lang) => repo.language === lang)
    );
  }, [repos, selectedLanguages]);

  // Visible repos (for pagination)
  const visibleRepos = useMemo(() => {
    return filteredRepos.slice(0, visibleCount);
  }, [filteredRepos, visibleCount]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [selectedLanguages]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || visibleCount >= filteredRepos.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredRepos.length));
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [visibleCount, filteredRepos.length]);

  const handleLanguageSelect = (lang: string | null) => {
    if (lang === null) {
      setSelectedLanguages([]);
    } else {
      setSelectedLanguages((prev) =>
        prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
      );
    }
  };

  const remainingCount = filteredRepos.length - visibleRepos.length;

  return (
    <section id="opensource" className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-cyan mb-10 reveal neon-glow-cyan">
        <span className="text-magenta">&gt;</span> OPEN_SOURCE
      </h2>

      <FilterBar
        technologies={languages}
        selected={selectedLanguages}
        onSelect={handleLanguageSelect}
        onBrowseAll={() => {}}
      />

      <div className="mt-6 font-[family-name:var(--font-mono)] text-sm text-steel">
        <span className="text-steel-dim">//</span> Displaying {visibleRepos.length}{" "}
        of {repos.length} repositories
        {selectedLanguages.length > 0 && (
          <span className="text-cyan ml-2">
            (matching {selectedLanguages.length} filter
            {selectedLanguages.length > 1 ? "s" : ""})
          </span>
        )}
        {remainingCount > 0 && (
          <span className="text-steel-dim ml-2">
            — {remainingCount} more below
          </span>
        )}
      </div>

      {/* Repo grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8 content-visibility-auto">
        {visibleRepos.map((repo, index) => (
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

      {/* Load more trigger */}
      {remainingCount > 0 && (
        <div 
          ref={loadMoreRef}
          className="mt-8 py-8 text-center"
        >
          <div className="font-[family-name:var(--font-mono)] text-sm text-steel-dim animate-pulse">
            <span className="text-cyan">...</span> Loading more repositories <span className="text-cyan">...</span>
          </div>
        </div>
      )}
    </section>
  );
}
