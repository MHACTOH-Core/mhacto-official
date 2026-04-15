# MHACTO Official — Bocaue Municipal History, Arts, Culture & Tourism Office

**Current Version: `v1.2.0`** — Released April 15, 2026

A full-stack web application for the Municipality of Bocaue, Bulacan, Philippines — showcasing local tourism, culture, history, and community services with an admin CMS dashboard.

---

## Tech Stack

| Layer    | Technology                                  |
|----------|---------------------------------------------|
| Frontend | Next.js 16, React, TypeScript, Tailwind CSS |
| UI       | shadcn/ui                                   |
| Backend  | PHP (vanilla, no framework)                 |
| Database | MySQL (11 tables)                           |
| Package  | pnpm                                        |

---

## Project Structure

```
├── frontend/
│   ├── app/
│   │   ├── (site)/        # Public tourist-facing pages
│   │   └── (admin)/       # Admin CMS dashboard
│   ├── components/        # UI, layout, sections, providers
│   └── lib/               # API client (api.ts), utilities, mappers
│
└── backend/my-php-backend/
    ├── index.php           # Central router (single entry point)
    ├── routes/             # Route handlers (auth, posts, inquiries, etc.)
    ├── config/             # Database connection
    ├── core/               # Response helpers, security, caching
    ├── models/             # PHP data models
    └── database/           # SQL schema & seed files
```

---

## How Data Fetching Works

This project uses a **3-tier REST API architecture**. The frontend never connects to the database directly.

```
Browser (React/Next.js)  →  HTTP Request  →  PHP Backend  →  MySQL Database
```

**Why not direct SQL from the frontend?**
- The browser has no access to DB credentials — embedding them would expose them in DevTools
- Browsers can only make HTTP requests; they cannot speak the MySQL wire protocol
- The PHP backend handles input validation, sanitization, and authentication

**Example flow (fetching news):**
```
1. Frontend:  apiFetchPublishedNews()
2. Sends:     GET /api/posts?type=news
3. PHP:       parses query, runs prepared SQL SELECT
4. Returns:   JSON array → React state → rendered UI
```

