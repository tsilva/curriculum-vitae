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
const VISIBILITY_CHECK_INTERVAL = 30 * 1000; // 30 seconds when visible

export function useVersionCheck(): UseVersionCheckReturn {
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [hasUpdate, setHasUpdate] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef(false);

  // Get stored version from localStorage
  const getStoredVersion = useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }, []);

  // Store version to localStorage
  const storeVersion = useCallback((version: string) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, version);
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Fetch the manifest and check for updates
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

      // On first load, set current version if not already stored
      if (!initialLoadRef.current) {
        initialLoadRef.current = true;
        const storedVersion = getStoredVersion();

        if (storedVersion) {
          // We have a stored version - use it as current
          setCurrentVersion(storedVersion);

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
          storeVersion(remoteVersion);
        }
      } else {
        // Subsequent check - compare with current
        if (currentVersion && currentVersion !== remoteVersion) {
          console.log("[VersionCheck] Update detected during polling:", currentVersion, "→", remoteVersion);
          setLatestVersion(remoteVersion);
          setHasUpdate(true);
        }
      }
    } catch (error) {
      console.error("[VersionCheck] Error checking for updates:", error);
    }
  }, [currentVersion, getStoredVersion, storeVersion]);

  // Dismiss the update notification
  const dismissUpdate = useCallback(() => {
    setHasUpdate(false);
    // Update the stored version to the latest to prevent showing again
    if (latestVersion) {
      storeVersion(latestVersion);
      setCurrentVersion(latestVersion);
    }
  }, [latestVersion, storeVersion]);

  // Reload the page
  const reloadPage = useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }, []);

  // Initial check and setup polling
  useEffect(() => {
    // Check immediately on mount
    checkForUpdates();

    // Set up polling interval
    intervalRef.current = setInterval(checkForUpdates, POLLING_INTERVAL);

    // Handle visibility change - check more frequently when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Immediate check when tab becomes visible
        checkForUpdates();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkForUpdates]);

  // Update localStorage when user acknowledges update
  useEffect(() => {
    if (!hasUpdate && latestVersion && latestVersion === currentVersion) {
      storeVersion(latestVersion);
    }
  }, [hasUpdate, latestVersion, currentVersion, storeVersion]);

  return {
    hasUpdate,
    dismissUpdate,
    reloadPage,
    currentVersion,
    latestVersion,
  };
}
