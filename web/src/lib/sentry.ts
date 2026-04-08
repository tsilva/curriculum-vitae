const parseBoolean = (value: string | undefined): boolean | undefined => {
  if (!value) {
    return undefined;
  }

  switch (value.trim().toLowerCase()) {
    case "1":
    case "true":
    case "yes":
    case "on":
      return true;
    case "0":
    case "false":
    case "no":
    case "off":
      return false;
    default:
      return undefined;
  }
};

const parseNumber = (value: string | undefined): number | undefined => {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : undefined;
};

const isEnabledForDsn = (dsn: string | undefined, enabledOverride: boolean | undefined): boolean => {
  const productionLikeDeploy =
    process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";

  return Boolean(dsn) && (enabledOverride ?? productionLikeDeploy);
};

export const SENTRY_BROWSER_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
export const SENTRY_SERVER_DSN =
  process.env.SENTRY_DSN?.trim() || SENTRY_BROWSER_DSN;

const explicitEnablement = parseBoolean(
  process.env.NEXT_PUBLIC_SENTRY_ENABLED ?? process.env.SENTRY_ENABLED,
);

export const SENTRY_BROWSER_ENABLED = isEnabledForDsn(
  SENTRY_BROWSER_DSN,
  explicitEnablement,
);
export const SENTRY_SERVER_ENABLED = isEnabledForDsn(
  SENTRY_SERVER_DSN,
  explicitEnablement,
);

export const SENTRY_ENVIRONMENT =
  process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ??
  process.env.SENTRY_ENVIRONMENT ??
  process.env.VERCEL_ENV ??
  process.env.NODE_ENV ??
  "development";

export const SENTRY_RELEASE =
  process.env.SENTRY_RELEASE ?? process.env.GIT_COMMIT_HASH;

const explicitTraceSampleRate = parseNumber(
  process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ??
    process.env.SENTRY_TRACES_SAMPLE_RATE,
);

export const SENTRY_TRACES_SAMPLE_RATE = explicitTraceSampleRate ?? 0.1;
