# MHACTO Official — Bocaue Municipal History, Arts, Culture & Tourism Office

A full-stack web application for the Municipality of Bocaue, Bulacan, Philippines — showcasing local tourism, culture, history, and community services with an admin CMS dashboard.

## Tech Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Frontend | Next.js 16, React, TypeScript, Tailwind CSS     |
| UI       | shadcn/ui component library                     |
| Backend  | PHP (vanilla, no framework)                     |
| Database | MySQL (11 tables — see `backend/…/schema.sql`)  |
| Package  | pnpm                                            |

## Project Structure

```
├── frontend/          # Next.js app (pages, components, API client)
│   ├── app/           # Next.js App Router pages
│   │   ├── (site)/    # Public tourist-facing pages
│   │   └── (admin)/   # Admin CMS dashboard
│   ├── components/    # Reusable UI, layout, sections, providers
│   └── lib/           # API client (api.ts), utilities, data, mappers
│
├── backend/my-php-backend/
│   ├── index.php      # Central router (single entry point for all API requests)
│   ├── .htaccess      # Apache mod_rewrite → index.php
│   ├── routes/        # Route handlers (auth, posts, inquiries, media, etc.)
│   ├── api/           # Legacy endpoints (fallback only)
│   ├── config/        # Database connection
│   ├── core/          # Response helpers (CORS, JSON), security
│   ├── database/      # SQL schema & seed
│   ├── models/        # PHP data models (Post, Inquiry, Settings, etc.)
│   └── uploads/       # User-uploaded media (images, videos)
```

## Architecture — How Data Fetching Works

This project uses a **3-tier REST API architecture**. The frontend **never** connects to the database directly.

```
Browser (React/Next.js)  →  HTTP Request  →  PHP Backend  →  MySQL Database
       FRONTEND                                 SERVER            DB
```

### Why not direct SQL `SELECT` from the frontend?

1. **Security** — The browser runs on the user's machine. Embedding DB credentials or SQL queries in frontend code would allow anyone to inspect them via DevTools, run arbitrary queries, or steal/delete data.
2. **Network protocol** — Browsers can only make HTTP requests (`fetch()`). They cannot speak the MySQL wire protocol.
3. **Validation & auth** — The PHP backend validates inputs, sanitizes parameters (preventing SQL injection via prepared statements), and enforces authentication before returning data.

### The actual flow (example: fetching news)

```
1. Frontend calls:       apiFetchPublishedNews()
2. That sends:           GET http://localhost:8000/api/posts/read.php?type=news
3. PHP backend receives:  read.php parses ?type=news
4. PHP runs SQL:          SELECT * FROM content WHERE post_type = 'news' AND status = 'published'
5. PHP responds:          JSON array of news articles
6. Frontend parses JSON → puts it in React state → renders the UI
```

All frontend fetch calls go through the centralized `apiFetch()` wrapper in `frontend/lib/api.ts`, which handles URL resolution, JSON headers, and error handling in one place.

---

## Changelog

### March 6, 2026 — Inquiry Form Fix & Admin Key Prop Fix

#### 1. Inquiry Form: "Inquiry Category" → "Purpose of Visit"

Updated the tourist-facing inquiry form (`/inquire`) to better reflect its purpose:

| Before | After |
|--------|-------|
| Label: "Inquiry Category" | Label: **"Purpose of Visit"** |
| Options: Student, Tourist | Options: **Leisure, Pilgrimage, Educational, Event, Official Business** |
| Placeholder: "Select category" | Placeholder: **"Select purpose"** |

The `purpose` field is now sent directly in the API payload alongside `inquiryType`. Backend already accepted both fields.

#### 2. Admin Home Content — Key Prop & Deprecated ID Fix

Fixed React "Each child in a list should have a unique key prop" warning in the admin Home Content page (`/admin/home-content`). The root cause was using deprecated type fields (`landmarkId`, `spotlightId`) that returned `undefined` from the API — the unified `featured_content` table uses `featuredId`.

**8 replacements applied:**

