const rawAssetCacheToken =
  process.env.ASSET_CACHE_TOKEN ||
  process.env.GIT_COMMIT_HASH ||
  "dev";

export const assetCacheToken =
  rawAssetCacheToken.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 64) || "dev";

export function versionedAssetPath(path: string): string {
  const hashIndex = path.indexOf("#");
  const base = hashIndex === -1 ? path : path.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : path.slice(hashIndex);
  const separator = base.includes("?") ? "&" : "?";

  return `${base}${separator}v=${encodeURIComponent(assetCacheToken)}${hash}`;
}
