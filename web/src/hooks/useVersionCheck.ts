"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseVersionCheckReturn {
  hasUpdate: boolean;
  dismissUpdate: () => void;
  reloadPage: () => void;
  currentVersion: string | null;
  latestVersion: string | null;
}

interface DataManifest {
  filename: string;
  hash: string;
  timestamp: number;
  buildDate: string;
}

const STORAGE_KEY = "cv_last_seen_version";
const POLLING_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useVersionCheck(): UseVersionCheckReturn {
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [hasUpdate, setHasUpdate] = useState(false);
  
  // Use refs to track values that the polling function needs access to
  // without causing the effect to re-run
  const currentVersionRef = useRef<string | null>(null);
  const hasUpdateRef = useRef(false);
  const initialLoadDoneRef = useRef(false);
  
  // Keep refs in sync with state
  useEffect(() => {
    currentVersionRef.current = currentVersion;
  }, [currentVersion]);
  
  useEffect(() => {
    hasUpdateRef.current = hasUpdate;
  }, [hasUpdate]);

  // Store version to localStorage
  const storeVersion = useCallback((version: string) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, version);
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Get stored version from localStorage
  const getStoredVersion = useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }, []);

  // The actual check function - stable reference using refs for dynamic values
  const checkForUpdates = useCallback(async () => {
    try {
      const response = await fetch("/cv-data-manifest.json", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (!response.ok) {
        console.error("[VersionCheck] Failed to fetch manifest:", response.status);
        return;
      }

      const manifest: DataManifest = await response.json();
      const remoteVersion = manifest.hash;
      const storedVersion = getStoredVersion();

      // On first load
      if (!initialLoadDoneRef.current) {
        initialLoadDoneRef.current = true;
        
        if (storedVersion) {
          // We have a stored version - use it as current
          setCurrentVersion(storedVersion);
          currentVersionRef.current = storedVersion;

          // Check if there's an update
          if (storedVersion !== remoteVersion) {
            console.log("[VersionCheck] Update available:", storedVersion, "→", remoteVersion);
            setLatestVersion(remoteVersion);
            setHasUpdate(true);
          } else {
            console.log("[VersionCheck] Version up to date:", storedVersion);
          }
        } else {
          // First visit - store current version
          console.log("[VersionCheck] First visit, storing version:", remoteVersion);
          setCurrentVersion(remoteVersion);
          currentVersionRef.current = remoteVersion;
          storeVersion(remoteVersion);
        }
      } else {
        // Subsequent polling check - compare with current using ref
        const current = currentVersionRef.current;
        if (current && current !== remoteVersion && !hasUpdateRef.current) {
          console.log("[VersionCheck] Update detected during polling:", current, "→", remoteVersion);
          setLatestVersion(remoteVersion);
          setHasUpdate(true);
        }
      }
    } catch (error) {
      console.error("[VersionCheck] Error checking for updates:", error);
    }
  }, [getStoredVersion, storeVersion]);

  // Dismiss the update notification
  const dismissUpdate = useCallback(() => {
    setHasUpdate(false);
    // Update the stored version to the latest to prevent showing again
    if (latestVersion) {
      storeVersion(latestVersion);
      setCurrentVersion(latestVersion);
      currentVersionRef.current = latestVersion;
    }
  }, [latestVersion, storeVersion]);

  // Reload the page
  const reloadPage = useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }, []);

  // Set up polling - this effect only runs once on mount
  useEffect(() => {
    console.log("[VersionCheck] Starting polling every", POLLING_INTERVAL / 1000 / 60, "minutes");
    
    // Check immediately on mount
    checkForUpdates();

    // Set up polling interval with stable function reference
    const intervalId = setInterval(() => {
      console.log("[VersionCheck] Polling for updates...");
      checkForUpdates();
    }, POLLING_INTERVAL);

    // Handle visibility change - check when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("[VersionCheck] Tab visible, checking for updates...");
        checkForUpdates();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      console.log("[VersionCheck] Stopping polling");
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkForUpdates]);

  return {
    hasUpdate,
    dismissUpdate,
    reloadPage,
    currentVersion,
    latestVersion,
  };
}