| Location | Before | After |
|----------|--------|-------|
| Landmark card key | `key={land.landmarkId}` | `key={land.featuredId}` |
| Landmark toggle/delete | `land.landmarkId` | `land.featuredId` |
| Spotlight toggle/delete | `spot.spotlightId` | `spot.featuredId` |
| handleSave casts | `(editingItem as Spotlight).spotlightId` | `(editingItem as FeaturedContent).featuredId` |
| handleSave casts | `(editingItem as FeaturedLandmark).landmarkId` | `(editingItem as FeaturedContent).featuredId` |
| Reorder mapping | `l.landmarkId` | `l.featuredId` |

---

### March 5, 2026 — Full REST API Rewrite (Central Router)

Replaced all legacy `api/{resource}/{action}.php` endpoints with a **single-entry-point central router** (`index.php`) that dispatches to 10 resource handler files.

#### Architecture

```
Browser → GET /api/posts?type=news
       → index.php (central router)
       → routes/posts.php → handle_posts($method, $id, $sub)
       → MySQL query → JSON response
```

- **`index.php`** — Parses URI segments, loads `routes/{resource}.php`, calls `handle_{resource}()`. Handles CORS once. Falls back to legacy `api/` files for unrecognized routes.
- **`.htaccess`** — Apache mod_rewrite sends all non-file requests to `index.php`.
- **CLI-server support** — Detects `php -S` built-in server SAPI to skip basePath stripping.

#### Route Handlers (`backend/my-php-backend/routes/`)

| File | Endpoints |
|------|-----------|
| `auth.php` | POST `/api/auth/login` |
| `posts.php` | GET/POST/PUT/DELETE `/api/posts/{id}` with query filters (status, label, type, limit, featured, category) |
| `inquiries.php` | GET/POST/PUT/DELETE `/api/inquiries/{id}`, POST `/api/inquiries/{id}/reply` |
| `media.php` | GET/POST/DELETE `/api/media` |
| `settings.php` | GET/PUT `/api/settings` |
| `activity.php` | GET/POST `/api/activity` |
| `analytics.php` | GET `/api/analytics/pageviews`, `/visits`, `/top-destinations`; POST `/log-view` |
| `destinations.php` | GET/POST `/api/destinations` |
| `heroes.php` | GET/PUT `/api/heroes/{slug}` |
| `home.php` | 6 sub-resources: `hero`, `hero-settings`, `spotlight`, `landmarks`, `milestones`, `culinary` |

#### Frontend Migration

All 61 endpoint URLs in `frontend/lib/api.ts` migrated from legacy `.php` paths to clean REST URLs. No `.php` references remain in the frontend.

**Important:** Backend must be started with the router: `php -S localhost:8000 index.php` (not just `php -S localhost:8000`).

---

### March 2, 2026 — Click Analytics (page_views) & Inquiry Form Validation

#### 1. New `page_views` Table (schema table #11)

Added a dedicated click-analytics table to the database that tracks every time a visitor clickllows on a destination page. It references `content(content_id)` (destinations are `content` rows with `post_type = 'place'`) and stores an optional `visitor_session_id` for per-session de-duplication.

#### 2. New Backend Endpoints & Model

| File | Purpose |
| ---- | ------- |
| `models/PageView.php` | Model with `logView()` (parameterised INSERT) and `getTopDestinations()` (aggregated JOIN: `page_views → content → category`) |
| `api/analytics/log-view.php` | **POST** — accepts `{ contentId, sessionId? }`, inserts one row into `page_views` |
| `api/analytics/top-destinations.php` | **GET** — returns top N most-clicked destinations (name, category, total clicks) with `?limit=` param (default 10, max 50) |

All SQL queries are parameterised to prevent injection. The GET query is capped at `LIMIT 50` to stay lightweight on localhost.

#### 3. Frontend API Helpers

| Function | Where |
| -------- | ----- |
| `apiLogDestinationView(contentId, sessionId?)` | `lib/api.ts` — fires POST to log a click |
| `apiFetchTopDestinations(limit?)` | `lib/api.ts` — fetches dashboard analytics data |
| `TopDestination` interface | `lib/data/admin-data.ts` — `{ content_id, destination_name, category, total_clicks }` |

#### 4. Inquiry Form Validation Enhancements

