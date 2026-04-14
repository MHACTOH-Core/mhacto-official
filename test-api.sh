#!/usr/bin/env bash
# =============================================================================
# MHACTO API — Full System Test Suite
# Usage: bash test-api.sh [BASE_URL]
# Default BASE_URL: http://localhost:8000
# =============================================================================

BASE="${1:-http://localhost:8000}"
API="$BASE/api"

PASS=0
FAIL=0
SKIP=0
TOKEN=""
CREATED_GUIDE_ID=""
CREATED_APPT_ID=""
CREATED_POST_ID=""
CREATED_INQUIRY_ID=""

# ── Colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GRN='\033[0;32m'
YLW='\033[0;33m'
CYN='\033[0;36m'
BLD='\033[1m'
RST='\033[0m'

# ── Helpers ──────────────────────────────────────────────────────────────────
section() { echo -e "\n${BLD}${CYN}══ $1 ══${RST}"; }

pass() { echo -e "  ${GRN}✔${RST}  $1"; ((PASS++)); }

fail() { echo -e "  ${RED}✘${RST}  $1"; ((FAIL++)); }

skip() { echo -e "  ${YLW}–${RST}  $1 (skipped)"; ((SKIP++)); }

# Runs a curl call. Args: label method url [extra curl args...]
# Returns http status code via $STATUS and body via $BODY
req() {
  local label="$1" method="$2" url="$3"
  shift 3
  local response
  response=$(curl -s -w '\n__STATUS__%{http_code}' -X "$method" "$url" "$@")
  BODY=$(echo "$response" | sed '$d')
  STATUS=$(echo "$response" | tail -1 | sed 's/__STATUS__//')
}

# Check response code and optional JSON field
assert_status() {
  local label="$1" expected="$2"
  if [[ "$STATUS" == "$expected" ]]; then
    pass "$label → HTTP $STATUS"
  else
    fail "$label → expected $expected, got $STATUS | $BODY"
  fi
}

assert_field() {
  local label="$1" field="$2"
  if echo "$BODY" | grep -q "\"$field\""; then
    pass "$label → field '$field' present"
  else
    fail "$label → field '$field' missing | $BODY"
  fi
}

auth_header() {
  if [[ -z "$TOKEN" ]]; then
    echo ""
  else
    echo "Authorization: Bearer $TOKEN"
  fi
}

# =============================================================================
# 0. CONNECTIVITY CHECK
# =============================================================================
section "0. Connectivity"
req "ping" GET "$BASE/"
if [[ "$STATUS" =~ ^[2-5][0-9]{2}$ ]]; then
  pass "Backend reachable at $BASE (HTTP $STATUS)"
else
  fail "Backend unreachable at $BASE — aborting"
  exit 1
fi

# =============================================================================
# 1. AUTH
# =============================================================================
section "1. Auth"

# 1a. Login — wrong credentials
req "login-wrong" POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"nobody@test.com","password":"wrongpass"}'
assert_status "POST /auth/login (bad creds)" 401

# 1b. Login — missing fields
req "login-empty" POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{}'
assert_status "POST /auth/login (empty body)" 400

# 1c. Login — valid super_admin
req "login-ok" POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"mhacto.municipalityofbocaue@gmail.com","password":"admin123"}'

if [[ "$STATUS" == "200" ]]; then
  pass "POST /auth/login (super_admin) → HTTP 200"
  TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)
  if [[ -n "$TOKEN" ]]; then
    pass "JWT token received (${#TOKEN} chars)"
  else
    fail "JWT token missing from response"
  fi
else
  # Try seed password
  req "login-seed" POST "$API/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@mhacto.gov.ph","password":"admin123"}'
  if [[ "$STATUS" == "200" ]]; then
    pass "POST /auth/login (admin@mhacto.gov.ph / admin123) → HTTP 200"
    TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [[ -n "$TOKEN" ]]; then
      pass "JWT token received (${#TOKEN} chars)"
    else
      fail "JWT token missing"
    fi
  else
    fail "POST /auth/login failed ($STATUS) — authenticated tests will be skipped"
  fi
fi

