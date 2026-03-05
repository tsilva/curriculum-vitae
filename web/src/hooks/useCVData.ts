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

// Cache for the manifest to avoid multiple fetches
let manifestCache: DataManifest | null = null;
let manifestPromise: Promise<DataManifest> | null = null;

async function fetchManifest(): Promise<DataManifest> {
  if (manifestCache) return manifestCache;
  if (manifestPromise) return manifestPromise;
  
  manifestPromise = fetch("/cv-data-manifest.json", {
    cache: "no-store", // Always get fresh manifest
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load manifest");
      return res.json();
    })
    .then((data) => {
      manifestCache = data;
      return data;
    });
    
  return manifestPromise;
}

// Cache for CV data
const dataCache = new Map<string, CVData>();

async function fetchCVData(manifest: DataManifest): Promise<CVData> {
  const cacheKey = manifest.hash;
  
  if (dataCache.has(cacheKey)) {
    return dataCache.get(cacheKey)!;
  }
  
  const dataUrl = `/${manifest.filename}`;
  
  const response = await fetch(dataUrl, {
    // Use cache with revalidation - Cloudflare will respect these headers
    cache: "force-cache",
    headers: {
      // Request compression
      "Accept-Encoding": "gzip, deflate, br",
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to load CV data: ${response.status}`);
  }
  
  const data: CVData = await response.json();
  dataCache.set(cacheKey, data);
  
  return data;
}

export function useCVData(): UseCVDataReturn {
  const [data, setData] = useState<CVData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch manifest first to get the versioned filename
      const manifest = await fetchManifest();
      
      // Then fetch the actual data
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

  return { data, isLoading, error, refetch: loadData };
}

// Preload function that can be called early
export function preloadCVData(): Promise<CVData> {
  return fetchManifest().then(fetchCVData);
}
