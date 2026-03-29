#!/usr/bin/env bash
set -euo pipefail

# Deploy Zuroy to DigitalOcean droplet
# Usage: ./scripts/deploy.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load env vars
if [ -f "$ROOT_DIR/.env.production" ]; then
  set -a
  source "$ROOT_DIR/.env.production"
  set +a
fi

REGISTRY="ghcr.io"
REPO="rnadela/zuroy"
API_IMAGE="$REGISTRY/$REPO/api"
PORTAL_IMAGE="$REGISTRY/$REPO/portal"
CONNECT_IMAGE="$REGISTRY/$REPO/connect"
TAG="$(git rev-parse --short HEAD)"

SSH_KEY="${SSH_KEY:-$HOME/.ssh/zuroy_deploy}"
SSH_HOST="${SSH_HOST:-deploy@$(cd "$ROOT_DIR/infra/terraform" && terraform output -raw droplet_ip 2>/dev/null || echo 'DROPLET_IP')}"

echo "==> Pushing code to origin..."
git push origin main

echo "==> Logging in to GHCR..."
echo "${GHCR_TOKEN:?Set GHCR_TOKEN in .env.production}" | docker login ghcr.io -u rnadela --password-stdin

echo "==> Building API image (linux/amd64)..."
docker build --platform linux/amd64 -f infra/docker/api.Dockerfile \
  -t "$API_IMAGE:$TAG" -t "$API_IMAGE:latest" .

echo "==> Building Portal image (linux/amd64)..."
docker build --platform linux/amd64 -f infra/docker/portal.Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=https://api.zuroy.com \
  -t "$PORTAL_IMAGE:$TAG" -t "$PORTAL_IMAGE:latest" .

echo "==> Building Connect image (linux/amd64)..."
docker build --platform linux/amd64 -f infra/docker/connect.Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=https://api.zuroy.com \
  -t "$CONNECT_IMAGE:$TAG" -t "$CONNECT_IMAGE:latest" .

echo "==> Pushing images to GHCR..."
docker push "$API_IMAGE:$TAG"
docker push "$API_IMAGE:latest"
docker push "$PORTAL_IMAGE:$TAG"
docker push "$PORTAL_IMAGE:latest"
docker push "$CONNECT_IMAGE:$TAG"
docker push "$CONNECT_IMAGE:latest"

echo "==> Cleaning up local images..."
docker image prune -af --filter "until=24h" 2>/dev/null || true

echo "==> Deploying to droplet..."
ssh -i "$SSH_KEY" "$SSH_HOST" bash -s "$API_IMAGE:$TAG" "$PORTAL_IMAGE:$TAG" "$CONNECT_IMAGE:$TAG" <<'REMOTE'
set -euo pipefail
API_TAG="$1"
PORTAL_TAG="$2"
CONNECT_TAG="$3"
cd /opt/zuroy

echo "Pulling new images..."
docker pull "$API_TAG"
docker pull "$PORTAL_TAG"
docker pull "$CONNECT_TAG"

echo "Updating .env..."
sed -i "s|API_IMAGE=.*|API_IMAGE=$API_TAG|" .env
sed -i "s|PORTAL_IMAGE=.*|PORTAL_IMAGE=$PORTAL_TAG|" .env
sed -i "s|CONNECT_IMAGE=.*|CONNECT_IMAGE=$CONNECT_TAG|" .env

echo "Running migrations..."
docker compose run --rm api sh -c "cd /app && npx prisma@6 migrate deploy --schema ./packages/database/prisma/schema.prisma"

echo "Deploying..."
docker compose up -d --remove-orphans

echo "Cleaning up..."
docker image prune -a -f

echo "Health check (15s)..."
sleep 15
docker compose exec -T api wget -qO- http://localhost:3001/v1/health && echo "  API: OK"
docker compose exec -T portal wget -qO- http://localhost:3000 > /dev/null && echo "  Portal: OK"
docker compose exec -T connect wget -qO- http://localhost:3002 > /dev/null && echo "  Connect: OK"

echo "Deploy complete!"
REMOTE