# 1d. GET /auth/me — unauthenticated
req "me-noauth" GET "$API/auth/me"
assert_status "GET /auth/me (no token)" 401

# 1e. GET /auth/me — with token
if [[ -n "$TOKEN" ]]; then
  req "me-ok" GET "$API/auth/me" -H "$(auth_header)"
  assert_status "GET /auth/me (valid token)" 200
  assert_field "GET /auth/me body" "email"
else
  skip "GET /auth/me (no token available)"
fi

# 1f. POST /auth/refresh — with token
if [[ -n "$TOKEN" ]]; then
  req "refresh" POST "$API/auth/refresh" -H "$(auth_header)"
  if [[ "$STATUS" =~ ^(200|401)$ ]]; then
    pass "POST /auth/refresh → HTTP $STATUS (expected 200 or 401)"
  else
    fail "POST /auth/refresh → unexpected $STATUS"
  fi
else
  skip "POST /auth/refresh (no token)"
fi

# =============================================================================
# 2. PUBLIC ENDPOINTS
# =============================================================================
section "2. Public — no auth required"

# 2a. GET /posts (published only)
req "posts-pub" GET "$API/posts"
assert_status "GET /posts (public)" 200

# 2b. GET /destinations
req "destinations" GET "$API/destinations"
assert_status "GET /destinations" 200

# 2c. GET /settings
req "settings-pub" GET "$API/settings"
assert_status "GET /settings (public)" 200

# 2d. GET /heroes
req "heroes-pub" GET "$API/heroes"
assert_status "GET /heroes" 200

# 2e. GET /home/hero
req "home-hero" GET "$API/home/hero"
assert_status "GET /home/hero" 200

# 2f. GET /home/spotlight
req "home-spotlight" GET "$API/home/spotlight"
assert_status "GET /home/spotlight" 200

# 2g. GET /home/milestones
req "home-milestones" GET "$API/home/milestones"
assert_status "GET /home/milestones" 200

# 2h. GET /home/landmarks
req "home-landmarks" GET "$API/home/landmarks"
assert_status "GET /home/landmarks" 200

# 2i. GET /home/featured
req "home-featured" GET "$API/home/featured"
assert_status "GET /home/featured" 200

# 2j. GET /office
req "office-pub" GET "$API/office"
assert_status "GET /office (public)" 200

# 2k. POST /inquiries (public form)
req "inquiry-create" POST "$API/inquiries" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test Visitor",
    "email":"test.visitor@example.com",
    "contactNumber":"09171234567",
    "inquiryType":"tourist",
    "dateOfVisit":"2026-05-01",
    "numberOfPax":3,
    "message":"System test inquiry — please ignore.",
    "consentGiven":true
  }'
if [[ "$STATUS" =~ ^(200|201)$ ]]; then
  pass "POST /inquiries (public) → HTTP $STATUS"
  CREATED_INQUIRY_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
  [[ -n "$CREATED_INQUIRY_ID" ]] && pass "Created inquiry ID: $CREATED_INQUIRY_ID" || true
else
  fail "POST /inquiries (public) → HTTP $STATUS | $BODY"
fi

# 2l. POST /analytics/log-view
req "log-view" POST "$API/analytics/log-view" \
  -H "Content-Type: application/json" \
  -d '{"contentId":1,"path":"/destinations/1"}'
if [[ "$STATUS" =~ ^(200|201|204)$ ]]; then
  pass "POST /analytics/log-view → HTTP $STATUS"
else
  # Some setups return 400 if content not found — acceptable
  if [[ "$STATUS" == "400" || "$STATUS" == "404" ]]; then
    pass "POST /analytics/log-view → HTTP $STATUS (content may not exist)"
  else
    fail "POST /analytics/log-view → HTTP $STATUS | $BODY"
  fi
fi

# =============================================================================
# 3. AUTHENTICATED — POSTS CRUD
# =============================================================================
section "3. Posts CRUD (auth required)"

if [[ -z "$TOKEN" ]]; then
  skip "All post CRUD tests (no token)"
