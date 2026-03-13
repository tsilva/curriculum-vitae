"use client";

import { useEffect, useState, useRef } from "react";

interface CountUpProps {
  end: number;
  suffix?: string;
  duration?: number;
  label: string;
}

export function CountUp({ end, suffix = "", duration = 2000, label }: CountUpProps) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    const steps = 60;
    const stepDuration = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current++;
      const progress = current / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));

      if (current >= steps) {
        setCount(end);
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [started, end, duration]);

  return (
    <div ref={ref} className="min-w-0 text-center">
      <div className="mb-0.5 font-[family-name:var(--font-mono)] text-[0.75rem] font-bold uppercase leading-tight tracking-[0.1em] text-kiroshi-red/80 md:mb-1 md:text-sm md:tracking-[0.15em]">
        {label.split(' ').map((word, i) => (
          <span key={i} className="block">{word}</span>
        ))}
      </div>
      <div
        className="font-[family-name:var(--font-display)] text-[2rem] font-bold text-kiroshi-yellow neon-glow-kiroshi-yellow sm:text-[2.6rem] md:text-4xl"
      >
        {count}<span className="text-kiroshi-yellow/70">{suffix}</span>
      </div>
      <div className="mx-auto mt-2 h-px w-10 bg-kiroshi-red/30 md:mt-3 md:w-14" />
    </div>
  );
}
