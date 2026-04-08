"use client";

import { useId, useRef } from "react";
import { createPortal } from "react-dom";
import type { Education as EducationEntry, Link, LinkEntry, LinkGroup } from "@/types/cv";
import { useModal } from "@/hooks/useModal";

interface EducationModalProps {
  education: EducationEntry | null;
  onClose: () => void;
}

function isLinkGroup(entry: LinkEntry): entry is LinkGroup {
  return "group" in entry;
}

function EducationLinks({ links }: { links: LinkEntry[] }) {
  const renderLink = (link: Link) => (
    <a
      key={link.url}
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-base text-cyan hover:text-cyan/80 transition-colors group/link"
    >
      <svg className="w-4 h-4 flex-shrink-0 group-hover/link:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
      <span className="group-hover/link:glitch-hover">{link.label}</span>
      {link.suffix && <span className="text-steel">{link.suffix}</span>}
    </a>
  );

  return (
    <div className="space-y-3 pl-4 border-l-2 border-magenta/20">
      {links.map((entry) =>
        isLinkGroup(entry) ? (
          <div key={entry.group} className="space-y-2">
            <div className="font-[family-name:var(--font-mono)] text-sm text-steel-dim">
              {entry.group}
            </div>
            <div className="space-y-2 pl-4">
              {entry.links.map(renderLink)}
            </div>
          </div>
        ) : (
          renderLink(entry)
        )
      )}
    </div>
  );
}

export function EducationModal({ education, onClose }: EducationModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useModal({
    isOpen: !!education,
    onClose,
    dialogRef,
    initialFocusRef: closeButtonRef,
  });

  if (!education) return null;

  const paragraphs = education.description.split("\n\n");

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
              <span className="text-cyan">ACCESSING:</span>{" "}
              {education.institution.toLowerCase().replace(/\s+/g, "_")}.edu
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {education.url && (
              <a
                href={education.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${education.institution} website`}
                className="inline-flex items-center justify-center rounded-sm border border-magenta bg-magenta/40 p-2 text-cool-white transition-colors hover:bg-magenta/60 hover:text-white shadow-[0_0_10px_rgba(255,0,170,0.4)]"
                title="Open Institution Website"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label={`Close ${education.institution} details`}
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
                Academic Record
              </span>
            </div>
            <div className="font-[family-name:var(--font-mono)] text-sm text-steel space-y-2 pl-4 border-l-2 border-cyan/20">
              <div className="flex gap-2">
                <span className="text-steel-dim w-24 flex-shrink-0">degree:</span>
                <span className="text-magenta">{education.degree}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-steel-dim w-24 flex-shrink-0">duration:</span>
                <span className="text-kiroshi-yellow">{education.duration}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-steel-dim w-24 flex-shrink-0">grade:</span>
                <span className="text-cool-white">{education.grade}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-steel-dim w-24 flex-shrink-0">location:</span>
                <span className="text-steel">{education.location}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-kiroshi-yellow text-base">■</span>
              <span className="font-[family-name:var(--font-display)] text-sm font-bold text-kiroshi-yellow tracking-widest uppercase">
                Study Log
              </span>
            </div>
            <div className="text-cool-white/90 leading-relaxed text-base space-y-4 pl-4 border-l-2 border-kiroshi-yellow/20">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="[&_a]:text-cyan [&_a]:hover:underline"
                  dangerouslySetInnerHTML={{ __html: paragraph }}
                />
              ))}
            </div>
          </div>

          {education.links.length > 0 && (
            <div className="pt-4 border-t border-cyan/10 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-magenta text-base">■</span>
                <span className="font-[family-name:var(--font-display)] text-sm font-bold text-magenta tracking-widest uppercase">
                  External Links
                </span>
              </div>
              <EducationLinks links={education.links} />
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