else
  # 3a. GET /posts (admin view — all statuses)
  req "posts-admin" GET "$API/posts" -H "$(auth_header)"
  assert_status "GET /posts (admin)" 200

  # 3b. POST /posts — create
  req "post-create" POST "$API/posts" \
    -H "$(auth_header)" \
    -H "Content-Type: application/json" \
    -d '{
      "title":"System Test Post",
      "slug":"system-test-post-'$(date +%s)'",
      "type":"news",
      "status":"draft",
      "content":"This post was created by the automated system test suite.",
      "excerpt":"System test.",
      "label":"news"
    }'
  if [[ "$STATUS" =~ ^(200|201)$ ]]; then
    pass "POST /posts (create) → HTTP $STATUS"
    CREATED_POST_ID=$(echo "$BODY" | grep -o '"id":[0-9]*\|"postId":[0-9]*\|"id":"[0-9]*"' | head -1 | grep -o '[0-9]*')
    [[ -n "$CREATED_POST_ID" ]] && pass "Created post ID: $CREATED_POST_ID" || true
  else
    fail "POST /posts (create) → HTTP $STATUS | $BODY"
  fi

  # 3c. GET /posts/{id} — single post
  if [[ -n "$CREATED_POST_ID" ]]; then
    req "post-read-one" GET "$API/posts/$CREATED_POST_ID" -H "$(auth_header)"
    assert_status "GET /posts/$CREATED_POST_ID" 200

    # 3d. PUT /posts/{id} — update
    req "post-update" PUT "$API/posts/$CREATED_POST_ID" \
      -H "$(auth_header)" \
      -H "Content-Type: application/json" \
      -d '{"title":"System Test Post (Updated)"}'
    assert_status "PUT /posts/$CREATED_POST_ID" 200

    # 3e. DELETE /posts/{id}
    req "post-delete" DELETE "$API/posts/$CREATED_POST_ID" -H "$(auth_header)"
    assert_status "DELETE /posts/$CREATED_POST_ID" 200
  else
    skip "GET/PUT/DELETE /posts/{id} (no created post ID)"
  fi
fi

# =============================================================================
# 4. TOUR GUIDES CRUD
# =============================================================================
section "4. Tour Guides CRUD (admin auth)"

if [[ -z "$TOKEN" ]]; then
  skip "All tour guide tests (no token)"
else
  # 4a. GET /tour_guides
  req "guides-list" GET "$API/tour_guides" -H "$(auth_header)"
  assert_status "GET /tour_guides" 200

  # 4b. POST /tour_guides — create
  req "guide-create" POST "$API/tour_guides" \
    -H "$(auth_header)" \
    -H "Content-Type: application/json" \
    -d '{
      "fullName":"System Test Guide",
      "phoneNumber":"09181234567",
      "organization":"Test Org",
      "availability":"available"
    }'
  if [[ "$STATUS" =~ ^(200|201)$ ]]; then
    pass "POST /tour_guides (create) → HTTP $STATUS"
    CREATED_GUIDE_ID=$(echo "$BODY" | grep -o '"id":"[0-9]*"' | head -1 | grep -o '[0-9]*')
    [[ -n "$CREATED_GUIDE_ID" ]] && pass "Created guide ID: $CREATED_GUIDE_ID" || true
  else
    fail "POST /tour_guides (create) → HTTP $STATUS | $BODY"
  fi

  # 4c. PUT /tour_guides/{id} — update
  if [[ -n "$CREATED_GUIDE_ID" ]]; then
    req "guide-update" PUT "$API/tour_guides/$CREATED_GUIDE_ID" \
      -H "$(auth_header)" \
      -H "Content-Type: application/json" \
      -d '{"organization":"Updated Org"}'
    assert_status "PUT /tour_guides/$CREATED_GUIDE_ID" 200

    # 4d. Appointments — create
    req "appt-create" POST "$API/tour_guides/$CREATED_GUIDE_ID/appointments" \
      -H "$(auth_header)" \
      -H "Content-Type: application/json" \
      -d '{
        "title":"Test Tour",
        "startDatetime":"2026-05-10 08:00:00",
        "endDatetime":"2026-05-10 12:00:00",
        "notes":"System test appointment"
      }'
    if [[ "$STATUS" =~ ^(200|201)$ ]]; then
      pass "POST /tour_guides/$CREATED_GUIDE_ID/appointments → HTTP $STATUS"
      CREATED_APPT_ID=$(echo "$BODY" | grep -o '"id":"[0-9]*"' | head -1 | grep -o '[0-9]*')
      [[ -n "$CREATED_APPT_ID" ]] && pass "Created appointment ID: $CREATED_APPT_ID" || true
    else
      fail "POST appointments → HTTP $STATUS | $BODY"
    fi

    # 4e. Appointments — list
    req "appt-list" GET "$API/tour_guides/$CREATED_GUIDE_ID/appointments" -H "$(auth_header)"
    assert_status "GET /tour_guides/$CREATED_GUIDE_ID/appointments" 200

    # 4f. Appointments — delete
    if [[ -n "$CREATED_APPT_ID" ]]; then
      req "appt-delete" DELETE "$API/tour_guides/$CREATED_GUIDE_ID/appointments?apptId=$CREATED_APPT_ID" \
        -H "$(auth_header)"
      assert_status "DELETE appointment $CREATED_APPT_ID" 200
    else
      skip "DELETE appointment (no ID)"
    fi

    # 4g. DELETE /tour_guides/{id}
    req "guide-delete" DELETE "$API/tour_guides/$CREATED_GUIDE_ID" -H "$(auth_header)"
    assert_status "DELETE /tour_guides/$CREATED_GUIDE_ID" 200
  else
    skip "PUT/DELETE /tour_guides + appointments (no created guide ID)"
  fi
