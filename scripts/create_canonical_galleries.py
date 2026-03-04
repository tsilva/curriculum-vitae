#!/usr/bin/env python3
"""
Reconcile CV projects with Google Photos Takeout albums and create canonical galleries.
Converts images to WebP, copies videos as-is.
"""

import os
import re
import json
import shutil
from pathlib import Path
from typing import Dict, List, Tuple, Optional

# Configuration
GALLERIES_DIR = Path("/Users/tsilva/repos/tsilva/curriculum-vitae/galleries")
TAKEOUT_DIR = Path("/Users/tsilva/Desktop/Takeout/Google Photos")
README_PATH = Path("/Users/tsilva/repos/tsilva/curriculum-vitae/README.md")

# Image optimization settings
WEBP_QUALITY = 85
MAX_WIDTH = 1920
MAX_HEIGHT = 1080

# Project to album name mapping (normalized for matching)
# Format: "Project Name from README": "Album Name in Takeout"
PROJECT_ALBUM_MAPPING = {
    "Help Agent": "Help Agent",
    "Block IDE - Arcade Maker": "Block IDE - Arcade Maker",
    "Block IDE - Version 3.0": "Block IDE - V3",
    "BYJU's Coding Cup": "BYJU_s Coding Cup",
    "Live Classes": "Live Classes",
    "Quizzer": "Quizzer",
    "Coaching System": "Coaching System",
    "Lynker": None,  # No gallery
    "Collaborative Learning System": "Collaborative Learning System",
    "Crystal Clash": "Crystal Clash",
    "Minecraft Education Edition Integration": None,  # No gallery
    "Mythicraft": "Mythicraft",
    "Minecraft Editor": "Minecraft Editor",
    "Tynker - PHP MongoDB ODM": None,  # No gallery
    "Karl Kustomize": "Karl Kustomize",
    "MYSWEAR - Harrods Holographic Pyramid": "MYSWEAR - Harrods Holographic Pyramid",
    "MYSWEAR - Online Store": "MYSWEAR - Online Store",
    "SpeakWrite": "SpeakWrite",
    "Details PAL": "Details PAL",
    "Don't Mess With Texas - Report a Litterer": "Don_t Mess With Texas - Report a Litterer",
    "Energi Coach": "Energi Coach",
    "TopShelf": "TopShelf",
    "TALKiT": "TALKiT",
    "US Likey": "US Likey",
    "WIN Atlas": "WIN Atlas",
    "Knod": "Knod",
    "ValetTab": "ValetTab",
    "Academy Sports - LIVE FIT": "Academy Sports - LIVE FIT",
    "Active Heroes": "Active Heroes",
    "Furtile": "Furtile",
    "Map My Fitness - Challenges": "MapMyFitness - Challenges",
    "Project Capture": "Project Capture",
    "Randid": "Randid",
    "WeGo": "WeGo",
    "Clockadoodle": "Clockadoodle",
    "China Pro Tools": "China Pro Tools",
    "Discover Your City": "Discover Your City",
    "Rocklobby": "Rocklobby",
    "Rocklobby - iOS App": "Rocklobby - iOS App",
    "Fresh Deck Poker": "Fresh Deck Poker",
    "Lugar da Jóia": "Lugar da Jóia",
    "Windows Dev Center - App Middleware Partners": "Windows Dev Center - App Middleware Partners",
    "Kaboom!": "Kaboom!",
    "Parfois B2B Portal": None,  # No gallery
    "Bargania": "Bargania",
    "A La Carte": "A La Carte",
    "Mariachi": "Mariachi",
    "Panzerini": "Panzerini",
    "Schoooools": "Schoooools",
    "Take the Bill": "Take the Bill",
    "Frontdoor": "Frontdoor",
    "Colony Framework": "Colony Framework",
    "MCH Workflow Helpdesk Innovation": None,  # No gallery
    "Nihonaid": None,  # No gallery (sourceforge link only)
    "Clube de Karate da Maia": None,  # No gallery
    "NeuralJ": "NeuralJ",
    "Clube do Paiva": None,  # No gallery (website link only)
    "European Student Moon Orbiter": None,  # No gallery
    "Computer Capers": "Computer Capers",
}


def to_kebab_case(name: str) -> str:
    """Convert project name to kebab-case folder name."""
    # Remove special characters, keep alphanumeric and spaces
    name = re.sub(r"[^\w\s-]", "", name)
    # Replace spaces and underscores with hyphens
    name = re.sub(r"[\s_]+", "-", name)
    # Convert to lowercase
    name = name.lower()
    # Remove multiple hyphens
    name = re.sub(r"-+", "-", name)
    # Strip leading/trailing hyphens
    name = name.strip("-")
    return name


