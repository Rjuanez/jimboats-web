#!/usr/bin/env sh
set -eu

APP_DIR="${APP_DIR:-/srv/jimboats/web}"
DEPLOY_USER="${DEPLOY_USER:-${SUDO_USER:-}}"
MEDIA_ROOT="${MEDIA_ROOT:-/var/lib/jimboats/media}"

if [ "$(id -u)" -ne 0 ]; then
  echo "Run this script with sudo so it can create /srv and /var/lib paths." >&2
  exit 1
fi

if [ -z "$DEPLOY_USER" ]; then
  echo "Set DEPLOY_USER to the Linux user that will receive SSH deploys." >&2
  exit 1
fi

install -d -m 775 "$APP_DIR"
install -d -m 775 "$MEDIA_ROOT/originals" "$MEDIA_ROOT/public"

chown -R "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR"
chown -R 1001:1001 "$MEDIA_ROOT"

if [ ! -f "$APP_DIR/.env.production.example" ]; then
  cat > "$APP_DIR/.env.production.example" <<'EOF'
APP_DOMAIN="example.com"
CADDY_EMAIL="admin@example.com"

POSTGRES_USER="jimboats"
POSTGRES_PASSWORD="change-me"
POSTGRES_DB="jimboats"
DATABASE_URL="postgresql://jimboats:change-me@db:5432/jimboats?schema=public"

MEDIA_ROOT="/var/lib/jimboats/media"
MEDIA_PUBLIC_BASE_URL="/media"
EOF
  chown "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR/.env.production.example"
fi

echo "VPS bootstrap ready."
echo "Create $APP_DIR/.env.production from $APP_DIR/.env.production.example before the first deploy."
