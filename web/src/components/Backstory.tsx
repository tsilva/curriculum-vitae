"use client";

import { useEffect, useRef, useState } from "react";
import { cvData } from "@/lib/cv-data";

// Convert basic Markdown to HTML
function markdownToHtml(markdown: string): string {
  return markdown
    // Convert **bold** to <strong>
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Convert <br> at start of lines
    .replace(/^<br>\s*/gm, '')
    // Convert line breaks to paragraphs or <br>
    .split('\n').map(line => line.trim()).join('<br>');
}

// Extract the backstory narrative from the TLDR content
// The backstory is contained in the blockquote sections (>)
function extractBackstory(tldr: string): string {
  // Find the blockquote content - everything between the first > and the end of the quoted section
  const lines = tldr.split('\n');
  const backstoryLines: string[] = [];
  let inBlockquote = false;

  for (const line of lines) {
    // Skip the logo and intro paragraph
    if (line.includes('<p align=') || line.includes('logo.png')) continue;
    if (line.includes('This CV is detailed')) continue;
    
    // Check if this line is part of a blockquote (starts with > or ><br>)
    if (line.match(/^>(<br>)?\s*/)) {
      inBlockquote = true;
      // Remove the > marker and any leading <br>
      const cleanLine = line.replace(/^>(<br>)?\s*/, '');
      if (cleanLine) {
        backstoryLines.push(cleanLine);
      }
    } else if (inBlockquote) {
      // We've exited the blockquote (empty line or non-blockquote content)
      if (line.trim() !== '' && !line.match(/^\s*>/)) {
        break;
      }
    }
  }

  const rawContent = backstoryLines.join('\n');
  return markdownToHtml(rawContent);
}

export function Backstory() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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
      className="py-12 px-6 relative overflow-hidden opacity-0 translate-y-8 transition-all duration-700 [&.animate-in]:opacity-100 [&.animate-in]:translate-y-0]"
    >
      {/* Section container */}
      <div className="max-w-4xl mx-auto relative">
        {/* Compact side quest header - always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`w-full group flex items-center justify-between gap-4 p-4 border-l-2 transition-all duration-300 cursor-pointer ${
            isExpanded 
              ? 'border-kiroshi-red bg-kiroshi-red/5' 
              : 'border-kiroshi-red/40 bg-surface/20 hover:bg-surface/50 hover:border-kiroshi-red/80 hover:shadow-[0_0_20px_rgba(232,0,63,0.15)] hover:translate-x-1'
          }`}
        >
          {/* Left side: Icon + Label */}
          <div className="flex items-center gap-3">
            {/* Expand/Collapse icon */}
            <span className={`font-[family-name:var(--font-mono)] text-lg text-kiroshi-red transition-transform duration-300 ${isExpanded ? 'rotate-45' : ''}`}>
              {isExpanded ? '×' : '+'}
            </span>
            
            {/* Side Quest Label */}
            <div className="flex flex-col items-start">
              <span className="font-[family-name:var(--font-mono)] text-xs text-kiroshi-red/60 tracking-[0.2em] uppercase">
                Optional Side Quest
              </span>
              <span className={`font-[family-name:var(--font-display)] text-sm tracking-[0.15em] uppercase transition-colors duration-300 ${
                isHovered || isExpanded ? 'text-cool-white' : 'text-steel'
              }`}>
                ORIGIN_STORY.exe
              </span>
            </div>
          </div>

          {/* Right side: Status indicators */}
          <div className="flex items-center gap-3">
            <span className={`font-[family-name:var(--font-mono)] text-xs tracking-wider transition-colors duration-300 ${
              isExpanded ? 'text-kiroshi-yellow' : 'text-steel/60'
            }`}>
              {isExpanded ? '[ ACCESSING... ]' : '[ LOCKED ]'}
            </span>
            
            {/* Animated lock/indicator */}
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
              isExpanded 
                ? 'bg-kiroshi-red animate-pulse shadow-[0_0_8px_rgba(232,0,63,0.6)]' 
                : isHovered 
                  ? 'bg-kiroshi-red/60' 
                  : 'bg-steel/40'
            }`} />
          </div>
        </button>

        {/* Expandable content area */}
        <div 
          className={`overflow-hidden transition-all duration-500 ease-out ${
            isExpanded ? 'max-h-[2000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          {/* Backstory content card */}
          <div className="relative p-8 md:p-12 border-l-2 border-kiroshi-red/40 bg-surface/30 backdrop-blur-sm">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-kiroshi-red/60" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-kiroshi-red/60" />

            {/* Quote marks */}
            <div className="absolute -top-4 -left-2 text-6xl text-kiroshi-red/20 font-[family-name:var(--font-display)] leading-none">
              &ldquo;
            </div>

            {/* Content */}
            <div
              className="font-[family-name:var(--font-body)] text-sm md:text-base !text-cool-white leading-relaxed space-y-6 [&>*]:!text-cool-white [&_a]:text-cyan [&_a]:underline [&_a]:decoration-cyan/50 [&_a]:hover:text-cool-white [&_a]:hover:decoration-cool-white [&_strong]:text-cool-white [&_strong]:font-bold"
              dangerouslySetInnerHTML={{ __html: backstoryContent }}
            />

            {/* Quote marks */}
            <div className="absolute -bottom-8 -right-2 text-6xl text-kiroshi-red/20 font-[family-name:var(--font-display)] leading-none rotate-180">
              &rdquo;
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
      </div>
    </section>
  );
}
