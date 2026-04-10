# MHACTO Official — Bocaue Municipal History, Arts, Culture & Tourism Office

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
php -S localhost:8000 index.php
```

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

## Changelog

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
