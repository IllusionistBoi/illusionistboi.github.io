#!/usr/bin/env bash
set -e
git add -A
git commit --trailer "Made-with: Cursor" -m "$(cat <<'EOF'
Remove unused project metadata file from static site repo.

EOF
)"