| Change | Details |
| ------ | ------- |
| Name validation | Only letters, spaces, hyphens, periods, and apostrophes — numbers trigger an inline warning |
| PH phone format | Validates `09XX-XXX-XXXX` or `+639XXXXXXXXX` with a format hint; shows warning on invalid input |
| Date range | Single date input replaced with **From / To** date pickers; both enforce `min={today}` (no past dates); warns if end < start |
| Pax → People | Label renamed from "Number of Pax" to "Number of People" |

All validations run in real-time (on change) with amber warning messages, plus a final check on submit.

---

### March 4, 2026 — Frontend Feature Additions & Page Simplification

#### 1. Culinary Section (Home Page)

| Change | Details |
|--------|---------|
| Renamed | "Featured Culinary Delicacies" → **"Culinary Wonders"** |
| Limit | Max featured items reduced from 4 → **3** |
| CTA button | Changed from `outline` variant → solid **primary blue** |
| Link | Now navigates to `/culture/culinary-wonders` |
| Button text | "See More Culinary Wonders" |

#### 2. Arts & Culture Page (`/culture`)

- Renamed **"Local Cuisine"** → **"Culinary Wonders"** (nav, heading, sub-page card)
- Renamed **"People Wonders"** sub-page label (was "Human Wonders" — see §8 below)
- Added solid blue **"See More"** button at the bottom of every section (5 total: Culinary Wonders, Festivals, Cultural Practices, Crafts & Artisans, People Wonders)
- Fixed duplicate `import Link from "next/link"` compiler error

#### 3. Local Cuisine Page (`/culture/local-cuisine`)

Added a full **Restaurants & Eateries in Bocaue** section with 6 static restaurant cards:
- Aling Nena's Carinderia, Bocaue Lechon House, Puto Seko Central Bakery, Lutong Probinsya Restaurant, Manong Taho Kiosk, Plaza Merienda Center
- Each card shows: type badge, price range, address, hours, and a highlight quote

#### 4. Footer (`components/layout/footer.tsx`)

| Before | After |
|--------|-------|
| `bg-foreground` (dark) | `bg-white` |
| Dark text classes | `text-foreground` / `text-muted-foreground` |
| No shadow | `shadow-[0_-8px_40px_rgba(0,0,0,0.18)]` |

#### 5. New Pages Created

| Page | Route | Description |
|------|-------|-------------|
| Culinary Wonders | `/culture/culinary-wonders` | Filter bar, stats, featured carousel, all delicacies grid, restaurants section, seasonal guide |
| People Wonders | `/culture/people-wonders` | Tab-based (Notable Persons / Master Artisans), category filter, awards expand/collapse |
| Historical Roadmap | `/history/roadmap` | Era filter, alternating timeline cards with expand/collapse, era legend, stats bar |
| Historical Wonders | `/history/historical-wonders` | 6 heritage sites (St. Martin Church, Philippine Arena, etc.) + historical figures grid |
| Tourism Wonders | `/places/tourism-wonders` | Full attractions grid with search + category filter, story expand/collapse, CTA |

#### 6. Inquiry Form Simplified (`/inquire`)

Replaced the complex visitor type toggle + purpose dropdown with a clean 6-field form:

| Field | Details |
|-------|---------|
| Full Name | Letters/spaces only, max 18 chars |
| Email Address | Validated against known providers (Gmail, Yahoo, etc.) |
| Inquiry Category | `<Select>` with **Student** or **Tourist** options only |
| Number of People (Pax) | Numeric, min 1 |
| Estimated Tour Dates | From / To date pickers, min = today |
| Inquiry Details | Textarea, up to **4,000 characters** with live counter |

Removed: Contact Number field, Purpose of Visit dropdown, School Name conditional, Visitor Type card toggle.

#### 7. Home Page Additions (`app/(site)/page.tsx`)

Added two new lazily-loaded section components:

| Component | Position | Description |
|-----------|----------|-------------|
| `FeaturedRestaurants` | After Culinary section | 3 featured Bocaue restaurants (static data), links to `/culture/culinary-wonders` |
| `FeaturedHumanWonders` | After History & Art section | 3 featured People Wonders cards, links to `/culture/people-wonders` |

> **Note:** `FeaturedRestaurants` was subsequently moved — it now lives on `/culture/local-cuisine` only; removed from home page.

