#!/usr/bin/env bash
# MSPI Deployment Script
# Usage: ./deploy/deploy.sh [--skip-migrate]
set -euo pipefail

DEPLOY_DIR="/var/www/mspi"
SKIP_MIGRATE="${1:-}"

echo "==> Pulling latest code..."
git pull origin master

echo "==> Installing dependencies..."
pnpm install --frozen-lockfile

echo "==> Generating Prisma client..."
pnpm --filter api exec prisma generate

if [[ "$SKIP_MIGRATE" != "--skip-migrate" ]]; then
  echo "==> Running database migrations..."
  pnpm --filter api exec prisma migrate deploy
fi

echo "==> Building all apps..."
pnpm build

echo "==> Reloading PM2 processes..."
pm2 reload ecosystem.config.js --env production

echo "==> Running smoke tests..."
bash deploy/smoke-test.sh

echo "✓ Deployment complete."
