"use client";

import { useEffect, useState, type ComponentType } from "react";

export function DeferredMatrixRain() {
  const [Rain, setRain] = useState<ComponentType | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let active = true;
    let observer: PerformanceObserver | undefined;
    let frame = 0;

    function loadRain() {
      if (!active) return;
      observer?.disconnect();
      void import("./MatrixRain").then(
        ({ MatrixRain }) => {
          if (active) setRain(() => MatrixRain);
        },
        () => undefined, // Keep the hero usable if its decorative chunk is unavailable.
      );
    }

    if (performance.getEntriesByName("first-contentful-paint", "paint").length) {
      loadRain();
    } else if (window.PerformanceObserver?.supportedEntryTypes?.includes("paint")) {
      observer = new PerformanceObserver((entries) => {
        if (entries.getEntriesByName("first-contentful-paint", "paint").length) {
          loadRain();
        }
      });
      observer.observe({ type: "paint", buffered: true });
    } else {
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(loadRain);
      });
    }

    return () => {
      active = false;
      observer?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return Rain ? <Rain /> : null;
}