#### 8. "Human Wonders" → "People Wonders" Rename

All references renamed across:
- `app/(site)/culture/page.tsx` — sub-pages array, nav label, section heading, "See More" button
- `components/sections/featured-human-wonders.tsx` — section heading and CTA button
- All link `href` values changed from `/culture/human-wonders` → `/culture/people-wonders`
- The duplicate `/culture/human-wonders/page.tsx` directory was **deleted**; `/culture/people-wonders/page.tsx` is the canonical page

#### 9. Travel & Tours Simplified (`/travel-tours`)

| Removed | Kept |
|---------|------|
| Full itinerary time-block list | Name, description, type badge |
| Difficulty badge | Duration, group size |
| Large horizontal split-card layout | Price pill (on image) |
| | Up to 3 included items |
| | Booking contact (phone + email) |

Layout changed from stacked horizontal cards → **3-column card grid**.
Added "Want a custom tour?" CTA block linking to `/inquire`.

---

### March 4, 2026 — Component & Page Completion Status

#### Layout Components (`components/layout/`)

| Component | Description | Status |
|-----------|-------------|--------|
| `navbar.tsx` | Responsive top navigation with mobile menu, scroll-aware styling, desktop dropdown, and active route highlighting | ✅ Complete |
| `footer.tsx` | Site footer with office info, navigation links, and social links | ✅ Complete |
| `admin-sidebar.tsx` | Collapsible admin CMS sidebar with route links and active state | ✅ Complete |
| `places-events-dropdown.tsx` | Mega-dropdown for Places & Events nav item with category links | ✅ Complete |
| `search-overlay.tsx` | Full-screen search overlay with keyboard navigation and live results from static search index | ✅ Complete |

---

#### Section Components (`components/sections/`)

| Component | Description | Status |
|-----------|-------------|--------|
| `hero-section.tsx` | Full-screen video/image hero with parallax scroll, animated text, and CTA — data fetched from `api/home/hero-settings.php` | ✅ Complete |
| `featured-spotlight.tsx` | Featured place spotlight card with image and description — data from `api/home/spotlight.php` | ✅ Complete |
| `places-carousel.tsx` | Auto-playing Embla carousel of landmark places — data from `api/home/landmarks.php` | ✅ Complete |
| `news-section.tsx` | Tabbed news grid with category filter — data from `api/posts/read.php?type=news` | ✅ Complete |
| `culinary-section.tsx` | Local cuisine card grid with animated reveal — data from `api/home/culinary.php` | ✅ Complete |
| `history-art-section.tsx` | Expandable historical timeline with milestones — data from `api/home/milestones.php` | ✅ Complete |
| `inquiry-section.tsx` | Full inquiry form with real-time validation (name, phone, date range, pax) — submits to `api/inquiries/create.php` | ✅ Complete |
| `page-hero.tsx` | Reusable per-page hero banner with title/subtitle/image — data from `api/heroes/read.php?slug=` | ✅ Complete |
| `featured-human-wonders.tsx` | Home page "People Wonders" preview — shows 3 featured cards, fetches `people-wonders` label, links to `/culture/people-wonders` | ✅ Complete |
| `featured-restaurants.tsx` | Featured Restaurants preview — shows 3 Bocaue restaurant cards with rating, tags, and address (static data) | ✅ Complete |

---

#### Other Components

| Component | Description | Status |
|-----------|-------------|--------|
| `providers/admin-provider.tsx` | Global admin context — handles login state, session persistence, data fetching for posts/inquiries/settings/activity log | ✅ Complete |
| `providers/theme-provider.tsx` | Light/dark theme wrapper using `next-themes` | ✅ Complete |
| `reveal-observer.tsx` | Intersection Observer wrapper for scroll-reveal animations with debouncing | ✅ Complete |
| `reveal-observer-wrapper.tsx` | Provider wrapper that initialises the global reveal observer instance | ✅ Complete |
| `ui/media-picker.tsx` | Media library picker modal with image upload and selection — calls `api/media/upload.php` and `api/media/list.php` | ✅ Complete |

---

#### Public Site Pages (`app/(site)/`)

