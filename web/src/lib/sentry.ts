export const SENTRY_DSN =
  process.env.NEXT_PUBLIC_SENTRY_DSN ??
  "https://d2db43df4a6a222bdd66cc0c24960c9c@o4511061698478080.ingest.de.sentry.io/4511077626544208";

export const SENTRY_ENABLED = Boolean(SENTRY_DSN);

export const SENTRY_ENVIRONMENT =
  process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV;

export const SENTRY_RELEASE =
  process.env.SENTRY_RELEASE ?? process.env.GIT_COMMIT_HASH;
