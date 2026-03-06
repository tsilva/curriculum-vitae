"use client";

import { useState, useEffect, useRef, useMemo } from "react";

const ITEMS_PER_PAGE = 12;

export function useInfiniteScroll<T>(items: T[], deps: unknown[] = []) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
  const remaining = items.length - visible.length;

  // Reset when dependencies change (e.g. filters)
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || visibleCount >= items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, items.length));
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [visibleCount, items.length]);

  return { visible, remaining, loadMoreRef, ITEMS_PER_PAGE };
}
