"use client";

import { useMemo, useState } from "react";
import type { GitHubRepo } from "@/types/cv";
import { RepoCard } from "./RepoCard";

// Import GitHub data - this is generated at build time
import githubRepos from "@/data/github-data.json";

const ITEMS_PER_PAGE = 12;

export function OpenSource() {
  const repos = useMemo(() => githubRepos as GitHubRepo[], []);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Get unique languages and their counts
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

  // Filter repos by selected language
  const filteredRepos = useMemo(() => {
    if (!selectedLanguage) return repos;
    return repos.filter((repo) => repo.language === selectedLanguage);
  }, [repos, selectedLanguage]);

  // Visible repos (for pagination)
  const visibleRepos = useMemo(() => {
    return filteredRepos.slice(0, visibleCount);
  }, [filteredRepos, visibleCount]);

  const handleLanguageClick = (lang: string) => {
    setSelectedLanguage((current) => (current === lang ? null : lang));
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredRepos.length));
  };

  const remainingCount = filteredRepos.length - visibleRepos.length;
  const totalStars = repos.reduce((sum, repo) => sum + repo.stars, 0);

  return (
    <section id="opensource" className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-cyan mb-6 reveal neon-glow-cyan">
        <span className="text-magenta">&gt;</span> OPEN_SOURCE
      </h2>

      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-4 mb-6 font-[family-name:var(--font-mono)] text-sm">
        <div className="bg-surface/50 border border-cyan/20 px-3 py-1.5 rounded-sm">
          <span className="text-steel-dim">//</span>{" "}
          <span className="text-cool-white">{repos.length}</span>{" "}
          <span className="text-steel">repos</span>
        </div>
        <div className="bg-surface/50 border border-cyan/20 px-3 py-1.5 rounded-sm">
          <span className="text-steel-dim">//</span>{" "}
          <span className="text-yellow-400">★</span>{" "}
          <span className="text-cool-white">{totalStars}</span>{" "}
          <span className="text-steel">total stars</span>
        </div>
        <div className="bg-surface/50 border border-cyan/20 px-3 py-1.5 rounded-sm">
          <span className="text-steel-dim">//</span>{" "}
          <span className="text-cool-white">{languages.length}</span>{" "}
          <span className="text-steel">languages</span>
        </div>
      </div>

      {/* Language filter */}
      {languages.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-[family-name:var(--font-mono)] text-steel-dim mr-2">
              FILTER_BY_LANG:
            </span>
            {languages.map((lang) => (
              <button
                key={lang.name}
                onClick={() => handleLanguageClick(lang.name)}
                className={`text-xs font-[family-name:var(--font-mono)] px-2 py-1 rounded-sm transition-all ${
                  selectedLanguage === lang.name
                    ? "bg-cyan/20 text-cyan border border-cyan/40"
                    : "bg-surface border border-cyan/10 text-steel hover:border-cyan/30 hover:text-cyan"
                }`}
              >
                {lang.name} <span className="text-steel-dim">({lang.count})</span>
              </button>
            ))}
            {selectedLanguage && (
              <button
                onClick={() => {
                  setSelectedLanguage(null);
                  setVisibleCount(ITEMS_PER_PAGE);
                }}
                className="text-xs font-[family-name:var(--font-mono)] text-steel-dim hover:text-cyan transition-colors ml-2"
              >
                [clear]
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="mb-6 font-[family-name:var(--font-mono)] text-sm text-steel">
        <span className="text-steel-dim">//</span> Displaying {visibleRepos.length}{" "}
        of {filteredRepos.length} repositories
        {selectedLanguage && (
          <span className="text-cyan ml-2">(filtered by {selectedLanguage})</span>
        )}
      </div>

      {/* Repo grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleRepos.map((repo, index) => (
          <div
            key={repo.id}
            className="h-full contain-layout"
            style={{
              animation: `stagger-fade-in 0.4s ease-out ${index * 0.04}s both`,
            }}
          >
            <RepoCard repo={repo} />
          </div>
        ))}
      </div>

      {/* Load more button */}
      {remainingCount > 0 && (
        <div className="mt-10 text-center">
          <button
            onClick={handleShowMore}
            className="font-[family-name:var(--font-mono)] text-sm text-steel hover:text-cyan transition-colors px-6 py-3 border border-cyan/20 hover:border-cyan/40 rounded-sm bg-surface/50 hover:bg-surface"
          >
            <span className="text-cyan">...</span> Show {Math.min(remainingCount, ITEMS_PER_PAGE)} more repositories{" "}
            <span className="text-cyan">...</span>
          </button>
          <div className="mt-2 text-xs font-[family-name:var(--font-mono)] text-steel-dim">
            {remainingCount} remaining
          </div>
        </div>
      )}
    </section>
  );
}
