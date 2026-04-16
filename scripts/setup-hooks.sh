#!/bin/sh
# scripts/setup-hooks.sh
#
# Run this once after cloning to install the git pre-commit hooks.
# Usage: sh scripts/setup-hooks.sh

HOOK_SRC="scripts/hooks/pre-commit"
HOOK_DEST=".git/hooks/pre-commit"

if [ ! -d ".git" ]; then
  echo "Error: run this script from the repository root."
  exit 1
fi

mkdir -p scripts/hooks
cp "$HOOK_SRC" "$HOOK_DEST"
chmod +x "$HOOK_DEST"

echo "✅ pre-commit hook installed."
echo "   Developer-credit enforcement tests will run before every commit."
