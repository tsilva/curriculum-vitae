export type StoredAnalyticsConsent = "granted" | "denied" | "unset";

export const ANALYTICS_CONSENT_KEY = "tsilva.analytics-consent";
export const ANALYTICS_CONSENT_CHANGE_EVENT = "tsilva:analytics-consent-changed";
export const ANALYTICS_PREFERENCES_OPEN_EVENT = "tsilva:analytics-preferences-open";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function readStoredAnalyticsConsent(): StoredAnalyticsConsent {
  if (!isBrowser()) {
    return "unset";
  }

  const value = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
  return value === "granted" || value === "denied" ? value : "unset";
}

export function persistAnalyticsConsent(consent: Exclude<StoredAnalyticsConsent, "unset">) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(ANALYTICS_CONSENT_KEY, consent);
  window.dispatchEvent(
    new CustomEvent(ANALYTICS_CONSENT_CHANGE_EVENT, { detail: { consent } })
  );
}

export function getBrowserPrivacySignal(): boolean {
  if (!isBrowser()) {
    return false;
  }

  const windowWithPrivacy = window as Window & { doNotTrack?: string };
  const navigatorWithPrivacy = window.navigator as Navigator & {
    globalPrivacyControl?: boolean;
    msDoNotTrack?: string;
  };

  const dnt =
    window.navigator.doNotTrack ||
    windowWithPrivacy.doNotTrack ||
    navigatorWithPrivacy.msDoNotTrack;

  return navigatorWithPrivacy.globalPrivacyControl === true || dnt === "1" || dnt === "yes";
}

export function getEffectiveAnalyticsConsent(
  storedConsent: StoredAnalyticsConsent,
  privacySignal: boolean
): "granted" | "denied" {
  if (privacySignal) {
    return "denied";
  }

  return storedConsent === "granted" ? "granted" : "denied";
}

export function openAnalyticsPreferences() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(ANALYTICS_PREFERENCES_OPEN_EVENT));
}
