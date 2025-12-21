#!/bin/bash
# Script to detect which services need to be rebuilt based on Git changes
# Usage: ./scripts/detect-changes.sh [base_commit] [head_commit]
# Returns: space-separated list of service names

set -e

# Default to comparing with previous commit if no arguments provided
BASE_COMMIT=${1:-HEAD~1}
HEAD_COMMIT=${2:-HEAD}

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Detecting changes between $BASE_COMMIT and $HEAD_COMMIT...${NC}" >&2

# Get list of changed files
CHANGED_FILES=$(git diff --name-only $BASE_COMMIT $HEAD_COMMIT)

if [ -z "$CHANGED_FILES" ]; then
    echo -e "${YELLOW}No changes detected.${NC}" >&2
    exit 0
fi

echo -e "${YELLOW}Changed files:${NC}" >&2
echo "$CHANGED_FILES" >&2

# Initialize array to store services that need rebuilding
SERVICES_TO_BUILD=()

# Function to add service to build list if not already present
add_service() {
    local service=$1
    if [[ ! " ${SERVICES_TO_BUILD[@]} " =~ " ${service} " ]]; then
        SERVICES_TO_BUILD+=("$service")
    fi
}

# Check for changes in each service directory and shared libraries
for file in $CHANGED_FILES; do
    case $file in
        apps/accounts-service/*)
            add_service "accounts-service"
            ;;
        apps/api-gateway/*)
            add_service "api-gateway"
            ;;
        apps/booking-service/*)
            add_service "booking-service"
            ;;
        apps/content-service/*)
            add_service "content-service"
            ;;
        apps/notification-service/*)
            add_service "notification-service"
            ;;
        apps/orchestrator-service/*)
            add_service "orchestrator-service"
            ;;
        apps/provider-directory-service/*)
            add_service "provider-service"
            ;;
        libs/*)
            # Changes in shared libraries affect all services
            add_service "accounts-service"
            add_service "api-gateway"
            add_service "booking-service"
            add_service "content-service"
            add_service "notification-service"
            add_service "orchestrator-service"
            add_service "provider-service"
            ;;
        deployment/*)
            # Changes in deployment configs affect all services
            add_service "accounts-service"
            add_service "api-gateway"
            add_service "booking-service"
            add_service "content-service"
            add_service "notification-service"
            add_service "orchestrator-service"
            add_service "provider-service"
            ;;
        .github/workflows/*)
            # Changes in GitHub Actions workflows don't affect services
            # Skip - no services need rebuilding for workflow changes
            ;;
        package.json|pnpm-lock.yaml|tsconfig*.json|nest-cli.json)
            # Changes in root config files affect all services
            add_service "accounts-service"
            add_service "api-gateway"
            add_service "booking-service"
            add_service "content-service"
            add_service "notification-service"
            add_service "orchestrator-service"
            add_service "provider-service"
            ;;
        nginx/*)
            # Nginx changes only affect infrastructure
            add_service "infrastructure"
            ;;
    esac
done

# Output the services that need to be built
if [ ${#SERVICES_TO_BUILD[@]} -eq 0 ]; then
    echo -e "${YELLOW}No services need rebuilding.${NC}" >&2
    exit 0
fi

echo -e "${GREEN}Services to build: ${SERVICES_TO_BUILD[*]}${NC}" >&2

# Output as space-separated string for GitHub Actions (stdout only)
echo "${SERVICES_TO_BUILD[*]}"
