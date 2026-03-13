"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ANALYTICS_CONSENT_CHANGE_EVENT,
  ANALYTICS_PREFERENCES_OPEN_EVENT,
  getBrowserPrivacySignal,
  getEffectiveAnalyticsConsent,
  persistAnalyticsConsent,
  readStoredAnalyticsConsent,
  type StoredAnalyticsConsent,
} from "@/lib/analytics-consent";

export function AnalyticsConsent() {
  const [storedConsent, setStoredConsent] =
    useState<StoredAnalyticsConsent>("unset");
  const [privacySignal, setPrivacySignal] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setStoredConsent(readStoredAnalyticsConsent());
      setPrivacySignal(getBrowserPrivacySignal());
      setReady(true);
    };

    const handleConsentChange = (event: Event) => {
      const nextConsent = (event as CustomEvent<{ consent: StoredAnalyticsConsent }>).detail
        ?.consent;
      setStoredConsent(nextConsent ?? readStoredAnalyticsConsent());
      setPrivacySignal(getBrowserPrivacySignal());
      setPreferencesOpen(false);
      setReady(true);
    };

    const handleOpenPreferences = () => {
      sync();
      setPreferencesOpen(true);
    };

    sync();
    window.addEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, handleConsentChange);
    window.addEventListener(ANALYTICS_PREFERENCES_OPEN_EVENT, handleOpenPreferences);

    return () => {
      window.removeEventListener(
        ANALYTICS_CONSENT_CHANGE_EVENT,
        handleConsentChange
      );
      window.removeEventListener(
        ANALYTICS_PREFERENCES_OPEN_EVENT,
        handleOpenPreferences
      );
    };
  }, []);

  const effectiveConsent = useMemo(
    () => getEffectiveAnalyticsConsent(storedConsent, privacySignal),
    [privacySignal, storedConsent]
  );

  const isVisible = ready && (storedConsent === "unset" || preferencesOpen);

  if (!isVisible) {
    return null;
  }

  return (
    <section
      aria-label="Privacy preferences"
      className="fixed inset-x-4 bottom-20 z-[70] border border-cyan/30 bg-base-light/95 p-4 shadow-[0_0_30px_rgba(0,230,230,0.12)] backdrop-blur md:bottom-6 md:left-auto md:right-6 md:max-w-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-[0.18em] text-cyan">
            Privacy Controls
          </p>
          <p className="text-sm leading-6 text-cool-white/90">
            Analytics is disabled by default. You can opt in to anonymous usage
            measurement at any time.
          </p>
          <p className="font-[family-name:var(--font-mono)] text-xs text-steel">
            Status:{" "}
            <span className="text-kiroshi-yellow">
              {effectiveConsent === "granted" ? "analytics enabled" : "analytics disabled"}
            </span>
          </p>
          {privacySignal && (
            <p className="font-[family-name:var(--font-mono)] text-xs text-magenta">
              Browser DNT/GPC is active, so analytics stays disabled even if you opt in.
            </p>
          )}
        </div>
        {preferencesOpen && (
          <button
            type="button"
            onClick={() => setPreferencesOpen(false)}
            className="font-[family-name:var(--font-mono)] text-xs text-steel hover:text-cyan"
          >
            Close
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => persistAnalyticsConsent("granted")}
          className="rounded-sm border border-cyan/50 px-3 py-2 font-[family-name:var(--font-mono)] text-xs text-cyan hover:bg-cyan/10 disabled:cursor-not-allowed disabled:border-steel/30 disabled:text-steel/50"
          disabled={privacySignal}
        >
          Allow Analytics
        </button>
        <button
          type="button"
          onClick={() => persistAnalyticsConsent("denied")}
          className="rounded-sm border border-magenta/50 px-3 py-2 font-[family-name:var(--font-mono)] text-xs text-magenta hover:bg-magenta/10"
        >
          Keep Disabled
        </button>
      </div>
    </section>
  );
}
