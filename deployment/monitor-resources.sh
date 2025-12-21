#!/bin/bash
# Resource Monitoring Script for MedicaLink Deployment
# Usage: ./monitor-resources.sh [duration_in_seconds]

DURATION=${1:-300}  # Default 5 minutes
LOG_FILE="deployment-resources-$(date +%Y%m%d_%H%M%S).log"

echo "Starting resource monitoring for ${DURATION} seconds..."
echo "Log file: ${LOG_FILE}"
echo "Timestamp,Memory_Used_MB,Memory_Used_%,CPU_Load_1min,Disk_Used_%,Docker_Containers" > "$LOG_FILE"

START_TIME=$(date +%s)
END_TIME=$((START_TIME + DURATION))

while [ $(date +%s) -lt $END_TIME ]; do
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Memory info
    MEMORY_INFO=$(free -m | awk 'NR==2{printf "%d,%.1f", $3, $3/$2*100}')
    
    # CPU load (1 minute average)
    CPU_LOAD=$(uptime | awk -F'load average:' '{print $2}' | cut -d, -f1 | sed 's/^[ \t]*//')
    
    # Disk usage
    DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    # Docker containers count
    DOCKER_CONTAINERS=$(docker ps -q | wc -l)
    
    # Log to file
    echo "${TIMESTAMP},${MEMORY_INFO},${CPU_LOAD},${DISK_USAGE},${DOCKER_CONTAINERS}" >> "$LOG_FILE"
    
    # Display current status
    echo "$(date '+%H:%M:%S') - Memory: $(echo $MEMORY_INFO | cut -d, -f2)%, CPU: ${CPU_LOAD}, Disk: ${DISK_USAGE}%, Containers: ${DOCKER_CONTAINERS}"
    
    sleep 5
done

echo "Monitoring completed. Log saved to: ${LOG_FILE}"

# Generate summary
echo ""
echo "=== RESOURCE USAGE SUMMARY ==="
echo "Peak Memory Usage: $(awk -F, 'NR>1 {if($3>max) max=$3} END {printf "%.1f%%", max}' "$LOG_FILE")"
echo "Peak CPU Load: $(awk -F, 'NR>1 {if($4>max) max=$4} END {print max}' "$LOG_FILE")"
echo "Max Containers: $(awk -F, 'NR>1 {if($6>max) max=$6} END {print max}' "$LOG_FILE")"