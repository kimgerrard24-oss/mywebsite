#!/usr/bin/env bash
set -e

###############################################################
# 1) Load GH_OWNER (GitHub username / org)
#    - Default = phlyphant (owner ของ GHCR จริง)
###############################################################
GH_OWNER="${1:-phlyphant}"

if [ -z "$GH_OWNER" ]; then
  echo "ERROR: Missing GitHub owner."
  echo "Usage: ./deploy.sh <gh_owner>"
  exit 1
fi

###############################################################
# 2) GHCR_TOKEN must exist in SSH environment variables
###############################################################
if [ -z "$GHCR_TOKEN" ]; then
  echo "ERROR: GHCR_TOKEN is missing in environment."
  exit 1
fi

echo "Deploy: pulling image from GHCR (owner=$GH_OWNER)"

###############################################################
# 3) Login to GHCR using token
###############################################################
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GH_OWNER" --password-stdin

###############################################################
# 4) Pull latest images (frontend image from GHCR)
###############################################################
docker compose pull --ignore-pull-failures

###############################################################
# 5) Start updated containers (no rebuild)
###############################################################
docker compose up -d --remove-orphans

###############################################################
# 6) Cleanup old images
###############################################################
docker image prune -af || true

echo "Deploy finished"
