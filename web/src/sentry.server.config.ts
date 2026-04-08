import * as Sentry from "@sentry/nextjs";
import {
  SENTRY_SERVER_DSN,
  SENTRY_SERVER_ENABLED,
  SENTRY_ENVIRONMENT,
  SENTRY_RELEASE,
  SENTRY_TRACES_SAMPLE_RATE,
} from "./lib/sentry";

Sentry.init({
  dsn: SENTRY_SERVER_DSN,
  enabled: SENTRY_SERVER_ENABLED,
  environment: SENTRY_ENVIRONMENT,
  release: SENTRY_RELEASE,
  sendDefaultPii: false,
  tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE,
});
