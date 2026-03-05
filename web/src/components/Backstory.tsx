"use client";

import { useEffect, useRef } from "react";
import { cvData } from "@/lib/cv-data";

// Extract the backstory narrative from the TLDR content
// The backstory is contained in the blockquote sections (>)
function extractBackstory(tldr: string): string {
  // Split by lines and find the blockquote content
  const lines = tldr.split('\n');
  const backstoryLines: string[] = [];
  let inBlockquote = false;

  for (const line of lines) {
    // Skip the logo and intro paragraph
    if (line.includes('<p align=') || line.includes('logo.png')) continue;
    if (line.includes("This CV is detailed")) continue;
    if (line.trim() === "") continue;
    
    // Look for blockquote start
    if (line.startsWith('>')) {
      inBlockquote = true;
      // Remove the > marker and any leading <br>
      const cleanLine = line.replace(/^>\s*/, '').replace(/^<br>\s*/, '');
      if (cleanLine) {
        backstoryLines.push(cleanLine);
      }
    } else if (inBlockquote && !line.startsWith('>') && line.trim() !== '') {
      // We've exited the blockquote
      break;
    }
  }

  return backstoryLines.join('\n');
}

export function Backstory() {
  const sectionRef = useRef<HTMLElement>(null);
  const backstoryContent = extractBackstory(cvData.tldr);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!backstoryContent) return null;

  return (
    <section
      ref={sectionRef}
      id="backstory"
      className="py-20 px-6 relative overflow-hidden opacity-0 translate-y-8 transition-all duration-700 [&.animate-in]:opacity-100 [&.animate-in]:translate-y-0"
    >
      {/* Section border with cyberpunk styling */}
      <div className="max-w-4xl mx-auto relative">
        {/* Top decorative line */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-kiroshi-red/40 to-transparent" />
          <span className="font-[family-name:var(--font-mono)] text-xs text-kiroshi-red/60 tracking-[0.3em] uppercase">
            /// ORIGIN_STORY
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-kiroshi-red/40 to-transparent" />
        </div>

        {/* Backstory content card */}
        <div className="relative p-8 md:p-12 border-l-2 border-kiroshi-red/40 bg-surface/30 backdrop-blur-sm">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-kiroshi-red/60" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-kiroshi-red/60" />

          {/* Quote marks */}
          <div className="absolute -top-4 -left-2 text-6xl text-kiroshi-red/20 font-[family-name:var(--font-display)] leading-none">
            "
          </div>

          {/* Content */}
          <div
            className="font-[family-name:var(--font-body)] text-sm md:text-base text-steel/90 leading-relaxed space-y-4 prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: backstoryContent }}
          />

          {/* Quote marks */}
          <div className="absolute -bottom-8 -right-2 text-6xl text-kiroshi-red/20 font-[family-name:var(--font-display)] leading-none rotate-180">
            "
          </div>

          {/* Bottom metadata */}
          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
            <span className="font-[family-name:var(--font-mono)] text-xs text-kiroshi-yellow/60 tracking-wider">
              CLASSIFIED // LEVEL 1 CLEARANCE
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-kiroshi-red/60 animate-pulse" />
              <span className="font-[family-name:var(--font-mono)] text-xs text-kiroshi-red/60">
                AUTHENTICATED
              </span>
            </div>
          </div>
        </div>

        {/* Decorative binary code */}
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 hidden lg:block">
          <div className="font-[family-name:var(--font-mono)] text-[10px] text-kiroshi-red/10 leading-tight rotate-90 whitespace-nowrap">
            01001000 01000101 01001100 01001100 01001111
          </div>
        </div>
      </div>
    </section>
  );
}
