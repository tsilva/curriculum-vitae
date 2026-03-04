#!/usr/bin/env python3
"""
Convert gallery videos to H.265 (HEVC) with M1 optimization
- Parallel processing
- Skip files that don't compress
- Keep originals that are smaller
- Real-time progress with ETA
"""

import os
import sys
import subprocess
import concurrent.futures
import time
from pathlib import Path
from datetime import datetime, timedelta

GALLERIES_DIR = Path("/Users/tsilva/repos/tsilva/curriculum-vitae/galleries")
LOG_FILE = Path(f"/tmp/video_conversion_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
MAX_WORKERS = 6  # M1 Pro/Max has 8-10 cores

# M1-optimized ffmpeg settings
FFMPEG_OPTS = [
    "-c:v",
    "libx265",
    "-crf",
    "23",
    "-preset",
    "fast",
    "-tag:v",
    "hvc1",
    "-c:a",
    "copy",
    "-movflags",
    "+faststart",
    "-pix_fmt",
    "yuv420p",
    "-threads",
    "0",
    "-hide_banner",
    "-loglevel",
    "error",
    "-nostdin",
]

VIDEO_EXTS = {".mp4", ".mov", ".mkv", ".webm", ".avi", ".m4v"}

# Global stats for progress tracking
stats = {
    "converted": 0,
    "kept_original": 0,
    "skipped": 0,
    "failed": 0,
    "processed": 0,
    "start_time": None,
    "current_file": "",
}


def log(msg):
    """Log to both console and file"""
    with open(LOG_FILE, "a") as f:
        f.write(msg + "\n")


def print_progress():
    """Print current progress line"""
    s = stats
    total = s["total"]
    processed = s["processed"]

    if processed > 0 and s["start_time"]:
        elapsed = time.time() - s["start_time"]
        rate = processed / (elapsed / 60)  # files per minute

        if processed < total:
            eta_seconds = (elapsed / processed) * (total - processed)
            eta = str(timedelta(seconds=int(eta_seconds)))
        else:
            eta = "Done!"
    else:
        rate = 0
        eta = "Calculating..."

    pct = (processed / total * 100) if total > 0 else 0

    # Create progress bar
    bar_width = 30
    filled = int(bar_width * processed / total) if total > 0 else 0
    bar = "█" * filled + "░" * (bar_width - filled)

    # Clear line and print progress
    sys.stdout.write("\r" + " " * 100 + "\r")
    sys.stdout.write(
        f"[{bar}] {pct:5.1f}% | {processed}/{total} | "
        f"C:{s['converted']} K:{s['kept_original']} S:{s['skipped']} F:{s['failed']} | "
        f"{rate:.1f} files/min | ETA: {eta}"
    )
    sys.stdout.flush()


def get_codec(video_path):
    """Get video codec using ffprobe"""
    try:
        result = subprocess.run(
            [
                "ffprobe",
                "-v",
                "error",
                "-select_streams",
                "v:0",
                "-show_entries",
                "stream=codec_name",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                str(video_path),
            ],
            capture_output=True,
            text=True,
            timeout=10,
        )
        return result.stdout.strip()
    except Exception:
        return "unknown"


def get_file_size(path):
    """Get file size in bytes"""
    return path.stat().st_size


def convert_video(video_path):
    """
    Convert a single video to H.265
    Returns: (status, message, size_delta)
    """
    basename = video_path.name
    temp_output = video_path.parent / f"{video_path.stem}.tmp.mp4"

    # Update current file
    stats["current_file"] = basename[:50]

    # Check if already H.265
    codec = get_codec(video_path)
    if codec in ["hevc", "h265"]:
        return ("skipped", f"{basename}: Already H.265", 0)

    orig_size = get_file_size(video_path)

    try:
        # Run ffmpeg conversion
        cmd = ["ffmpeg", "-i", str(video_path)] + FFMPEG_OPTS + [str(temp_output)]
        result = subprocess.run(cmd, capture_output=True, timeout=300)

        if result.returncode != 0:
            if temp_output.exists():
                temp_output.unlink()
            return ("failed", f"{basename}: Conversion failed", 0)

        # Verify output
        verify = subprocess.run(
            ["ffprobe", "-v", "error", str(temp_output)], capture_output=True
        )

        if verify.returncode != 0:
            if temp_output.exists():
                temp_output.unlink()
            return ("failed", f"{basename}: Verification failed", 0)

        new_size = get_file_size(temp_output)

        # Check if compressed version is actually smaller
        if new_size >= orig_size:
            temp_output.unlink()
            return (
                "kept_original",
                f"{basename}: Kept original ({orig_size / 1024 / 1024:.1f}MB), HEVC would be {new_size / 1024 / 1024:.1f}MB",
                0,
            )

        # Success! Replace original
        temp_output.rename(video_path)

        savings = orig_size - new_size
        return (
            "converted",
            f"{basename}: {orig_size / 1024 / 1024:.1f}MB → {new_size / 1024 / 1024:.1f}MB ({(savings / orig_size) * 100:.1f}% smaller)",
            savings,
        )

    except subprocess.TimeoutExpired:
        if temp_output.exists():
            temp_output.unlink()
        return ("failed", f"{basename}: Timeout", 0)
    except Exception as e:
        if temp_output.exists():
            temp_output.unlink()
        return ("failed", f"{basename}: Error - {str(e)[:100]}", 0)


def update_stats(result):
    """Update global stats and print progress"""
    status, msg, size_delta = result
    stats["processed"] += 1

    if status == "converted":
        stats["converted"] += 1
    elif status == "kept_original":
        stats["kept_original"] += 1
    elif status == "skipped":
        stats["skipped"] += 1
    else:
        stats["failed"] += 1

    # Log detailed message
    log(msg)

    # Print progress
    print_progress()

    return size_delta


def main():
    print("=== Video Conversion to H.265 (HEVC) - M1 Optimized ===")
    log("=== Video Conversion to H.265 (HEVC) - M1 Optimized ===")

    start_msg = f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    print(start_msg)
    log(start_msg)
    log(f"Parallel workers: {MAX_WORKERS}")
    log(f"Log file: {LOG_FILE}")
    log("")

    # Find all video files
    videos = []
    for ext in VIDEO_EXTS:
        videos.extend(GALLERIES_DIR.rglob(f"*{ext}"))

    total = len(videos)
    if total == 0:
        print("No video files found!")
        return 1

    stats["total"] = total
    stats["start_time"] = time.time()

    print(f"Found {total} video files to process")
    log(f"Found {total} video files to process")

    # Calculate initial size
    initial_size = sum(get_file_size(v) for v in videos)
    print(f"Initial total video size: {initial_size / (1024**3):.2f}GB")
    log(f"Initial total video size: {initial_size / (1024**3):.2f}GB")
    print("")
    log("")

    print("Converting videos (this may take 30-60 minutes)...")
    print("")

    total_savings = 0

    # Process videos in parallel with callback for progress
    with concurrent.futures.ProcessPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(convert_video, video): video for video in videos}

        for future in concurrent.futures.as_completed(futures):
            try:
                size_saved = update_stats(future.result())
                total_savings += size_saved
            except Exception as e:
                stats["failed"] += 1
                stats["processed"] += 1
                log(f"Exception processing file: {e}")
                print_progress()

    # Final newline after progress bar
    print("\n")

    # Calculate final size
    videos_after = []
    for ext in VIDEO_EXTS:
        videos_after.extend(GALLERIES_DIR.rglob(f"*{ext}"))

    final_size = sum(get_file_size(v) for v in videos_after)
    actual_saved = initial_size - final_size

    elapsed = time.time() - stats["start_time"]

    print("=== Conversion Summary ===")
    log("=== Conversion Summary ===")

    summary_lines = [
        f"Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"Duration: {timedelta(seconds=int(elapsed))}",
        f"Total files: {total}",
        f"Successfully converted to H.265: {stats['converted']}",
        f"Kept original (HEVC would be larger): {stats['kept_original']}",
        f"Already H.265 (skipped): {stats['skipped']}",
        f"Failed: {stats['failed']}",
        "",
        "Storage Impact:",
        f"  Initial size: {initial_size / (1024**3):.2f}GB",
        f"  Final size: {final_size / (1024**3):.2f}GB",
        f"  Space saved: {actual_saved / (1024**3):.2f}GB",
        "",
        f"Log saved to: {LOG_FILE}",
    ]

    for line in summary_lines:
        print(line)
        log(line)

    return stats["failed"]


if __name__ == "__main__":
    sys.exit(main())
