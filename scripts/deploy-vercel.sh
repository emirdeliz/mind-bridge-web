#!/usr/bin/env bash
# Deploy Mind Bridge Web to Vercel.
# Usage:
#   ./scripts/deploy-vercel.sh              # preview deployment
#   ./scripts/deploy-vercel.sh --prod       # production deployment
#   SKIP_BUILD=1 ./scripts/deploy-vercel.sh # skip local build check
#
# Prerequisites:
#   - Node.js and npm
#   - Vercel account: run once `npx vercel login`
#   - First deploy links the project (creates .vercel/)

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Yarn 1 forwards its own settings as npm_config_* when a script spawns npm/npx.
# npm 10+ warns on those unknown keys (version-git-tag, argv, etc.).
unset_npm_yarn_config_leaks() {
  unset npm_config_version_git_tag \
    npm_config_argv \
    npm_config_version_commit_hooks \
    npm_config_version_git_message \
    npm_config_version_tag_prefix \
    npm_config_version_git_sign \
    npm_config_version_tag \
    2>/dev/null || true
}

detect_package_manager() {
  if [[ -f "$ROOT_DIR/yarn.lock" ]] && command -v yarn >/dev/null 2>&1; then
    echo yarn
    return
  fi
  if [[ -f "$ROOT_DIR/package-lock.json" ]] && command -v npm >/dev/null 2>&1; then
    echo npm
    return
  fi
  if command -v npm >/dev/null 2>&1; then
    echo npm
    return
  fi
  echo ""
}

run_build() {
  local package_manager
  package_manager="$(detect_package_manager)"
  if [[ "$package_manager" == yarn ]]; then
    yarn build
    return
  fi
  if [[ "$package_manager" == npm ]]; then
    unset_npm_yarn_config_leaks
    npm run build
    return
  fi
  echo "Error: yarn or npm is required." >&2
  exit 1
}

run_vercel() {
  unset_npm_yarn_config_leaks
  if ((${#@} > 0)); then
    npx --yes vercel@latest "$@"
  else
    npx --yes vercel@latest
  fi
}

PROD=false
EXTRA_ARGS=()

show_help() {
  cat <<'EOF'
Deploy mind-bridge-web to Vercel.

Usage:
  ./scripts/deploy-vercel.sh [options] [-- vercel-cli-args]

Options:
  --prod, --production   Deploy to production (default: preview)
  -h, --help             Show this help

Environment:
  SKIP_BUILD=1           Skip `npm run build` before deploy
  VERCEL_TOKEN=...       Use token auth (CI); do not commit this value

Examples:
  npm run deploy:vercel
  npm run deploy:vercel:prod
  SKIP_BUILD=1 npm run deploy:vercel -- --env NEXT_PUBLIC_AUTH_BYPASS=false

First time:
  npx vercel login
  npm run deploy:vercel
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --prod | --production)
      PROD=true
      shift
      ;;
    -h | --help)
      show_help
      exit 0
      ;;
    --)
      shift
      EXTRA_ARGS+=("$@")
      break
      ;;
    *)
      EXTRA_ARGS+=("$1")
      shift
      ;;
  esac
done

if ! command -v npm >/dev/null 2>&1 && ! command -v yarn >/dev/null 2>&1; then
  echo "Error: yarn or npm is required." >&2
  exit 1
fi

if [[ "${SKIP_BUILD:-}" != "1" ]]; then
  echo "==> Local build check..."
  run_build
else
  echo "==> Skipping local build (SKIP_BUILD=1)."
fi

DEPLOY_ARGS=(deploy --yes)
if [[ "$PROD" == true ]]; then
  DEPLOY_ARGS+=(--prod)
  echo "==> Target: production"
else
  echo "==> Target: preview"
fi

if [[ -n "${VERCEL_TOKEN:-}" ]]; then
  export VERCEL_ORG_ID="${VERCEL_ORG_ID:-}"
  export VERCEL_PROJECT_ID="${VERCEL_PROJECT_ID:-}"
  DEPLOY_ARGS+=(--token "$VERCEL_TOKEN")
fi

echo "==> Deploying with Vercel CLI..."
if ((${#EXTRA_ARGS[@]} > 0)); then
  run_vercel "${DEPLOY_ARGS[@]}" "${EXTRA_ARGS[@]}"
else
  run_vercel "${DEPLOY_ARGS[@]}"
fi

echo "==> Done."
