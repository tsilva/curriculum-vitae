"use client";

import { useId, useRef } from "react";
import { createPortal } from "react-dom";
import type { GitHubRepo } from "@/types/cv";
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
                <span className="text-steel-dim w-24 flex-shrink-0">stars:</span>
                <span className="text-kiroshi-yellow">{repo.stars}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-steel-dim w-24 flex-shrink-0">forks:</span>
                <span className="text-cool-white">{repo.forks}</span>
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

          <div className="pt-4 border-t border-cyan/10 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-magenta text-base">■</span>
              <span className="font-[family-name:var(--font-display)] text-sm font-bold text-magenta tracking-widest uppercase">
                External Links
              </span>
            </div>
            <div className="space-y-2 pl-4 border-l-2 border-magenta/20">
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-base text-cyan hover:text-cyan/80 transition-colors group/link"
              >
                <svg className="w-4 h-4 flex-shrink-0 group-hover/link:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="group-hover/link:glitch-hover">GitHub Repository</span>
              </a>
              {repo.homepageUrl && (
                <a
                  href={repo.homepageUrl}
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
