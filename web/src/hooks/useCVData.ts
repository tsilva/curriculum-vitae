"use client";

import { useState, useEffect, useCallback } from "react";
import type { CVData } from "@/types/cv";

interface UseCVDataReturn {
  data: CVData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface DataManifest {
  filename: string;
  hash: string;
  timestamp: number;
  buildDate: string;
  stats: {
    employers: number;
    education: number;
    projects: number;
    projectsWithGalleries: number;
  };
}

// Extend Window interface
declare global {
  interface Window {
    __CV_MANIFEST__?: DataManifest;
    __CV_DATA__?: CVData;
    __CV_DATA_URL__?: string;
  }
}

// Cache for the manifest to avoid multiple fetches
let manifestCache: DataManifest | null = null;
let manifestPromise: Promise<DataManifest> | null = null;

async function fetchManifest(): Promise<DataManifest> {
  // Check if preloaded in window
  if (window.__CV_MANIFEST__) {
    return window.__CV_MANIFEST__;
  }
  
  if (manifestCache) return manifestCache;
  if (manifestPromise) return manifestPromise;
  
  manifestPromise = fetch("/cv-data-manifest.json", {
    cache: "no-store",
    priority: "high",
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load manifest");
      return res.json();
    })
    .then((data) => {
      manifestCache = data;
      window.__CV_MANIFEST__ = data; // Store for other components
      return data;
    });
    
  return manifestPromise;
}

// Cache for CV data
const dataCache = new Map<string, CVData>();

async function fetchCVData(manifest: DataManifest): Promise<CVData> {
  // Check if preloaded in window
  if (window.__CV_DATA__) {
    return window.__CV_DATA__;
  }
  
  const cacheKey = manifest.hash;
  
  if (dataCache.has(cacheKey)) {
    return dataCache.get(cacheKey)!;
  }
  
  const dataUrl = `/${manifest.filename}`;
  
  const response = await fetch(dataUrl, {
    cache: "force-cache",
    priority: "high",
    headers: {
      "Accept-Encoding": "gzip, deflate, br",
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to load CV data: ${response.status}`);
  }
  
  const data: CVData = await response.json();
  dataCache.set(cacheKey, data);
  window.__CV_DATA__ = data; // Store for other components
  
  return data;
}

export function useCVData(): UseCVDataReturn {
  const [data, setData] = useState<CVData | null>(() => {
    // Try to get from window immediately (avoids flash of loading state)
    if (typeof window !== "undefined" && window.__CV_DATA__) {
      return window.__CV_DATA__;
    }
    return null;
  });
  
  const [isLoading, setIsLoading] = useState(() => {
    // If we have preloaded data, don't show loading
    return typeof window === "undefined" || !window.__CV_DATA__;
  });
  
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    // Skip if already loaded from window
    if (window.__CV_DATA__) {
      setData(window.__CV_DATA__);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const manifest = await fetchManifest();
      const cvData = await fetchCVData(manifest);
      
      setData(cvData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      console.error("Failed to load CV data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Poll for preloaded data that arrives after initial hydration
  useEffect(() => {
    if (data || isLoading === false) return;
    
    // Check a few times for preloaded data (inline script loads async)
    let checks = 0;
    const maxChecks = 20; // Check for up to 2 seconds
    
    const interval = setInterval(() => {
      checks++;
      
      if (window.__CV_DATA__) {
        setData(window.__CV_DATA__);
        setIsLoading(false);
        clearInterval(interval);
      } else if (checks >= maxChecks) {
        clearInterval(interval);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [data, isLoading]);

  return { data, isLoading, error, refetch: loadData };
}

// Preload function that can be called early
export function preloadCVData(): Promise<CVData> {
  return fetchManifest().then(fetchCVData);
}
