"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ANALYTICS_CONSENT_CHANGE_EVENT,
  getBrowserPrivacySignal,
  getEffectiveAnalyticsConsent,
  openAnalyticsPreferences,
  readStoredAnalyticsConsent,
  type StoredAnalyticsConsent,
} from "@/lib/analytics-consent";

export function PrivacyControls() {
  const [storedConsent, setStoredConsent] =
    useState<StoredAnalyticsConsent>("unset");
  const [privacySignal, setPrivacySignal] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setStoredConsent(readStoredAnalyticsConsent());
      setPrivacySignal(getBrowserPrivacySignal());
      setReady(true);
    };

    sync();
    window.addEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, sync);
    return () => window.removeEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, sync);
  }, []);

  const status = useMemo(() => {
    if (!ready) {
      return "analytics disabled by default";
    }

    if (privacySignal) {
      return "browser privacy signal active";
    }

    return getEffectiveAnalyticsConsent(storedConsent, privacySignal) === "granted"
      ? "analytics enabled"
      : "analytics disabled";
  }, [privacySignal, ready, storedConsent]);

  return (
    <div className="mt-3 text-center">
      <p className="text-xs leading-6 text-steel-dim">
        Privacy: analytics is opt-in and off by default. Current status:{" "}
        <span className="text-cool-white">{status}</span>.
      </p>
      <button
        type="button"
        onClick={openAnalyticsPreferences}
        className="mt-2 font-[family-name:var(--font-mono)] text-xs text-cyan hover:text-cool-white"
      >
        Open Privacy Settings
      </button>
    </div>
  );
}
