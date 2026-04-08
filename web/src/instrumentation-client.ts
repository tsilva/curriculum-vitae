import {
  SENTRY_BROWSER_DSN,
  SENTRY_BROWSER_ENABLED,
  SENTRY_ENVIRONMENT,
  SENTRY_RELEASE,
  SENTRY_TRACES_SAMPLE_RATE,
} from "./lib/sentry";

declare global {
  interface Window {
    __sentryTest?: () => never;
  }
}

async function initSentryClient() {
  if (!SENTRY_BROWSER_ENABLED || !SENTRY_BROWSER_DSN) {
    return;
  }

  const Sentry = await import("@sentry/nextjs");

  Sentry.init({
    dsn: SENTRY_BROWSER_DSN,
    enabled: SENTRY_BROWSER_ENABLED,
    environment: SENTRY_ENVIRONMENT,
    release: SENTRY_RELEASE,
    sendDefaultPii: false,
    tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE,
  });

  window.__sentryTest = () => {
    const error = new Error("Sentry test exception triggered via window.__sentryTest()");

    Sentry.captureException(error);

    throw error;
  };
}

if (typeof window !== "undefined") {
  const boot = () => {
    void initSentryClient();
  };

  const requestIdleCallback = globalThis.requestIdleCallback?.bind(globalThis);

  if (requestIdleCallback) {
    requestIdleCallback(boot, { timeout: 2000 });
  } else {
    globalThis.setTimeout(boot, 1);
  }
}

export function onRouterTransitionStart() {}
