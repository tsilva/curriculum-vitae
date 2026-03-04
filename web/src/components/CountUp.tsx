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
      // Ease out cubic
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
      <div className="font-[family-name:var(--font-display)] text-4xl md:text-5xl lg:text-6xl font-bold text-amber">
        {count}{suffix}
      </div>
      <div className="font-[family-name:var(--font-mono)] text-sm text-slate mt-2 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
