#!/bin/bash
# Regenerate the typed API client from the backend's openapi.json.
# The output (src/api-client/) is committed; CI verifies it matches a fresh regen.

set -euo pipefail

BASE_URL="${NEXT_PUBLIC_API_BASE:-http://127.0.0.1:8787/api/v1}"
SPEC_PATH="${SPEC_PATH:-openapi.json}"
OUT_DIR="${OUT_DIR:-src/api-client}"

echo "Fetching OpenAPI spec from ${BASE_URL}/openapi.json"
curl -sS --fail --max-time 10 "${BASE_URL}/openapi.json" > "${SPEC_PATH}"

echo "Generating client → ${OUT_DIR}"
rm -rf "${OUT_DIR}"
pnpm exec openapi \
  --input "${SPEC_PATH}" \
  --output "${OUT_DIR}" \
  --client fetch \
  --useUnionTypes \
  --useOptions \
  --exportSchemas false

rm -f "${SPEC_PATH}"
echo "✓ API client generated"
