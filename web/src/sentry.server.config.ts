import * as Sentry from "@sentry/nextjs";
import {
  SENTRY_DSN,
  SENTRY_ENABLED,
  SENTRY_ENVIRONMENT,
  SENTRY_RELEASE,
} from "./lib/sentry";

Sentry.init({
  dsn: SENTRY_DSN,
  enabled: SENTRY_ENABLED,
  environment: SENTRY_ENVIRONMENT,
  release: SENTRY_RELEASE,
  sendDefaultPii: false,
});
