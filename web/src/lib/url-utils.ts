const TSILVA_EU_HOST = "tsilva.eu";

function parseHttpUrl(url?: string | null): URL | null {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function normalizeHttpUrl(url?: string | null): string | null {
  const parsed = parseHttpUrl(url);
  if (!parsed) {
    return null;
  }

  const normalized = parsed.toString();
  const isRootPath = parsed.pathname === "/" && !parsed.search && !parsed.hash;

  return isRootPath && normalized.endsWith("/")
    ? normalized.slice(0, -1)
    : normalized;
}

export function isTsilvaEuUrl(url?: string | null): boolean {
  const parsed = parseHttpUrl(url);
  if (!parsed) {
    return false;
  }

  const hostname = parsed.hostname.toLowerCase();
  return hostname === TSILVA_EU_HOST || hostname.endsWith(`.${TSILVA_EU_HOST}`);
}

export function getNormalizedTsilvaEuUrl(url?: string | null): string | null {
  if (!isTsilvaEuUrl(url)) {
    return null;
  }

  return normalizeHttpUrl(url);
}
