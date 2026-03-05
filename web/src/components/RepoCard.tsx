import type { GitHubRepo } from "@/types/cv";

interface RepoCardProps {
  repo: GitHubRepo;
}

export function RepoCard({ repo }: RepoCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "today";
    if (diffInDays === 1) return "yesterday";
    if (diffInDays < 30) return `${diffInDays} days ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  // Language colors mapping
  const languageColors: Record<string, string> = {
    "Python": "#FFD43B",
    "TypeScript": "#3178C6",
    "JavaScript": "#F7DF1E",
    "Shell": "#89E051",
    "Rust": "#DEA584",
    "Go": "#00ADD8",
    "Ruby": "#CC342D",
    "Jupyter Notebook": "#DA5B0B",
    "HTML": "#E34C26",
    "CSS": "#563D7C",
    "Dockerfile": "#384D54",
    "Assembly": "#6E4C13",
    "C": "#A8B9CC",
    "C++": "#F34B7D",
  };

  const languageColor = repo.language ? (languageColors[repo.language] || "#00FFF0") : null;

  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card-glow bg-surface border border-cyan/20 rounded-sm p-5 transition-all hover:border-cyan/40 hover:shadow-[0_0_20px_rgba(0,230,230,0.1),0_0_40px_rgba(0,230,230,0.05)] group flex flex-col relative h-full"
    >
      {/* Corner bracket decorations */}
      <span className="absolute top-2 left-2 text-cyan/30 font-[family-name:var(--font-mono)] text-xs select-none">&#x250C;&#x2500;</span>
      <span className="absolute top-2 right-2 text-cyan/30 font-[family-name:var(--font-mono)] text-xs select-none">&#x2500;&#x2510;</span>
      <span className="absolute bottom-2 left-2 text-cyan/30 font-[family-name:var(--font-mono)] text-xs select-none">&#x2514;&#x2500;</span>
      <span className="absolute bottom-2 right-2 text-cyan/30 font-[family-name:var(--font-mono)] text-xs select-none">&#x2500;&#x2518;</span>

      {/* Header: Name */}
      <div className="flex items-center gap-2 mb-3">
        <svg 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-5 h-5 text-cyan flex-shrink-0"
        >
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
        <h3 className="font-[family-name:var(--font-display)] text-base font-semibold text-cool-white group-hover:text-cyan transition-colors truncate">
          {repo.name}
        </h3>
      </div>

      {/* Description */}
      <p className="text-sm text-steel leading-[1.6] mb-4 flex-1 line-clamp-3">
        {repo.description || "No description available"}
      </p>

      {/* Footer: Language and Date */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-cyan/10">
        <div className="flex items-center gap-2">
          {languageColor && (
            <>
              <span 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: languageColor }}
              />
              <span className="text-xs font-[family-name:var(--font-mono)] text-steel">
                {repo.language}
              </span>
            </>
          )}
        </div>
        <div className="text-xs font-[family-name:var(--font-mono)] text-steel-dim">
          <span className="text-cyan/50">updated</span> {formatDate(repo.updatedAt)}
        </div>
      </div>
    </a>
  );
}
