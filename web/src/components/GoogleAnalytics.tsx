"use client";

import { useEffect, useMemo, useState } from "react";
import Script from "next/script";
import {
  ANALYTICS_CONSENT_CHANGE_EVENT,
  getBrowserPrivacySignal,
  getEffectiveAnalyticsConsent,
  readStoredAnalyticsConsent,
  type StoredAnalyticsConsent,
} from "@/lib/analytics-consent";

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  const [storedConsent, setStoredConsent] =
    useState<StoredAnalyticsConsent>("unset");
  const [privacySignal, setPrivacySignal] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!measurementId) {
      return;
    }

    const sync = () => {
      setStoredConsent(readStoredAnalyticsConsent());
      setPrivacySignal(getBrowserPrivacySignal());
      setReady(true);
    };

    sync();
    window.addEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, sync);
    return () => window.removeEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, sync);
  }, []);

  const analyticsEnabled = useMemo(
    () => getEffectiveAnalyticsConsent(storedConsent, privacySignal) === "granted",
    [privacySignal, storedConsent]
  );

  useEffect(() => {
    if (!measurementId || typeof window === "undefined") {
      return;
    }

    (window as unknown as Record<string, boolean>)[`ga-disable-${measurementId}`] =
      !analyticsEnabled;
  }, [analyticsEnabled]);

  if (!measurementId || !ready || !analyticsEnabled) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('consent', 'default', { analytics_storage: 'granted' });
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
            anonymize_ip: true
          });
        `}
      </Script>
    </>
  );
}
