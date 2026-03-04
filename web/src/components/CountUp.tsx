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
    <div ref={ref} className="text-center">
      <div className="font-[family-name:var(--font-display)] text-[9px] font-bold text-kiroshi-red mb-1 tracking-[0.25em] uppercase neon-glow-kiroshi-red leading-tight">
        {label.split(' ').map((word, i) => (
          <span key={i} className="block">{word}</span>
        ))}
      </div>
      <div
        className="font-[family-name:var(--font-pixel)] text-2xl md:text-3xl font-bold text-kiroshi-yellow neon-glow-kiroshi-yellow"
      >
        {count}<span className="text-kiroshi-yellow/70">{suffix}</span>
      </div>
      <div className="mt-2 mx-auto w-12 h-px bg-kiroshi-red/30" />
    </div>
  );
}
