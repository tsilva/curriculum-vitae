import { APP_THEME_COLOR, SITE_DESCRIPTION } from "../../../web-seo-metadata";
import { versionedAssetPath } from "@/lib/cache-token";

export const dynamic = "force-static";

export function GET() {
  return Response.json(
    {
      name: "Tiago Silva CV",
      short_name: "Tiago CV",
      description: SITE_DESCRIPTION,
      start_url: "/",
      display: "standalone",
      background_color: "#05070A",
      theme_color: APP_THEME_COLOR,
      icons: [
        {
          src: versionedAssetPath("/brand/web-seo/android-chrome-192.png"),
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: versionedAssetPath("/brand/web-seo/android-chrome-512.png"),
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/manifest+json",
      },
    },
  );
}
