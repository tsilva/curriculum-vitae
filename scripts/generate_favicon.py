#!/usr/bin/env python3
"""
Generate favicons from the avatar image.

This script creates favicon files (ICO and PNG formats) from the avatar.webp image
located in the web/public directory.

Generated files:
- favicon.ico (multi-resolution: 16x16, 32x32, 48x48)
- favicon-32x32.png
- favicon-16x16.png (optional, for legacy browsers)
- apple-touch-icon.png (180x180)

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

    if not avatar_path.exists():
        print(f"Error: Avatar not found at {avatar_path}", file=sys.stderr)
        sys.exit(1)

    print(f"Generating favicons from {avatar_path}...")

    # Generate favicon.ico (multi-resolution)
    ico_path = web_public / "favicon.ico"
    print(f"  → {ico_path.name} (16x16, 32x32, 48x48)")
    run_magick(
        str(avatar_path),
        "-resize",
        "48x48",
        str(avatar_path),
        "-resize",
        "32x32",
        str(avatar_path),
        "-resize",
        "16x16",
        str(ico_path),
    )

    # Generate favicon-32x32.png
    png32_path = web_public / "favicon-32x32.png"
    print(f"  → {png32_path.name}")
    run_magick(str(avatar_path), "-resize", "32x32", str(png32_path))

    # Generate favicon-16x16.png
    png16_path = web_public / "favicon-16x16.png"
    print(f"  → {png16_path.name}")
    run_magick(str(avatar_path), "-resize", "16x16", str(png16_path))

    # Generate apple-touch-icon.png (180x180)
    apple_path = web_public / "apple-touch-icon.png"
    print(f"  → {apple_path.name} (180x180)")
    run_magick(str(avatar_path), "-resize", "180x180", str(apple_path))

    print("\nFavicons generated successfully!")
    print("\nFiles created:")
    for path in [ico_path, png32_path, png16_path, apple_path]:
        size = path.stat().st_size
        print(f"  - {path.name} ({size:,} bytes)")


if __name__ == "__main__":
    main()
