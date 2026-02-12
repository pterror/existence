#!/usr/bin/env bash
# One-time setup: creates the Pages project and deploys the Worker route.
# Run from the repo root.
#
# Usage:
#   nix-shell -p nodejs pnpm --run 'bash scripts/setup-cloudflare.sh'
#
# Prerequisites:
#   - wrangler login (run separately first)
#   - para.garden zone exists in your Cloudflare account

set -euo pipefail

WRANGLER="pnpm dlx wrangler"

echo "==> Creating Cloudflare Pages project..."
$WRANGLER pages project create existence --production-branch master 2>/dev/null || echo "    (project may already exist)"

echo "==> Building deploy directory..."
rm -rf dist
mkdir dist
cp index.html dist/
cp -r css dist/
cp -r js dist/

echo "==> Deploying static site to Pages..."
$WRANGLER pages deploy dist --project-name existence --commit-dirty=true

echo "==> Deploying subpath Worker..."
cd worker
$WRANGLER deploy
cd ..

echo "==> Done. Site live at para.garden/existence"
echo ""
echo "Next steps:"
echo "  - Add CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID as GitHub repo secrets"
echo "    for automatic deploys on push."
