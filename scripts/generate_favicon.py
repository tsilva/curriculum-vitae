#!/usr/bin/env python3
"""
Generate favicons from the avatar image.

This script creates favicon files (ICO and PNG formats) from the avatar.webp image
located in the web/public directory.

Generated files:
- web/public/brand/web-seo/favicon/favicon.ico (multi-resolution)
- web/public/brand/web-seo/favicon/favicon-16.png
- web/public/brand/web-seo/favicon/favicon-32.png
- web/public/brand/web-seo/favicon/favicon-48.png
- web/public/brand/web-seo/apple-touch-icon.png
- web/public/brand/web-seo/android-chrome-192.png
- web/public/brand/web-seo/android-chrome-512.png

Usage:
    python generate_favicon.py
"""

import subprocess
import sys
from pathlib import Path


def run_magick(*args):
    """Run ImageMagick command and handle errors."""
    cmd = ["magick"] + list(args)
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running magick: {result.stderr}", file=sys.stderr)
        sys.exit(1)
    return result


def main():
    # Directories
    web_public = Path(__file__).parent.parent / "web" / "public"
    avatar_path = web_public / "avatar.webp"
    web_seo = web_public / "brand" / "web-seo"
    favicon_dir = web_seo / "favicon"

    if not avatar_path.exists():
        print(f"Error: Avatar not found at {avatar_path}", file=sys.stderr)
        sys.exit(1)

    favicon_dir.mkdir(parents=True, exist_ok=True)
    print(f"Generating web SEO icons from {avatar_path}...")

    # Generate favicon.ico (multi-resolution)
    ico_path = favicon_dir / "favicon.ico"
    print(f"  → {ico_path.relative_to(web_public)} (16x16, 32x32, 48x48)")
    run_magick(
        str(avatar_path),
        "-define",
        "icon:auto-resize=48,32,16",
        str(ico_path),
    )

    sized_icons = [
        (favicon_dir / "favicon-16.png", 16),
        (favicon_dir / "favicon-32.png", 32),
        (favicon_dir / "favicon-48.png", 48),
        (web_seo / "apple-touch-icon.png", 180),
        (web_seo / "android-chrome-192.png", 192),
        (web_seo / "android-chrome-512.png", 512),
    ]

    for path, size in sized_icons:
        print(f"  → {path.relative_to(web_public)} ({size}x{size})")
        run_magick(str(avatar_path), "-resize", f"{size}x{size}", str(path))

    print("\nWeb SEO icons generated successfully!")
    print("\nFiles created:")
    for path in [ico_path] + [path for path, _ in sized_icons]:
        size = path.stat().st_size
        print(f"  - {path.relative_to(web_public)} ({size:,} bytes)")


if __name__ == "__main__":
    main()
