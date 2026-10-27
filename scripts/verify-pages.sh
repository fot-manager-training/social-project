#!/usr/bin/env bash
set -euo pipefail
site_base="${1%/}"
verify_site() {
  curl --fail --silent --show-error --location --max-time 30 "$site_base/?release=${GITHUB_SHA:-local}" -o /tmp/published-index.html || return 1
  cmp _site/index.html /tmp/published-index.html || return 1
  for file in _site/*; do
    asset="${file##*/}"
    curl --fail --silent --show-error --location --max-time 30 "$site_base/$asset" -o "/tmp/published-$asset" || return 1
    cmp "$file" "/tmp/published-$asset" || return 1
  done
}
for attempt in {1..12}; do
  if verify_site; then
    echo 'Published HTML and all versioned assets match this release.'
    exit 0
  fi
  echo "Waiting for Pages release propagation (attempt $attempt/12)."
  sleep 5
done
echo 'Published site does not match this release.' >&2
exit 1