| Page | Route | Status |
|------|-------|--------|
| Home | `/` | ✅ Complete |
| Destinations | `/destinations` | ✅ Complete |
| Place Detail | `/places/[id]` | ✅ Complete |
| Place Category | `/places/category/[slug]` | ✅ Complete |
| News | `/news` | ✅ Complete |
| News Detail | `/news/[id]` | ✅ Complete |
| Events | `/events` | ✅ Complete |
| Travel & Tours | `/travel-tours` | ✅ Complete |
| History | `/history` | ✅ Complete |
| History Timeline | `/history/timeline` | ✅ Complete |
| Historical Roadmap | `/history/roadmap` | ✅ Complete |
| Historical Wonders | `/history/historical-wonders` | ✅ Complete |
| Notable Persons | `/history/notable-persons` | ✅ Complete |
| Culture Overview | `/culture` | ✅ Complete |
| Culinary Wonders | `/culture/culinary-wonders` | ✅ Complete |
| Local Cuisine | `/culture/local-cuisine` | ✅ Complete |
| Festivals & Celebrations | `/culture/festivals-celebrations` | ✅ Complete |
| Cultural Practices & Traditions | `/culture/practices-traditions` | ✅ Complete |
| Crafts & Artisan | `/culture/crafts-artisan` | ✅ Complete |
| People Wonders | `/culture/people-wonders` | ✅ Complete |
| Tourism Wonders | `/places/tourism-wonders` | ✅ Complete |
| Local Business | `/arts-livelihood/local-business` | ✅ Complete |
| Hospitals | `/community/hospitals` | ✅ Complete |
| Schools | `/community/schools` | ✅ Complete |
| Inquire | `/inquire` | ✅ Complete |

---

#### Admin CMS Pages (`app/(admin)/admin/`)

| Page | Route | Status |
|------|-------|--------|
| Login | `/admin` | ✅ Complete |
| Dashboard | `/admin/dashboard` | ✅ Complete |
| CMS / Posts | `/admin/cms` | ✅ Complete |
| Inquiries | `/admin/inquiries` | ✅ Complete |
| Heroes | `/admin/heroes` | ✅ Complete |
| Home Content | `/admin/home-content` | ✅ Complete |
| Settings | `/admin/settings` | ✅ Complete |
| Activity Log | `/admin/activity-log` | ✅ Complete |

---

### March 2, 2026 — Frontend Refactoring & Performance Optimization

**Scope:** 33+ frontend files refactored across the entire codebase.

#### 1. Performance Fixes (CPU/Memory)

| File | Issue | Fix |
| ---- | ----- | --- |
| `hero-section.tsx` | Scroll handler fired `setState` on every pixel, causing excessive re-renders | Wrapped in `requestAnimationFrame` with ref-based deduplication; added `useMemo` for scroll-derived parallax values |
| `places-carousel.tsx` | `isPlaying` was a `useState` causing re-render loop every autoplay tick | Replaced with `useRef` (`isAutoPlayActiveRef`) — avoids re-render entirely |
| `reveal-observer.tsx` | `MutationObserver` called `querySelectorAll` on every single DOM mutation | Added 100ms debounce; set `attributes: false, characterData: false` to exclude unnecessary observations |

#### 2. Variable & Function Renaming (Readability)

Renamed vague/abbreviated identifiers to be descriptive and intent-revealing across all major files:

| File | Example renames |
| ---- | --------------- |
| `hero-section.tsx` | `loaded` → `isDataLoaded`, `lerp` → `linearInterpolation`, `currentSlide` → `activeSlideIndex` |
| `navbar.tsx` | `open` → `isMobileMenuOpen`, `scrolled` → `isScrolled`, `hoveredDropdown` → `activeDesktopDropdown` (~20 renames) |
| `places-carousel.tsx` | `api` → `carouselApi`, `activeIndex` → `activeSlideIndex`, `isPlaying` → `isAutoPlayActiveRef` |
| `search-overlay.tsx` | `query` → `searchQuery`, `results` → `searchResults`, `loading` → `isSearching`, `activeIndex` → `highlightedResultIndex` |
| `api.ts` | `qs` → `queryString`, `data` → `postData`/`inquiryData`/`settingsData`, `res` → `response` |
| `news-section.tsx` | `articles` → `featuredArticles`, `loading` → `isLoading`, `categoryLabels` → `newsCategoryDisplayLabels` |
| `culinary-section.tsx` | `delicacies` → `allDelicacies`, `displayItems` → `displayedDelicacies` |
| `history-art-section.tsx` | `TimelineEvent` → `TimelineMilestone`, `timelineEvents` → `timelineMilestones`, `expanded` → `isDetailExpanded` |
| `featured-spotlight.tsx` | `spotlight` → `spotlightData`, `imageUrl` → `spotlightImageUrl` |
| `admin-provider.tsx` | `ctx` → `adminContext`, `loadJson` → `loadJsonFromStorage`, `mounted` → `isHydrated`, `loading` → `isLoadingBackendData` |

