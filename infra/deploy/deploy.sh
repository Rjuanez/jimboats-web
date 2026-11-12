#!/usr/bin/env sh
set -eu

APP_DIR="${APP_DIR:-/srv/jimboats/web}"
COMPOSE_FILE="${COMPOSE_FILE:-$APP_DIR/infra/production/docker-compose.yml}"
ENV_FILE="${ENV_FILE:-$APP_DIR/.env.production}"
REQUESTED_IMAGE_REPOSITORY="${IMAGE_REPOSITORY:-}"
REQUESTED_IMAGE_TAG="${IMAGE_TAG:-}"
REQUESTED_ADS_CONFIG="${PIPELINE_CHATGPT_ADS_CONFIG:-0}"
REQUESTED_ADS_ENABLED="${PIPELINE_CHATGPT_ADS_ENABLED:-false}"
REQUESTED_ADS_PIXEL_ID="${PIPELINE_CHATGPT_ADS_PIXEL_ID:-}"
REQUESTED_ADS_CAPI_KEY="${PIPELINE_CHATGPT_ADS_CAPI_KEY:-}"
REQUESTED_ADS_VALIDATE_ONLY="${PIPELINE_CHATGPT_ADS_VALIDATE_ONLY:-true}"

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

# GitHub's Ads settings override .env.production, including explicit deactivation.
# Exported values also take precedence over Compose's --env-file interpolation.
if [ "$REQUESTED_ADS_CONFIG" = "1" ]; then
  export CHATGPT_ADS_ENABLED="$REQUESTED_ADS_ENABLED"
  export CHATGPT_ADS_PIXEL_ID="$REQUESTED_ADS_PIXEL_ID"
  export CHATGPT_ADS_CAPI_KEY="$REQUESTED_ADS_CAPI_KEY"
  export CHATGPT_ADS_VALIDATE_ONLY="$REQUESTED_ADS_VALIDATE_ONLY"
fi

if [ -n "$REQUESTED_IMAGE_REPOSITORY" ]; then
  IMAGE_REPOSITORY="$REQUESTED_IMAGE_REPOSITORY"
fi

if [ -n "$REQUESTED_IMAGE_TAG" ]; then
  IMAGE_TAG="$REQUESTED_IMAGE_TAG"
fi

: "${APP_DOMAIN:?APP_DOMAIN is required}"
: "${IMAGE_REPOSITORY:?IMAGE_REPOSITORY is required}"
: "${IMAGE_TAG:?IMAGE_TAG is required}"

# Refuse an incomplete Ads activation before changing running services.
if [ "${CHATGPT_ADS_ENABLED:-false}" = "true" ]; then
  : "${CHATGPT_ADS_PIXEL_ID:?CHATGPT_ADS_PIXEL_ID is required when Ads is enabled}"
  : "${CHATGPT_ADS_CAPI_KEY:?CHATGPT_ADS_CAPI_KEY is required when Ads is enabled}"
  : "${PUBLIC_SITE_URL:?PUBLIC_SITE_URL is required when Ads is enabled}"
fi

APP_IMAGE="${IMAGE_REPOSITORY}:${IMAGE_TAG}"
export APP_IMAGE IMAGE_TAG

if [ -n "${GHCR_USERNAME:-}" ] && [ -n "${GHCR_TOKEN:-}" ]; then
  printf '%s' "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin
fi

pull_with_retry() {
  image="$1"
  attempts="${PULL_RETRIES:-5}"
  delay_seconds="${PULL_RETRY_DELAY_SECONDS:-15}"
  attempt=1

  while [ "$attempt" -le "$attempts" ]; do
    echo "Pulling $image (attempt $attempt/$attempts)"

    if docker pull "$image"; then
      return 0
    fi

    if [ "$attempt" -eq "$attempts" ]; then
      echo "Failed to pull $image after $attempts attempts." >&2
      return 1
    fi

    attempt=$((attempt + 1))
    sleep "$delay_seconds"
  done
}

pull_with_retry "$APP_IMAGE"
pull_with_retry "caddy:2-alpine"
pull_with_retry "postgres:17-alpine"

# Pause the previous worker before migrations or a configuration change.
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" stop ads-conversion-worker
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d db
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" run --rm app prisma migrate deploy --config ./prisma.config.mjs
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d app media-worker booking-calendar-sync-worker booking-hold-expiration-worker notification-worker caddy
if [ "${CHATGPT_ADS_ENABLED:-false}" = "true" ]; then
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d ads-conversion-worker
fi
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