fi

# =============================================================================
# 5. INQUIRIES (admin reads)
# =============================================================================
section "5. Inquiries (admin auth)"

if [[ -z "$TOKEN" ]]; then
  skip "All inquiry admin tests (no token)"
else
  # 5a. GET /inquiries
  req "inquiries-list" GET "$API/inquiries" -H "$(auth_header)"
  assert_status "GET /inquiries (admin)" 200

  # 5b. PUT /inquiries/{id} — update status (use created one if available)
  if [[ -n "$CREATED_INQUIRY_ID" ]]; then
    req "inquiry-update" PUT "$API/inquiries/$CREATED_INQUIRY_ID" \
      -H "$(auth_header)" \
      -H "Content-Type: application/json" \
      -d '{"status":"confirmed"}'
    assert_status "PUT /inquiries/$CREATED_INQUIRY_ID (update status)" 200

    # 5c. DELETE /inquiries/{id}
    req "inquiry-delete" DELETE "$API/inquiries/$CREATED_INQUIRY_ID" -H "$(auth_header)"
    assert_status "DELETE /inquiries/$CREATED_INQUIRY_ID" 200
  else
    skip "PUT/DELETE /inquiries (no created ID)"
  fi

  # 5d. POST /inquiries/walkin
  req "walkin" POST "$API/inquiries/walkin" \
    -H "$(auth_header)" \
    -H "Content-Type: application/json" \
    -d '{
      "name":"Walk-in Test",
      "numberOfPax":2
    }'
  if [[ "$STATUS" =~ ^(200|201)$ ]]; then
    pass "POST /inquiries/walkin → HTTP $STATUS"
    # Clean up walk-in
    WALKIN_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
    if [[ -n "$WALKIN_ID" ]]; then
      req "walkin-delete" DELETE "$API/inquiries/$WALKIN_ID" -H "$(auth_header)"
      [[ "$STATUS" == "200" ]] && pass "Walk-in cleanup deleted" || true
    fi
  else
    fail "POST /inquiries/walkin → HTTP $STATUS | $BODY"
  fi
fi

# =============================================================================
# 6. ANALYTICS
# =============================================================================
section "6. Analytics (admin auth)"

if [[ -z "$TOKEN" ]]; then
  skip "All analytics tests (no token)"
else
  req "stats" GET "$API/analytics/content-stats" -H "$(auth_header)"
  assert_status "GET /analytics/content-stats" 200

  req "visits" GET "$API/analytics/visits?days=7" -H "$(auth_header)"
  assert_status "GET /analytics/visits?days=7" 200

  req "top-dest" GET "$API/analytics/top-destinations" -H "$(auth_header)"
  assert_status "GET /analytics/top-destinations" 200

  req "visitor-summary" GET "$API/analytics/visitor-summary" -H "$(auth_header)"
  assert_status "GET /analytics/visitor-summary" 200