All frontend fetch calls go through `frontend/lib/api.ts`, which handles URL resolution, JSON headers, and error handling.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 20+ | [nodejs.org](https://nodejs.org/) or `winget install OpenJS.NodeJS.LTS` |
| pnpm | 9+ | `npm install -g pnpm` |
| PHP | 8.1+ | Windows: Thread Safe zip from [windows.php.net](https://windows.php.net/download/), add to PATH |
| MySQL / MariaDB | 8+ / 10.6+ | [XAMPP](https://www.apachefriends.org/) is the easiest option |
| Composer | 2+ | [getcomposer.org](https://getcomposer.org/) — required for JWT and PHPMailer |
| APCu PHP ext | bundled | Enable in `php.ini`: uncomment `;extension=apcu` |
| Git | latest | [git-scm.com](https://git-scm.com/) |

> **XAMPP users:** PHP and MySQL are already included. Add `C:\xampp\php` and `C:\xampp\mysql\bin` to your system PATH.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/MHACTOH-Core/mhacto-official.git
cd mhacto-official
```

### 2. Set up the database

```bash
mysql -u root -p < backend/my-php-backend/database/database-schema.sql
mysql -u root -p mhacto_db < backend/my-php-backend/database/seed.sql
```

This creates `mhacto_db` with all 11 tables and seeds the initial data.

### 3. Configure database credentials

```bash
# Linux / macOS
cp backend/my-php-backend/config/database.local.example.php backend/my-php-backend/config/database.local.php

# Windows CMD
copy backend\my-php-backend\config\database.local.example.php backend\my-php-backend\config\database.local.php
```

Edit `database.local.php` with your MySQL username and password. This file is git-ignored.

### 4. Start the PHP backend

```bash
cd backend/my-php-backend
PHP_CLI_SERVER_WORKERS=4 php -S 127.0.0.1:8000 index.php
```

> **`PHP_CLI_SERVER_WORKERS=4` is required** — without it the built-in server is single-threaded and concurrent API requests (e.g. opening the Page Views dialog while the dashboard is loading) will drop connections.
> You **must** include `index.php` — without it, the central router will not work.

### 5. Start the frontend

Open a **new terminal** (keep the PHP server running):

```bash
cd frontend
cp .env.example .env.local     # Linux/macOS
pnpm install
pnpm dev
```

Frontend runs at **http://localhost:3000**.

### 6. Verify

| URL | Expected |
|-----|----------|
| http://localhost:3000 | Public homepage |
| http://localhost:8000/api/posts | JSON API response |
| http://localhost:3000/admin | Admin CMS login |

---

## Windows Troubleshooting

**"Could not find driver" error:**
Open `php.ini`, uncomment `;extension=pdo_mysql` and `;extension=openssl`, then restart the PHP server.

**Long path errors when cloning:**
```cmd
git config --global core.longpaths true
```

**pnpm execution policy error (PowerShell):**
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

---

## Configuration Files

| File | Purpose |
|------|---------|
| `.gitattributes` | Enforces LF line endings in repo |
| `frontend/.env.example` | Template for frontend environment variables |
| `backend/.../database.local.example.php` | Template for local DB credentials |

---

## Version History

| Version | Release Date | Highlights |
|---------|-------------|------------|
| `v1.2.0` | April 15, 2026 | Global dashboard date filter (Today / Week / Month / Year / Custom), analytics re-fetch by range, PDF export with report period |
| `v1.1.0` | April 14, 2026 | Live Search API, scroll-to-card navigation, global search overlay |
| `v1.0.0` | April 10, 2026 | Initial public release — CMS dashboard, public site, analytics |

---

## Changelog

### April 15, 2026 — Global Dashboard Date Filter & System Versioning (`v1.2.0`)

#### Global Dashboard Date Filter
- New **date filter toolbar** in the Dashboard header — admins and super admins can filter all dashboard data by:
  - **Today** — current day only
  - **This Week** — Monday to today
  - **This Month** — 1st of the month to today
  - **This Year** — January 1 to today
  - **Custom range** — opens a two-month calendar popover
  - **Last 30 Days** — default (same as before)
- Selecting a filter re-fetches **all analytics from the backend** for that exact date range — visitor stats, daily visits chart, and page views all update simultaneously
- Inquiry Summary card is additionally filtered **client-side** by `createdAt` to match the selected period
- Website Visits chart **auto-aggregates to monthly buckets** when the range exceeds 60 days
- Header subtitle dynamically displays the active period label

#### PDF Export — Report Period
- The **Export PDF** report now shows a `Report Period:` line in the letterhead — exported reports clearly state which date range the data covers
- The filter state is persisted in the analytics context (`activeDateFilter`) so the print component always reflects the current selection

#### System Versioning
- `package.json` `name` updated to `mhacto-official`, `version` bumped to `1.2.0`
- Version exposed as `NEXT_PUBLIC_APP_VERSION` environment variable via `next.config.mjs`
- **Settings page** — new **"About This System"** card visible to all roles shows: System Version, Application name, Release Date, and Stack
- README updated with Version History table and this changelog entry

---

### April 14, 2026 — Live Search API Integration & Scroll-to-Card Navigation

#### Live Search Connection
- Search bar now queries the backend in real-time — visitors see **instant local static results** (no network delay) immediately, then **live CMS results** are merged in after a 300 ms debounce
- `searchContentAsync()` in `search-index.ts` updated to parse the flat array returned by `/api/search`, maps each result through `mapCMSPostToSearchResult()` for correct routing
- Backend `routes/search.php` updated to JOIN `content_fields` for `label_key` and return `post_type` + `label` in every result — enables the frontend to build proper navigation URLs per content type

#### Label-First Routing Fix
- `mapCMSPostToSearchResult()` now resolves the URL by **label mapping first** — a hospital with `post_type = "news"` no longer gets misrouted to `/news/{id}`; its label `"hospitals"` correctly maps to `/community/hospitals#item-{id}`
- `postType`-based routing (`news`, `event`) is only used as a fallback when no label mapping exists

#### Scroll-to-Card Navigation (Community Pages)
- Searching a specific item (e.g. "St. Anne Medical Clinic") and clicking the result navigates to the list page **and smoothly scrolls to that card** with a temporary highlight ring
- Implemented via URL hash fragment `#item-{id}` — all community cards carry `id={`item-${X.id}`}` attributes
- Pages with scroll-to-card support: **Schools, Hospitals, Barangays, Local Business**

#### Hash Navigation Fix
- `navigateToResult()` in `search-overlay.tsx` now uses `window.location.href` for hash URLs — Next.js `router.push()` was stripping the `#fragment`, causing the scroll to never trigger
- Enter-key navigation in the search overlay also uses the same `navigateToResult()` helper

#### Page Transition Scroll Timing Fix
- `template.tsx` scroll-to-hash effect now waits **700 ms** for the Framer Motion page transition animation to complete before searching for the target element (previously tried to scroll while the element was still hidden behind the `clipPath` animation)
- Switched from `document.querySelector(hash)` to `document.getElementById(id)` — `querySelector` throws on CSS-invalid IDs (e.g. numeric IDs starting with a digit)
- Retry interval increased to every 250 ms, up to 25 attempts (~6.25 s total) to handle slow async data loads

#### Old Barangay Page Removed
- Deleted `community/barangay/` folder (list page + `[id]/` detail route) — replaced by `community/barangays/` (card-only list, consistent with all other community sections)
- All internal links updated from `/community/barangay/{id}` to `/community/barangays#item-{id}` (scroll-to-card)
- `labelRouteMap` entry updated: `"barangay"` → `{ prefix: "/community/barangays", hasDetail: false }`

---

### April 14, 2026 — Global Search, Dashboard Graph Enhancements & Pagination

#### Global Search API (`GET /api/search?q=`)
- New PHP route `routes/search.php` — queries the `content` table with `status = 'published'` using PDO prepared statements
- Relevance scoring: exact title match (+30), title contains (+20), starts-with bonus (+10), description contains (+8)
- Results sorted by score, capped at 50, returned as unified `{id, type, title, description}` JSON
- `post_type` values mapped to display labels: `place` → "Tourist Spot", `news` → "News Article", `event` → "Event"
- Empty or missing `?q=` returns `[]` with HTTP 200
- Route registered as a public GET resource in `index.php` (no JWT required)

#### Next.js Proxy Fix (`app/api/[...path]/route.ts`)
- Fixed `params.path` Promise error (Next.js 15+ requires `await context.params` before accessing `.path`)
- All HTTP method handlers (GET, POST, PUT, DELETE, PATCH) updated to use the async `RouteContext` pattern

#### Dashboard — Website Visits Graph
- **Date X-axis** added to the traffic AreaChart — labels shown as "Mar 28", "Apr 1", etc. with auto-spaced ticks (~7 visible regardless of range)
- **Month range selectors** added to the dropdown (grouped):
  - Quick ranges: Last 7 days / Last 30 days / Last 3 months / Last 6 months / This year
  - "2026 by month" group: individual month buttons (January → current month, auto-generated)
  - Custom range (unchanged)
- **Multi-month aggregation**: 3-month, 6-month, and year views aggregate data by month on the X-axis (e.g. "Jan 2026", "Feb 2026") matching the reference chart style
- **Smooth monotone curve** with small dots on each data point for clear day/month-level visibility
- Chart height increased (`h-36`) with extra bottom margin (20px) for label clearance

#### Dashboard — React Hooks Order Fix
- Resolved "change in order of Hooks" console error — all `useState`, `useEffect`, `useCallback`, and `useMemo` calls moved above early `return` statements, following the Rules of Hooks
- Removed a duplicate `if (!isHydrated || !isLoggedIn) return null` guard

#### Visit Seed Data
- New script `backend/my-php-backend/database/seed-visits.php` — inserts 4,055 historical `page_view` entries into `activity_logs` from January 1 – April 13, 2026
- Data designed to show realistic hills and valleys: Jan peak → Feb trough → Mar heritage-week spike → Apr recovery with visible dips (e.g. Apr 12: ~4 visits)

#### Admin "View All" Dialogs — Pagination
- `page-views-dialog.tsx` and `visitor-engagement-dialog.tsx` — `PER_PAGE` reduced from 20 to **10** per page
- Existing prev/next page controls and "X / Y" page indicator remain unchanged

---

### April 11, 2026 — Internal Links, Pagoda Hero, Developer Team Page & Footer Update

#### Internal Link Behavior
- Removed `target="_blank"` from all internal content links across 14 pages — clicking destinations, news, events, culture, places, community, and travel-tours links now navigates in the same tab
- External links (Google Maps, Facebook, Instagram, OpenStreetMap) remain opening in new tabs

#### Pagoda Hero Enhancement
- Hero image now uses CSS `mask-image` for a true **left-to-right fade-away** effect — image is invisible on the left (clean dark background for text) and smoothly reveals toward the right
- Image focal point shifted to `object-[65% 25%]` for better composition

#### Developer Team Page (`/developers`)
- New standalone page (no navbar/footer) showcasing the development team
- Each member has a **color-coded card** with role icon, gradient accent bar, and description
- Team hierarchy: Project Manager → Tech Lead → Full Stack Developer → QA Tester → UI/UX Designer
- Tech stack pills displayed (Next.js, React, TypeScript, Tailwind CSS, PHP, MySQL, Framer Motion, shadcn/ui)
- Jayson Visnar's card links to LinkedIn

#### Footer Update
- Removed developer names from footer
- Added clickable **"Developer Team"** link (opens `/developers` in new tab) below "IN PARTNERSHIP WITH STI COLLEGE BALAGTAS"

#### Scrollbar Stability Fix
- Added `scrollbar-gutter: stable` on `html` to prevent navbar position shift when Radix Dialog opens/closes

---

### April 10, 2026 — Schools CMS: Contact Details, Year Founded Date Picker & UI Fixes

#### Schools CMS — Admin Panel
- **Contact Details field** added to the Schools CMS form (`highlights` meta key) — supports multiline input (one entry per line: phone, email, website)
- **Year Founded** (`contact` field) now uses a **native date picker** instead of a free-text input; calendar icon replaces the phone icon for schools
- **Year Founded** input no longer restricts to phone-number characters — accepts full dates
- **Field helper texts** are now label-aware:
  - Schools → "Number of enrolled students"
  - Hospitals → "Total number of hospital beds"
  - Barangay → "Estimated number of residents"
  - Others → "Year or date when this was established"

#### Schools Page — Frontend
- **Contact Details section** added to school cards (phone icon, displayed between Programs and the footer meta)
- **Year Founded** on school cards now displays as a formatted date (e.g. "January 1, 1952") when a full date is stored
- Data mapper (`cmsToSchoolEntry`) updated: `post.highlights[]` → `school.contact` (joined with newlines)

#### Admin Dashboard
- Fixed layout shift when opening the **Export Summary** dialog — body `overflow: hidden` scoped to admin layout so only the `<main>` scrollbar is visible

---

### April 8, 2026 — Security, DPA Compliance, Performance & Office CMS

#### Security Hardening
- **`core/RateLimit.php`** — File-based sliding-window rate limiter (no Redis needed)
  - Login: 10 attempts / 15 min per IP
  - Inquiry form: 5 submissions / 1 hr per IP
  - Analytics: 60 hits / 1 min per IP
- **`core/Response.php`** — Security headers on every API response (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`)
- **`.htaccess`** — Blocked direct access to `.env`, `.json`, `.sql`, `.log` files; blocked directory listing on sensitive folders; 20 MB max request size

#### RA 10173 Data Privacy Act Compliance
- **`core/DataPrivacy.php`** — PII masking helpers, audit trail logging, retention policy enforcement, inquiry anonymization
- **Schema** — New columns on `inquiries` (`submitter_ip`, `consent_given`, `data_purge_date`); new `data_breach_log` and `consent_versions` tables
- **Inquiry API** — Public `POST /api/inquiries` now requires `consentGiven: true`; returns HTTP 400 if missing
- **Frontend** — Consent checkbox added to `/inquire`; submit button disabled until checked

#### RBAC / IDOR Prevention
- **`core/Auth.php`** — New `canAccess()` with role hierarchy (`super_admin` → all, `content_manager` → own resources only)
- **`routes/users.php`** — GET/PUT endpoints pass through `canAccess()` before executing

#### Query Caching & Performance
- **`core/QueryCache.php`** — APCu-backed cache for public GET endpoints (5 min posts, 10 min settings); graceful fallback if APCu unavailable
- **`config/Database.php`** — PDO persistent connections and buffered queries enabled
- **Schema** — 6 composite indexes added on high-traffic tables
- **Frontend** — 5 pages converted from sequential `useEffect` fetches to `Promise.all`

#### MHACTO Office Admin CMS
- New admin tab **MHACTO Office** (`/admin/office`) with two sub-tabs:
  - Tourism Office: name, hours, address, contact
  - Mission & Vision: statement, core values
- Public pages `/tourism-office` and `/mission-vision` now fetch content from the API dynamically

#### Other
- Favicon set via `app/icon.png` (auto-detected by Next.js)
- `basePath`: dev = `''`, production = `/mhacto`
- Migration SQL files merged into `database-schema.sql` and deleted
- `examples/submit_inquiry.php` — new OWASP-compliant form boilerplate (CSRF, rate limit, DPA audit trail)

---

### March 2–19, 2026 — Summary of Earlier Updates

#### Codebase Audit & Fixes (March 19)
- Added `sizes` props to 10 `<Image fill>` components to prevent oversized image downloads
- Replaced 8 `key={index}` anti-patterns with stable identifiers
- Fixed stale `setTimeout` closure in `search-overlay.tsx`
- Simplified CMS preview dialog to single-image view
- Removed duplicate `use-mobile.tsx` file

#### Schema Reset & Bug Fixes (March 6)
- Full database reset — all 11 tables recreated cleanly with correct seed data
- Fixed inquiry assignment: `PUT /api/inquiries/{id}` now supports `assigned` status and `assigned_to` field
- "Arts & Livelihood" nav removed; replaced with flat "Local Businesses" link
- Inquiry read/unread system added with auto-mark-as-read and tourist guide assignment UI
- Fixed admin Home Content key props (`landmarkId` → `featuredId`)
- Added `items-start` to 25 grid containers to prevent card height stretching

#### REST API Rewrite (March 5)
- All legacy `api/{resource}/{action}.php` endpoints replaced with a **central router** (`index.php`) dispatching to 10 route files
- All 61 endpoint URLs in `api.ts` migrated to clean REST paths (`/api/posts`, `/api/inquiries/{id}`, etc.)

#### Frontend Features (March 4)
- New pages: Culinary Wonders, People Wonders, Historical Roadmap, Historical Wonders, Tourism Wonders
- "Human Wonders" renamed to "People Wonders" across all files
- Footer updated to white background with top shadow
- Travel & Tours simplified to 3-column card grid
- Inquiry form simplified to 6 fields with real-time validation

#### Click Analytics & Form Validation (March 2)
- `page_views` table (11th table) added for destination click tracking with session de-duplication
- New endpoints: `POST /api/analytics/log-view`, `GET /api/analytics/top-destinations`
- Inquiry form: name/phone regex, PH phone format hint, From/To date pickers with min-today enforcement

#### Frontend Refactor (March 2)
- 33+ files refactored with descriptive variable names (`loaded` → `isDataLoaded`, `open` → `isMobileMenuOpen`, etc.)
- Performance: rAF-throttled scroll events, `useRef` instead of `useState` for autoplay, debounced `MutationObserver`
- `framer-motion` page transitions replaced with equivalent CSS `@keyframes`
- Removed unused `canvas-confetti` package (~6 KB)

---

## Roadmap

| Priority | Feature |
|----------|---------|
| 🔴 High | Email confirmations on inquiry submission (PHPMailer installed, not yet wired) |
| 🔴 High | Server-side pagination for CMS posts, inquiry list, and activity log |
| 🟡 Medium | File upload dimension validation + virus scanning |
| 🟡 Medium | 30-day soft-delete trash bin for posts and inquiries |
| 🟡 Medium | Dark mode persistence via `localStorage` |
| 🟡 Medium | Dynamic `<title>` and `<meta description>` per public page |
| 🟢 Low | PDF export of inquiry report with MHACTO letterhead |
| 🟢 Low | Multi-language support (Filipino / English) |
| 🟢 Low | Redis upgrade path for cross-worker cache sharing on VPS |
| 🟢 Low | Auto-email DPO within 72 hours on data breach log entry |
