#!/usr/bin/env sh
set -eu

APP_DIR="${APP_DIR:-/srv/jimboats/web}"
COMPOSE_FILE="${COMPOSE_FILE:-$APP_DIR/infra/production/docker-compose.yml}"
ENV_FILE="${ENV_FILE:-$APP_DIR/.env.production}"
REQUESTED_IMAGE_REPOSITORY="${IMAGE_REPOSITORY:-}"
REQUESTED_IMAGE_TAG="${IMAGE_TAG:-}"

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "Missing compose file: $COMPOSE_FILE" >&2
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing production env file: $ENV_FILE" >&2
  exit 1
fi

set -a
. "$ENV_FILE"
set +a

if [ -n "$REQUESTED_IMAGE_REPOSITORY" ]; then
  IMAGE_REPOSITORY="$REQUESTED_IMAGE_REPOSITORY"
fi

if [ -n "$REQUESTED_IMAGE_TAG" ]; then
  IMAGE_TAG="$REQUESTED_IMAGE_TAG"
fi

: "${APP_DOMAIN:?APP_DOMAIN is required}"
: "${IMAGE_REPOSITORY:?IMAGE_REPOSITORY is required}"
: "${IMAGE_TAG:?IMAGE_TAG is required}"

APP_IMAGE="${IMAGE_REPOSITORY}:${IMAGE_TAG}"
export APP_IMAGE IMAGE_TAG

if [ -n "${GHCR_USERNAME:-}" ] && [ -n "${GHCR_TOKEN:-}" ]; then
  printf '%s' "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin
fi

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" pull
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d db
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" run --rm app prisma migrate deploy --config ./prisma.config.mjs
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d app media-worker caddy
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps

curl \
  --fail \
  --show-error \
  --silent \
  --location \
  --connect-timeout 10 \
  --retry 12 \
  --retry-delay 5 \
  --retry-connrefused \
  "https://$APP_DOMAIN/" >/dev/null

echo "Deploy completed for $APP_IMAGE"
