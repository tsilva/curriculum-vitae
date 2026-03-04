"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "hero", label: "TOP" },
  { id: "experience", label: "EXPERIENCE" },
  { id: "projects", label: "PROJECTS" },
  { id: "education", label: "TRAINING" },
];

export function Nav() {
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Desktop: right-side diamonds - hidden when in hero */}
      <nav className={`fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3 transition-opacity duration-500 ${active === 'hero' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="group flex items-center gap-3 justify-end"
            title={section.label}
          >
            <span className="font-[family-name:var(--font-mono)] text-[10px] text-cyan/60 transition-all">
              {section.label}
            </span>
            <span
              className={`w-2.5 h-2.5 rotate-45 border transition-all ${
                active === section.id
                  ? "bg-cyan border-cyan scale-125 shadow-[0_0_8px_rgba(0,255,240,0.6)]"
                  : "border-steel/40 group-hover:border-cyan"
              }`}
            />
          </a>
        ))}
      </nav>

      {/* Mobile: bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-base-light/95 backdrop-blur border-t border-cyan/20 shadow-[0_-2px_15px_rgba(0,255,240,0.1)]">
        <div className="flex justify-around py-2 px-2">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={`font-[family-name:var(--font-mono)] text-[10px] px-3 py-1.5 rounded transition-colors ${
                active === section.id
                  ? "text-cyan"
                  : "text-steel hover:text-cool-white"
              }`}
            >
              {section.label}
            </a>
          ))}
        </div>
      </nav>
    </>
  );
}
