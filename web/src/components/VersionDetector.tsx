"use client";

import { useVersionCheck } from "@/hooks/useVersionCheck";
import { VersionUpdatePopup } from "./VersionUpdatePopup";

export function VersionDetector() {
  const { hasUpdate, dismissUpdate, reloadPage } = useVersionCheck();

  return (
    <VersionUpdatePopup
      isOpen={hasUpdate}
      onReload={reloadPage}
      onDismiss={dismissUpdate}
    />
  );
}
