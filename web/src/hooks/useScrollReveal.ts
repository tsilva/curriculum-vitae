"use client";

import { useEffect, useRef } from "react";

export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    // Observe the container and all .reveal children
    const revealElements = el.querySelectorAll(".reveal");
    revealElements.forEach((child) => observer.observe(child));
    if (el.classList.contains("reveal")) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return ref;
}
