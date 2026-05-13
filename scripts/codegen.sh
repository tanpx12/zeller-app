#!/bin/bash
# Regenerate the typed API client from the backend's openapi.json.
# The output (src/api-client/) is committed; CI verifies it matches a fresh regen.

set -euo pipefail

BASE_URL="${NEXT_PUBLIC_API_BASE:-http://127.0.0.1:8787/api/v1}"
SPEC_PATH="${SPEC_PATH:-openapi.json}"
OUT_DIR="${OUT_DIR:-src/api-client}"
README_PATH="${OUT_DIR}/README.md"

echo "Fetching OpenAPI spec from ${BASE_URL}/openapi.json"
curl -sS --fail --max-time 10 "${BASE_URL}/openapi.json" > "${SPEC_PATH}"

# Preserve the human-authored README that openapi-typescript-codegen doesn't emit.
README_BACKUP=""
if [ -f "${README_PATH}" ]; then
  README_BACKUP="$(mktemp)"
  cp "${README_PATH}" "${README_BACKUP}"
fi

echo "Generating client → ${OUT_DIR}"
rm -rf "${OUT_DIR}"
pnpm exec openapi \
  --input "${SPEC_PATH}" \
  --output "${OUT_DIR}" \
  --client fetch \
  --useUnionTypes \
  --useOptions \
  --exportSchemas false

if [ -n "${README_BACKUP}" ]; then
  mv "${README_BACKUP}" "${README_PATH}"
fi

rm -f "${SPEC_PATH}"
echo "✓ API client generated"
