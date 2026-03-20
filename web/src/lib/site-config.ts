const DEFAULT_SITE_URL = "https://www.tsilva.eu";

function normalizeSiteUrl(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL);
