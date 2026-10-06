"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "hero", label: "TOP" },
  { id: "experience", label: "EXPERIENCE", mobileLabel: "EXP" },
  { id: "projects", label: "PROJECTS", mobileLabel: "PROJ" },
  { id: "opensource", label: "OSS" },
  { id: "education", label: "TRAINING", mobileLabel: "EDU" },
];

export function Nav() {
  const [active, setActive] = useState("hero");

  const scrollToSection = (id: string) => {
    window.history.replaceState(null, "", `#${id}`);

    let attempts = 0;
    const maxAttempts = 20;

    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      attempts += 1;
      if (attempts < maxAttempts) {
        window.setTimeout(tryScroll, 100);
      }
    };

    tryScroll();
  };

  useEffect(() => {
    let frame = 0;

    const updateActive = () => {
      frame = 0;
      const marker = window.innerHeight * 0.45;
      let current = sections[0].id;

      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top <= marker) {
          current = section.id;
        }
      }

      // The final section can be too short to reach the viewport marker.
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        const lastSection = [...sections].reverse().find(({ id }) => document.getElementById(id));
        if (lastSection) current = lastSection.id;
      }

      setActive(current);
    };

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActive);
    };

    const main = document.querySelector("main");
    const observer = new MutationObserver(() => {
      scheduleUpdate();
      if (sections.every(({ id }) => document.getElementById(id))) {
        observer.disconnect();
      }
    });

    if (main && !sections.every(({ id }) => document.getElementById(id))) {
      observer.observe(main, { childList: true, subtree: true });
    }

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    scheduleUpdate();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      {/* Desktop: right-side diamonds - hidden when in hero */}
      <nav className={`fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3 transition-opacity duration-500 ${active === 'hero' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            aria-current={active === section.id ? "page" : undefined}
            onClick={(event) => {
              event.preventDefault();
              scrollToSection(section.id);
            }}
            className="group flex items-center gap-3 justify-end"
            title={section.label}
          >
            <span className="font-[family-name:var(--font-mono)] text-xs text-cyan/60 transition-all">
              {section.label}
            </span>
            <span
              className={`w-2.5 h-2.5 rotate-45 border transition-all ${
                active === section.id
                  ? "bg-cyan border-cyan scale-125 shadow-[0_0_8px_rgba(0,230,230,0.5)]"
                  : "border-steel/40 group-hover:border-cyan"
              }`}
            />
          </a>
        ))}
      </nav>

      {/* Mobile: bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-base-light/95 backdrop-blur border-t border-cyan/20 shadow-[0_-2px_15px_rgba(0,230,230,0.1)]">
        <div className="flex justify-around py-3 px-2">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              aria-current={active === section.id ? "page" : undefined}
              onClick={(event) => {
                event.preventDefault();
                scrollToSection(section.id);
              }}
              className={`font-[family-name:var(--font-mono)] text-xs px-2 py-1.5 rounded transition-colors ${
                active === section.id
                  ? "text-cyan"
                  : "text-steel hover:text-cool-white"
              }`}
            >
              {section.mobileLabel ?? section.label}
            </a>
          ))}
        </div>
      </nav>
    </>
  );
}
