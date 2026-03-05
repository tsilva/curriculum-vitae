#!/usr/bin/env python3
"""
Generate thumbnail images for all video files in galleries.
Uses ffmpeg to extract a frame from the middle of each video.
Thumbnails are saved as WebP files with the same base filename.
"""

import os
import subprocess
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor, as_completed
import json


def get_video_duration(video_path: str) -> float:
    """Get video duration in seconds using ffprobe."""
    try:
        result = subprocess.run(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                video_path,
            ],
            capture_output=True,
            text=True,
            timeout=30,
        )
        return float(result.stdout.strip())
    except Exception:
        return 0


def generate_thumbnail(video_path: str, output_path: str) -> bool:
    """Generate a thumbnail from a video using ffmpeg."""
    try:
        # Get video duration and extract frame from 25% into the video
        duration = get_video_duration(video_path)
        timestamp = max(0.5, duration * 0.25) if duration > 0 else 1

        # Generate thumbnail using ffmpeg
        # -ss: seek to timestamp
        # -vframes 1: extract 1 frame
        # -q:v 2: high quality (lower is better, 1-31 scale)
        # -vf: scale to max 480px width, maintain aspect ratio
        cmd = [
            "ffmpeg",
            "-y",
            "-i",
            video_path,
            "-ss",
            str(timestamp),
            "-vframes",
            "1",
            "-q:v",
            "2",
            "-vf",
            "scale=480:-1:flags=lanczos",
            output_path,
        ]

        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)

        if result.returncode == 0 and os.path.exists(output_path):
            return True
        else:
            print(f"  Error generating thumbnail for {video_path}: {result.stderr}")
            return False
    except subprocess.TimeoutExpired:
        print(f"  Timeout generating thumbnail for {video_path}")
        return False
    except Exception as e:
        print(f"  Error generating thumbnail for {video_path}: {e}")
        return False


def process_video(video_info: tuple) -> tuple:
    """Process a single video file."""
    video_path, output_path = video_info
    success = generate_thumbnail(video_path, output_path)
    return (video_path, output_path, success)


def main():
    root = Path(__file__).parent.parent
    galleries_path = root / "galleries"

    if not galleries_path.exists():
        print("Galleries folder not found!")
        return

    # Find all video files
    video_extensions = {".mp4", ".mov", ".mkv", ".avi", ".webm", ".m4v"}
    videos_to_process = []

    print("Scanning galleries for videos...")
    for project_dir in galleries_path.iterdir():
        if not project_dir.is_dir() or project_dir.name.startswith("_"):
            continue

        for file_path in project_dir.iterdir():
            if file_path.suffix.lower() in video_extensions:
                # Create thumbnail path with .webp extension
                thumb_filename = file_path.stem + ".thumb.webp"
                thumb_path = project_dir / thumb_filename

                # Skip if thumbnail already exists and is newer than video
                if thumb_path.exists():
                    if thumb_path.stat().st_mtime > file_path.stat().st_mtime:
                        continue

                videos_to_process.append((str(file_path), str(thumb_path)))

    if not videos_to_process:
        print("No new videos to process (all thumbnails up to date)")
        return

    print(f"Found {len(videos_to_process)} videos to process")

    # Process videos in parallel
    successful = 0
    failed = 0

    with ProcessPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(process_video, vi): vi for vi in videos_to_process}

        for future in as_completed(futures):
            video_path, output_path, success = future.result()
            if success:
                successful += 1
                print(f"✓ {Path(video_path).name}")
            else:
                failed += 1
                print(f"✗ {Path(video_path).name}")

    print(f"\nDone! Generated {successful} thumbnails, {failed} failed")


if __name__ == "__main__":
    main()