fi

# =============================================================================
# 7. ACTIVITY LOG
# =============================================================================
section "7. Activity Log (auth)"

if [[ -z "$TOKEN" ]]; then
  skip "Activity log tests (no token)"
else
  req "activity-read" GET "$API/activity" -H "$(auth_header)"
  assert_status "GET /activity" 200

  req "activity-log" POST "$API/activity" \
    -H "$(auth_header)" \
    -H "Content-Type: application/json" \
    -d '{"action":"system_test","description":"Automated system test run"}'
  assert_status "POST /activity (log entry)" 201
fi

# =============================================================================
# 8. USERS
# =============================================================================
section "8. Users (auth)"

if [[ -z "$TOKEN" ]]; then
  skip "User endpoint tests (no token)"
else
  req "users-list" GET "$API/users" -H "$(auth_header)"
  assert_status "GET /users" 200

  req "user-me" GET "$API/users/1" -H "$(auth_header)"
  if [[ "$STATUS" =~ ^(200|403)$ ]]; then
    pass "GET /users/1 → HTTP $STATUS (200 or 403 are both valid)"
  else
    fail "GET /users/1 → unexpected $STATUS"
  fi
fi

# =============================================================================
# 9. HEROES
# =============================================================================
section "9. Page Heroes"

req "heroes-list" GET "$API/heroes" -H "$(auth_header)"
assert_status "GET /heroes (list)" 200

req "hero-slug" GET "$API/heroes?slug=home"
if [[ "$STATUS" =~ ^(200|404)$ ]]; then
  pass "GET /heroes?slug=home → HTTP $STATUS"
else
  fail "GET /heroes?slug=home → $STATUS"
fi

# =============================================================================
# 10. MEDIA
# =============================================================================
section "10. Media (auth)"

if [[ -z "$TOKEN" ]]; then
  skip "Media tests (no token)"
else
  req "media-list" GET "$API/media" -H "$(auth_header)"
  assert_status "GET /media" 200

  req "media-images" GET "$API/media?type=images" -H "$(auth_header)"
  assert_status "GET /media?type=images" 200

  req "media-videos" GET "$API/media?type=videos" -H "$(auth_header)"
  assert_status "GET /media?type=videos" 200
fi

# =============================================================================
# 11. RBAC — role restriction checks
# =============================================================================
section "11. RBAC enforcement"

# Unauthenticated access to protected endpoints
req "rbac-guides-noauth" GET "$API/tour_guides"
assert_status "GET /tour_guides (no auth) → 401" 401

req "rbac-users-noauth" GET "$API/users"
assert_status "GET /users (no auth) → 401" 401

req "rbac-analytics-noauth" GET "$API/analytics/visits"
assert_status "GET /analytics/visits (no auth) → 401" 401

req "rbac-activity-noauth" GET "$API/activity"
assert_status "GET /activity (no auth) → 401" 401

# Invalid 404 routes
req "rbac-404" GET "$API/nonexistent-route"
if [[ "$STATUS" =~ ^(404|400)$ ]]; then
  pass "GET /nonexistent-route → HTTP $STATUS (404/400 expected)"
else
  fail "GET /nonexistent-route → unexpected $STATUS"
fi

# =============================================================================
# SUMMARY
# =============================================================================
TOTAL=$((PASS + FAIL + SKIP))
echo ""
echo -e "${BLD}══════════════════════════════════════════${RST}"
echo -e "${BLD}  MHACTO API Test Results${RST}"
echo -e "${BLD}══════════════════════════════════════════${RST}"
echo -e "  Total:   $TOTAL"
echo -e "  ${GRN}Passed:  $PASS${RST}"
if [[ $FAIL -gt 0 ]]; then
  echo -e "  ${RED}Failed:  $FAIL${RST}"
else
  echo -e "  Failed:  $FAIL"
fi
echo -e "  ${YLW}Skipped: $SKIP${RST}"
echo -e "${BLD}══════════════════════════════════════════${RST}"

if [[ $FAIL -gt 0 ]]; then
  exit 1
else
  exit 0
fi
