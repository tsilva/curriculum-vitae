#!/usr/bin/env python3
"""Retry failed video conversions with longer timeout"""

import subprocess
import sys
from pathlib import Path

GALLERIES_DIR = Path("/Users/tsilva/repos/tsilva/curriculum-vitae/galleries")
LOG_FILE = Path("/tmp/video_retry_$(date +%Y%m%d_%H%M%S).log")

# Failed files from previous run
FAILED_FILES = [
    "v011-Tynker Minecraft Mobs Tutorial — Master Hamster.mp4",
    "v004-announcement - alabama governor kay ivey_tvai.mp4",
    "v007-lab - 2.mp4",
    "v006-Coding Cup by Tynker_tvai.mp4",
    "v021-20 Block Pen Art [4555RLYUNHs]_tvai.mp4",
    "v037-How to Make a Cool Ball Pop Game with Tynker! [.mp4",
    "v033-Tynker Workshop： Create your very own animated .mp4",
    "v025-Soundscape [LUxGmmldyl0]_tvai.mp4",
    "v001-Virtual Pet_tvai.mp4",
    "v017-Crazy Contraption [j77KRxEOWzA]_tvai.mp4",
    "v020-Animated Avatar [mgx92qhRFKY]_tvai.mp4",
    "v024-Make an Arcade Game [usHbP6OX_Gs]_tvai.mp4",
    "v019-Soarin_ Strawberry [QTN9CS7ksdc]_tvai.mp4",
    "v018-Glide-O-Phone [pDVWuiRXgE0]_tvai.mp4",
    "v038-Make an Arcade Game [usHbP6OX_Gs]_505429413_tva.mp4",
    "v036-Create your very own Wipe Away AR game with Tyn.mp4",
    "v016-Clever Quips with Cow Jokes [UlwckEvT844]_tvai.mp4",
    "v064-Tynker Workshop： Brick Breaker - Learn how to b.mp4",
    "v023-Tell Codey_s Story [--fp5swFntI]_tvai.mp4",
]

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

TIMEOUT = 900  # 15 minutes


def find_file(filename):
    """Find file in galleries directory"""
    for ext in [".mp4", ".mov", ".mkv", ".webm"]:
        # Try exact match first
        for path in GALLERIES_DIR.rglob(f"*{filename}*"):
            if path.is_file():
                return path
    return None


def convert_video(video_path):
    """Convert single video with longer timeout"""
    basename = video_path.name
    temp_output = video_path.parent / f"{video_path.stem}.retry.mp4"

    orig_size = video_path.stat().st_size
    print(f"Processing: {basename} ({orig_size / 1024 / 1024:.1f}MB)")

    try:
        cmd = ["ffmpeg", "-i", str(video_path)] + FFMPEG_OPTS + [str(temp_output)]
        result = subprocess.run(cmd, capture_output=True, timeout=TIMEOUT)

        if result.returncode != 0:
            if temp_output.exists():
                temp_output.unlink()
            print(f"  ✗ Conversion failed")
            return False

        # Verify output
        verify = subprocess.run(
            ["ffprobe", "-v", "error", str(temp_output)], capture_output=True
        )
        if verify.returncode != 0:
            if temp_output.exists():
                temp_output.unlink()
            print(f"  ✗ Verification failed")
            return False

        new_size = temp_output.stat().st_size

        if new_size >= orig_size:
            temp_output.unlink()
            print(
                f"  ✓ Kept original ({orig_size / 1024 / 1024:.1f}MB), HEVC would be {new_size / 1024 / 1024:.1f}MB"
            )
            return True

        # Success!
        temp_output.rename(video_path)
        savings = (1 - new_size / orig_size) * 100
        print(
            f"  ✓ Converted: {orig_size / 1024 / 1024:.1f}MB → {new_size / 1024 / 1024:.1f}MB ({savings:.1f}% smaller)"
        )
        return True

    except subprocess.TimeoutExpired:
        if temp_output.exists():
            temp_output.unlink()
        print(f"  ✗ Timeout after {TIMEOUT / 60:.0f} minutes")
        return False
    except Exception as e:
        if temp_output.exists():
            temp_output.unlink()
        print(f"  ✗ Error: {str(e)[:100]}")
        return False


def main():
    print("=== Retry Failed Conversions (15 min timeout) ===\n")

    success = 0
    failed = 0

    for filename in FAILED_FILES:
        video_path = find_file(filename)
        if not video_path:
            print(f"✗ Not found: {filename}")
            failed += 1
            continue

        if convert_video(video_path):
            success += 1
        else:
            failed += 1

    print(f"\n=== Retry Summary ===")
    print(f"Successfully converted: {success}/{len(FAILED_FILES)}")
    print(f"Still failed: {failed}/{len(FAILED_FILES)}")

    return failed


if __name__ == "__main__":
    sys.exit(main())
