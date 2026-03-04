"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "hero", label: "Top" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "education", label: "Education" },
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
      {/* Desktop: right-side dots */}
      <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="group flex items-center gap-3 justify-end"
            title={section.label}
          >
            <span className="font-[family-name:var(--font-mono)] text-[10px] text-slate/0 group-hover:text-slate transition-all">
              {section.label}
            </span>
            <span
              className={`w-2.5 h-2.5 rounded-full border transition-all ${
                active === section.id
                  ? "bg-amber border-amber scale-125"
                  : "border-slate/40 group-hover:border-slate"
              }`}
            />
          </a>
        ))}
      </nav>

      {/* Mobile: bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-base-light/95 backdrop-blur border-t border-amber/10">
        <div className="flex justify-around py-2 px-2">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={`font-[family-name:var(--font-mono)] text-[10px] px-3 py-1.5 rounded transition-colors ${
                active === section.id
                  ? "text-amber"
                  : "text-slate hover:text-warm-white"
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
