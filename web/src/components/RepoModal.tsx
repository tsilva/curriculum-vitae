"use client";

import { useId, useRef } from "react";
import { createPortal } from "react-dom";
import type { GitHubRepo } from "@/types/cv";
import { normalizeHttpUrl } from "@/lib/url-utils";
import { useModal } from "@/hooks/useModal";

interface RepoModalProps {
  repo: GitHubRepo | null;
  onClose: () => void;
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "today";
  if (diffInDays === 1) return "yesterday";
  if (diffInDays < 30) return `${diffInDays} days ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

function formatAbsoluteDate(dateString: string): string {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateString));
}

export function RepoModal({ repo, onClose }: RepoModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useModal({
    isOpen: !!repo,
    onClose,
    dialogRef,
    initialFocusRef: closeButtonRef,
  });

  if (!repo) return null;

  const homepageUrl = normalizeHttpUrl(repo.homepageUrl);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="bg-base-light border border-cyan/20 rounded-sm w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[0_0_30px_rgba(0,230,230,0.1),0_0_60px_rgba(0,230,230,0.05)] mx-4"
      >
        <div className="flex-shrink-0 bg-base-light/95 backdrop-blur border-b border-cyan/10 px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex gap-1.5 flex-shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-magenta/80 animate-pulse" />
              <span className="w-2.5 h-2.5 rounded-full bg-kiroshi-yellow/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-neon-green/80" />
            </div>
            <h2 id={titleId} className="font-[family-name:var(--font-display)] text-base font-bold text-cool-white truncate">
              <span className="text-cyan">ACCESSING:</span> {repo.name.toLowerCase().replace(/\s+/g, "_")}.repo
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${repo.name} on GitHub`}
              className="inline-flex items-center justify-center rounded-sm border border-magenta bg-magenta/40 p-2 text-cool-white transition-colors hover:bg-magenta/60 hover:text-white shadow-[0_0_10px_rgba(255,0,170,0.4)]"
              title="Open GitHub Repository"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </a>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label={`Close ${repo.name} details`}
              className="font-[family-name:var(--font-mono)] text-sm text-steel hover:text-cyan transition-colors flex-shrink-0 cursor-pointer border border-steel/30 hover:border-cyan/40 px-2 py-1 rounded-sm"
            >
              [ESC]
            </button>
          </div>
        </div>

        <div className="overflow-y-auto overscroll-y-contain px-4 py-4 md:px-6 md:py-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-cyan text-base">■</span>
              <span className="font-[family-name:var(--font-display)] text-sm font-bold text-cyan tracking-widest uppercase">
                Repository Stats
              </span>
            </div>
            <div className="font-[family-name:var(--font-mono)] text-sm text-steel space-y-2 pl-4 border-l-2 border-cyan/20">
              <div className="flex gap-2">
                <span className="text-steel-dim w-24 flex-shrink-0">language:</span>
                <span className="text-cool-white">{repo.language || "Unknown"}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-steel-dim w-24 flex-shrink-0">created:</span>
                <span className="text-cool-white">{formatAbsoluteDate(repo.createdAt)}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-steel-dim w-24 flex-shrink-0">updated:</span>
                <span className="text-cool-white">
                  {formatAbsoluteDate(repo.updatedAt)}{" "}
                  <span className="text-steel-dim">({formatRelativeDate(repo.updatedAt)})</span>
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-kiroshi-yellow text-base">■</span>
              <span className="font-[family-name:var(--font-display)] text-sm font-bold text-kiroshi-yellow tracking-widest uppercase">
                Repository Notes
              </span>
            </div>
            <div className="text-cool-white/90 leading-relaxed text-base space-y-4 pl-4 border-l-2 border-kiroshi-yellow/20">
              <p>{repo.description || "No description available."}</p>
            </div>
          </div>

          {homepageUrl && (
            <div className="pt-4 border-t border-cyan/10 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-magenta text-base">■</span>
                <span className="font-[family-name:var(--font-display)] text-sm font-bold text-magenta tracking-widest uppercase">
                  External Links
                </span>
              </div>
              <div className="space-y-2 pl-4 border-l-2 border-magenta/20">
                <a
                  href={homepageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-base text-cyan hover:text-cyan/80 transition-colors group/link"
                >
                  <svg className="w-4 h-4 flex-shrink-0 group-hover/link:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3h6v6" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14 21 3" />
                  </svg>
                  <span className="group-hover/link:glitch-hover">Homepage</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
