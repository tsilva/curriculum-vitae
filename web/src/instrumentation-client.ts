import * as Sentry from "@sentry/nextjs";
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

Sentry.init({
  dsn: SENTRY_BROWSER_DSN,
  enabled: SENTRY_BROWSER_ENABLED,
  environment: SENTRY_ENVIRONMENT,
  release: SENTRY_RELEASE,
  sendDefaultPii: false,
  tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE,
});

if (typeof window !== "undefined") {
  window.__sentryTest = () => {
    const error = new Error("Sentry test exception triggered via window.__sentryTest()");

    Sentry.captureException(error);

    throw error;
  };
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
