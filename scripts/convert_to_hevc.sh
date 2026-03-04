#!/bin/bash
# Convert all gallery videos to H.265 (HEVC) for better compression
# Preserves quality while reducing file size by ~40-50%

set -euo pipefail

GALLERIES_DIR="/Users/tsilva/repos/tsilva/curriculum-vitae/galleries"
LOG_FILE="/tmp/video_conversion_$(date +%Y%m%d_%H%M%S).log"

# H.265 encoding settings
# CRF 23 = visually lossless for H.265 (equivalent to CRF 18-20 in H.264)
# Preset medium = good balance of speed vs compression
# Tag v1 = indicates H.265 Main Profile for browser compatibility
FFMPEG_OPTS="-c:v libx265 -crf 23 -preset medium -tag:v hvc1 -c:a copy -movflags +faststart -pix_fmt yuv420p"

echo "=== Video Conversion to H.265 (HEVC) ===" | tee -a "$LOG_FILE"
echo "Started: $(date)" | tee -a "$LOG_FILE"
echo "Log file: $LOG_FILE" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Count total video files
TOTAL=$(find "$GALLERIES_DIR" -type f \( -name "*.mp4" -o -name "*.mov" -o -name "*.mkv" -o -name "*.webm" -o -name "*.avi" -o -name "*.m4v" \) | wc -l)

if [ "$TOTAL" -eq 0 ]; then
    echo "No video files found in $GALLERIES_DIR" | tee -a "$LOG_FILE"
    exit 1
fi

echo "Found $TOTAL video files to process" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Calculate initial total size
INITIAL_SIZE=$(find "$GALLERIES_DIR" -type f \( -name "*.mp4" -o -name "*.mov" -o -name "*.mkv" -o -name "*.webm" -o -name "*.avi" -o -name "*.m4v" \) -exec stat -f%z {} + | awk '{sum+=$1} END {printf "%.2f", sum/1024/1024/1024}')
echo "Initial total video size: ${INITIAL_SIZE}GB" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Process each video
SUCCESS=0
FAILED=0
SKIPPED=0
NUM=0

find "$GALLERIES_DIR" -type f \( -name "*.mp4" -o -name "*.mov" -o -name "*.mkv" -o -name "*.webm" -o -name "*.avi" -o -name "*.m4v" \) | while read -r VIDEO; do
    NUM=$((NUM+1))
    BASENAME=$(basename "$VIDEO")
    
    echo "[$NUM/$TOTAL] Processing: $BASENAME" | tee -a "$LOG_FILE"
    
    # Check if already H.265
    CURRENT_CODEC=$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "$VIDEO" 2>/dev/null || echo "unknown")
    
    if [ "$CURRENT_CODEC" = "hevc" ] || [ "$CURRENT_CODEC" = "h265" ]; then
        echo "  ✓ Already H.265, skipping" | tee -a "$LOG_FILE"
        SKIPPED=$((SKIPPED+1))
        continue
    fi
    
    # Create temp output file
    TEMP_OUTPUT="${VIDEO}.tmp.mp4"
    
    # Convert video
    if ffmpeg -hide_banner -loglevel warning -nostdin -i "$VIDEO" $FFMPEG_OPTS "$TEMP_OUTPUT" 2>>"$LOG_FILE"; then
        # Verify the output is valid
        if ffprobe -v error "$TEMP_OUTPUT" >/dev/null 2>&1; then
            # Get file sizes for logging
            ORIG_SIZE=$(stat -f%z "$VIDEO" | awk '{printf "%.1f", $1/1024/1024}')
            NEW_SIZE=$(stat -f%z "$TEMP_OUTPUT" | awk '{printf "%.1f", $1/1024/1024}')
            
            # Calculate savings percentage
            SAVINGS=$(echo "$ORIG_SIZE $NEW_SIZE" | awk '{printf "%.1f", (1-$2/$1)*100}')
            
            # Replace original with converted file
            mv "$TEMP_OUTPUT" "$VIDEO"
            
            echo "  ✓ Converted: ${ORIG_SIZE}MB → ${NEW_SIZE}MB (${SAVINGS}% smaller)" | tee -a "$LOG_FILE"
            SUCCESS=$((SUCCESS+1))
        else
            echo "  ✗ Conversion verification failed: $BASENAME" | tee -a "$LOG_FILE"
            rm -f "$TEMP_OUTPUT"
            FAILED=$((FAILED+1))
        fi
    else
        echo "  ✗ Conversion failed: $BASENAME" | tee -a "$LOG_FILE"
        rm -f "$TEMP_OUTPUT"
        FAILED=$((FAILED+1))
    fi
    
    echo "" | tee -a "$LOG_FILE"
done

# Calculate final size
FINAL_SIZE=$(find "$GALLERIES_DIR" -type f \( -name "*.mp4" -o -name "*.mov" -o -name "*.mkv" -o -name "*.webm" -o -name "*.avi" -o -name "*.m4v" \) -exec stat -f%z {} + | awk '{sum+=$1} END {printf "%.2f", sum/1024/1024/1024}')
SAVED=$(echo "$INITIAL_SIZE $FINAL_SIZE" | awk '{printf "%.2f", $1-$2}')

echo "=== Conversion Summary ===" | tee -a "$LOG_FILE"
echo "Completed: $(date)" | tee -a "$LOG_FILE"
echo "Total files: $TOTAL" | tee -a "$LOG_FILE"
echo "Successfully converted: $SUCCESS" | tee -a "$LOG_FILE"
echo "Already H.265 (skipped): $SKIPPED" | tee -a "$LOG_FILE"
echo "Failed: $FAILED" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Storage Impact:" | tee -a "$LOG_FILE"
echo "  Initial size: ${INITIAL_SIZE}GB" | tee -a "$LOG_FILE"
echo "  Final size: ${FINAL_SIZE}GB" | tee -a "$LOG_FILE"
echo "  Space saved: ${SAVED}GB" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Log saved to: $LOG_FILE"

exit $FAILED
