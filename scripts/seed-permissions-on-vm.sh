#!/bin/bash
# Chạy permission seed idempotent trên VM (container medicalink-accounts đã chạy).
# Dùng bởi GitHub Actions workflow_dispatch — không build/deploy image.
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

if [ -z "${VM_HOST:-}" ] || [ -z "${VM_USER:-}" ] || [ -z "${VM_SSH_KEY:-}" ]; then
  echo -e "${RED}VM_HOST, VM_USER, VM_SSH_KEY are required${NC}" >&2
  exit 1
fi

SSH_KEY_FILE=$(mktemp)
trap 'rm -f "$SSH_KEY_FILE"' EXIT
echo "$VM_SSH_KEY" > "$SSH_KEY_FILE"
chmod 600 "$SSH_KEY_FILE"

ssh_exec() {
  ssh -i "$SSH_KEY_FILE" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$VM_USER@$VM_HOST" "$@"
}

echo -e "${CYAN}[SEED] Running permission-seeds in medicalink-accounts…${NC}"
if ! ssh_exec "docker exec medicalink-accounts tsx apps/accounts-service/scripts/permission-seeds.ts"; then
  echo -e "${RED}[SEED] Failed — đảm bảo container medicalink-accounts đang Up và image đã có tsx + script (build accounts mới).${NC}" >&2
  exit 1
fi
echo -e "${GREEN}[SEED] Done.${NC}"
