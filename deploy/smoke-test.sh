#!/usr/bin/env bash
# M5-T17 Launch smoke test
# Verifies all three services respond correctly after deployment.
set -euo pipefail

WEB_URL="${NEXT_PUBLIC_SITE_URL:-https://mspi.tn}"
ADMIN_URL="${ADMIN_URL:-https://admin.mspi.tn}"
API_URL="${API_URL:-https://mspi.tn/api/v1}"

PASS=0
FAIL=0

check() {
  local label="$1"
  local url="$2"
  local expected_status="${3:-200}"

  actual=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url")
  if [[ "$actual" == "$expected_status" ]]; then
    echo "  ✓ $label ($url) → $actual"
    ((PASS++))
  else
    echo "  ✗ $label ($url) → expected $expected_status, got $actual"
    ((FAIL++))
  fi
}

echo ""
echo "==> Smoke tests"

# Web storefront
check "Homepage (fr)"        "$WEB_URL/fr"
check "Products page (fr)"   "$WEB_URL/fr/products"
check "Quote page (fr)"      "$WEB_URL/fr/devis"
check "Homepage (ar)"        "$WEB_URL/ar"
check "Sitemap"              "$WEB_URL/sitemap.xml"
check "Robots.txt"           "$WEB_URL/robots.txt"

# API
check "API health"           "$API_URL/health"           200
check "Products endpoint"    "$API_URL/products"          200
check "Auth 401 guard"       "$API_URL/customer/orders"  401

# Admin
check "Admin login page"     "$ADMIN_URL/login"          200

echo ""
echo "Results: $PASS passed, $FAIL failed"

if [[ $FAIL -gt 0 ]]; then
  echo "SMOKE TEST FAILED — check logs above."
  exit 1
fi

echo "All smoke tests passed."