def get_image_files(album_path: Path) -> List[Path]:
    """Get all image files from an album, excluding metadata."""
    image_exts = {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp", ".heic"}
    files = []
    for f in album_path.iterdir():
        if f.is_file() and f.suffix.lower() in image_exts:
            # Skip metadata JSON files
            if not f.name.endswith(".json") and "supplemental-metadata" not in f.name:
                files.append(f)
    return files


def get_video_files(album_path: Path) -> List[Path]:
    """Get all video files from an album."""
    video_exts = {".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v", ".3gp"}
    files = []
    for f in album_path.iterdir():
        if f.is_file() and f.suffix.lower() in video_exts:
            # Skip metadata JSON files
            if not f.name.endswith(".json") and "supplemental-metadata" not in f.name:
                files.append(f)
    return files


def convert_to_webp(input_path: Path, output_path: Path) -> bool:
    """Convert image to WebP format using cwebp."""
    try:
        import subprocess

        # Use cwebp with resize and quality
        cmd = [
            "cwebp",
            "-q",
            str(WEBP_QUALITY),
            "-resize",
            f"{MAX_WIDTH}",
            f"{MAX_HEIGHT}",  # Maintains aspect ratio, only downscales
            str(input_path),
            "-o",
            str(output_path),
        ]

        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode == 0:
            return True
        else:
            print(f"  ✗ cwebp failed for {input_path.name}: {result.stderr.strip()}")
            return False

    except FileNotFoundError:
        print(f"  ✗ cwebp not found. Cannot convert {input_path.name}")
        return False
    except Exception as e:
        print(f"  ✗ Error converting {input_path.name}: {e}")
        return False


def process_project(project_name: str, album_name: Optional[str]) -> Tuple[bool, str]:
    """
    Process a single project: find album, convert images, copy videos.
    Returns (success, message)
    """
    if album_name is None:
        return (False, "No gallery")

    album_path = TAKEOUT_DIR / album_name

    if not album_path.exists():
        return (False, f"Album not found: {album_name}")

    # Create canonical folder
    canonical_name = to_kebab_case(project_name)
    canonical_path = GALLERIES_DIR / canonical_name
    canonical_path.mkdir(parents=True, exist_ok=True)

    # Process images
    images = get_image_files(album_path)
    images_converted = 0
    images_failed = 0

    for img_path in images:
        output_name = f"{img_path.stem}.webp"
        output_path = canonical_path / output_name

        if convert_to_webp(img_path, output_path):
            images_converted += 1
        else:
            images_failed += 1

    # Process videos (copy as-is)
    videos = get_video_files(album_path)
    videos_copied = 0
    videos_failed = 0

    for video_path in videos:
        output_path = canonical_path / video_path.name
        try:
            shutil.copy2(video_path, output_path)
            videos_copied += 1
        except Exception as e:
            print(f"  ✗ Error copying video {video_path.name}: {e}")
            videos_failed += 1

    return (
        True,
        f"Images: {images_converted} converted, {images_failed} failed | Videos: {videos_copied} copied, {videos_failed} failed",
    )


def main():
    """Main execution function."""
    # Ensure output directory exists
    GALLERIES_DIR.mkdir(parents=True, exist_ok=True)

    print("=" * 80)
    print("CREATING CANONICAL GALLERIES FROM GOOGLE PHOTOS TAKEOUT")
    print("=" * 80)
    print(f"\nOutput directory: {GALLERIES_DIR}")
    print(f"Takeout directory: {TAKEOUT_DIR}")
    print(f"WebP Quality: {WEBP_QUALITY}")
    print(f"Max Dimensions: {MAX_WIDTH}x{MAX_HEIGHT}")
    print()

    # Process all projects
    results = {"matched": [], "no_gallery": [], "album_not_found": [], "errors": []}

    total_projects = len(PROJECT_ALBUM_MAPPING)
    processed = 0

    for project_name, album_name in PROJECT_ALBUM_MAPPING.items():
        processed += 1
        print(f"[{processed}/{total_projects}] Processing: {project_name}")

        success, message = process_project(project_name, album_name)

        if album_name is None:
            results["no_gallery"].append(project_name)
            print(f"  → Skipped: No gallery\n")
        elif not success and "Album not found" in message:
            results["album_not_found"].append((project_name, album_name))
            print(f"  → ✗ Album not found: {album_name}\n")
        elif not success:
            results["errors"].append((project_name, message))
            print(f"  → ✗ Error: {message}\n")
        else:
            results["matched"].append((project_name, album_name, message))
            print(f"  → ✓ Created: {to_kebab_case(project_name)}")
            print(f"     {message}\n")

    # Generate report
    print("=" * 80)
    print("SUMMARY REPORT")
    print("=" * 80)

    print(f"\n✓ Successfully processed: {len(results['matched'])} projects")
    for project, album, msg in results["matched"]:
        print(f"  • {to_kebab_case(project)}")

    print(
        f"\n⚠ Projects without galleries (intentionally skipped): {len(results['no_gallery'])}"
    )
    for project in results["no_gallery"]:
        print(f"  • {project}")

    if results["album_not_found"]:
        print(
            f"\n✗ Albums not found (check mapping): {len(results['album_not_found'])}"
        )
        for project, album in results["album_not_found"]:
            print(f"  • {project} → '{album}'")

    if results["errors"]:
        print(f"\n✗ Errors during processing: {len(results['errors'])}")
        for project, msg in results["errors"]:
            print(f"  • {project}: {msg}")

    print("\n" + "=" * 80)

    # Show stats
    total_folders = len(
        [
            d
            for d in GALLERIES_DIR.iterdir()
            if d.is_dir() and not d.name.startswith(".")
        ]
    )
    print(f"Total canonical folders created: {total_folders}")

    # Count files
    total_images = 0
    total_videos = 0
    for folder in GALLERIES_DIR.iterdir():
        if folder.is_dir() and not folder.name.startswith("."):
            for f in folder.iterdir():
                if f.is_file():
                    if f.suffix.lower() == ".webp":
                        total_images += 1
                    elif f.suffix.lower() in {
                        ".mp4",
                        ".mov",
                        ".avi",
                        ".mkv",
                        ".webm",
                        ".m4v",
                    }:
                        total_videos += 1

    print(f"Total WebP images: {total_images}")
    print(f"Total video files: {total_videos}")
    print("=" * 80)

    # Save report to file
    report_path = GALLERIES_DIR / "_reconciliation-report.json"
    with open(report_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nDetailed report saved to: {report_path}")
    print("✓ Done!")


if __name__ == "__main__":
    main()