#### 3. JSDoc & Architecture Comments

- Added JSDoc comments to **~20 functions** in `api.ts` (the centralized API client).
- Added a **detailed architecture explanation comment** in `news-section.tsx` describing the 3-tier REST API flow (Frontend → HTTP → PHP → MySQL), explaining why the app uses HTTP fetch instead of direct SQL.
- Added **inline fetch-flow comments** to every `useEffect` that fetches data across **33 page/component files**, showing the exact HTTP endpoint and the SQL query the PHP backend runs. Example:
  ```ts
  // Sends GET /api/posts/read.php?type=news → PHP runs SQL SELECT → returns JSON
  useEffect(() => { apiFetchPublishedNews() ... })
  ```

#### 4. Bug Fixes Found During Refactoring

| File | Bug | Fix |
| ---- | --- | --- |
| `admin/inquiries/page.tsx` | `tab.key === "inbox"` — type `MailboxTab` doesn't contain `"inbox"` (TypeScript error) | Changed to `tab.key === "unread"` |
| `lib/api.ts` | `CreateInquiryPayload` missing `purpose` field — inquire form passes `purpose` but the type rejected it | Added `purpose?: string` to the interface |
| `culinary-section.tsx` | Renamed loop var `i` → `cardIndex` but missed one reference in template literal | Fixed the reference to use `cardIndex` |

#### 5. Files Modified

<details>
<summary>Click to expand full list (33 frontend files)</summary>

**Components:**
- `components/sections/hero-section.tsx`
- `components/sections/places-carousel.tsx`
- `components/sections/news-section.tsx`
- `components/sections/culinary-section.tsx`
- `components/sections/history-art-section.tsx`
- `components/sections/featured-spotlight.tsx`
- `components/layout/navbar.tsx`
- `components/layout/search-overlay.tsx`
- `components/reveal-observer.tsx`
- `components/providers/admin-provider.tsx`

**Library:**
- `lib/api.ts`

**Pages:**
- `app/(site)/news/page.tsx`
- `app/(site)/news/[id]/news-detail-client.tsx`
- `app/(site)/events/page.tsx`
- `app/(site)/places/page.tsx`
- `app/(site)/places/[id]/place-details-client.tsx`
- `app/(site)/arts-livelihood/page.tsx`
- `app/(site)/travel-tours/page.tsx`
- `app/(site)/culture/page.tsx`
- `app/(site)/culture/practices-traditions/page.tsx`
- `app/(site)/culture/people-wonders/page.tsx`
- `app/(site)/culture/local-cuisine/page.tsx`
- `app/(site)/culture/festivals-celebrations/page.tsx`
- `app/(site)/culture/crafts-artisan/page.tsx`
- `app/(site)/destinations/page.tsx`
- `app/(site)/destinations/heritage-sites/page.tsx`
- `app/(site)/destinations/museums/page.tsx`
- `app/(site)/destinations/religious-sites/page.tsx`
- `app/(site)/community/colleges/page.tsx`
- `app/(site)/community/bocauenos/page.tsx`
- `app/(site)/community/hospitals/page.tsx`
- `app/(site)/community/schools/page.tsx`
- `app/(site)/community/public-schools/page.tsx`
- `app/(site)/history/page.tsx`
- `app/(site)/history/timeline/page.tsx`
- `app/(site)/history/notable-persons/page.tsx`

**Admin:**
- `app/(admin)/admin/inquiries/page.tsx`
- `app/(admin)/admin/home-content/page.tsx`

</details>
