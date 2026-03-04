"use client";

import { useEffect, useState } from "react";

const bootLines = [
  "> INITIALIZING SYSTEM...",
  "> LOADING CV_DATABASE... OK",
  "> ESTABLISHING NEURAL LINK...",
  "> WELCOME, RUNNER",
];

export function BootSequence() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [done, setDone] = useState(false);
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("boot-done")) {
      setSkip(true);
      return;
    }
  }, []);

  useEffect(() => {
    if (skip) return;

    const lineDelay = 500;
    const timers: NodeJS.Timeout[] = [];

    for (let i = 0; i < bootLines.length; i++) {
      timers.push(
        setTimeout(() => setVisibleLines(i + 1), lineDelay * (i + 1))
      );
    }

    timers.push(
      setTimeout(() => {
        setDone(true);
        sessionStorage.setItem("boot-done", "1");
      }, lineDelay * bootLines.length + 800)
    );

    return () => timers.forEach(clearTimeout);
  }, [skip]);

  if (skip || done) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-base flex items-center justify-center">
      <div className="font-[family-name:var(--font-mono)] text-neon-green text-sm md:text-base space-y-2 px-6">
        {bootLines.slice(0, visibleLines).map((line, i) => (
          <div
            key={i}
            className="animate-fade-in-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {line}
            {i === visibleLines - 1 && i < bootLines.length - 1 && (
              <span className="terminal-cursor" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
