import * as Sentry from "@sentry/nextjs";
import {
  SENTRY_DSN,
  SENTRY_ENABLED,
  SENTRY_ENVIRONMENT,
  SENTRY_RELEASE,
} from "./lib/sentry";

declare global {
  interface Window {
    __sentryTest?: () => never;
  }
}

Sentry.init({
  dsn: SENTRY_DSN,
  enabled: SENTRY_ENABLED,
  environment: SENTRY_ENVIRONMENT,
  release: SENTRY_RELEASE,
  sendDefaultPii: false,
});

if (typeof window !== "undefined") {
  window.__sentryTest = () => {
    const error = new Error("Sentry test exception triggered via window.__sentryTest()");

    Sentry.captureException(error);

    throw error;
  };
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
