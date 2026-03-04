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
│   ├── api/           # REST endpoints (auth, posts, inquiries, etc.)
│   ├── config/        # Database connection
│   ├── core/          # Response helpers, security
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

### March 4, 2026 — Implementation Status Audit

#### Frontend — Pages & Components

##### Public Site Pages (`app/(site)/`)

| Page | Route | Backend Integrated | Status |
|------|-------|-------------------|--------|
| Home | `/` | ✅ Hero, Spotlight, Landmarks, News, Culinary, Timeline, Inquiries | ✅ Done |
| Destinations | `/destinations` | ✅ `apiFetchPublishedPlaces` → posts/read.php | ✅ Done |
| Place Detail | `/places/[id]` | ✅ `apiFetchPlaceById` + `apiLogDestinationView` | ✅ Done |
| Place Category | `/places/category/[slug]` | ✅ `apiFetchPlacesByCategory` | ✅ Done |
| News | `/news` | ✅ `apiFetchPublishedNews` → posts/read.php | ✅ Done |
| News Detail | `/news/[id]` | ✅ `apiFetchPostById` | ✅ Done |
| Events | `/events` | ✅ `apiFetchPublishedEvents` → posts/read.php | ✅ Done |
| Travel & Tours | `/travel-tours` | ✅ `apiFetchPublishedPlaces` (label: travel-tours) | ✅ Done |
| History | `/history` | ✅ `apiFetchMilestones` | ✅ Done |
| History Timeline | `/history/timeline` | ✅ `apiFetchMilestones` | ✅ Done |
| Notable Persons | `/history/notable-persons` | ✅ `apiFetchPublishedPlaces` | ✅ Done |
| Culture | `/culture` | ✅ `apiFetchPublishedPlaces` (label: festivals/practices) | ✅ Done |
| Local Cuisine | `/culture/local-cuisine` | ✅ `apiFetchPublishedPlaces` | ✅ Done |
| Festivals | `/culture/festivals-celebrations` | ✅ `apiFetchPublishedPlaces` | ✅ Done |
| Cultural Practices | `/culture/practices-traditions` | ✅ `apiFetchPublishedPlaces` | ✅ Done |
| Crafts & Artisan | `/culture/crafts-artisan` | ✅ `apiFetchPublishedPlaces` | ✅ Done |
| People & Wonders | `/culture/people-wonders` | ✅ `apiFetchPublishedPlaces` | ✅ Done |
| Arts & Livelihood | `/arts-livelihood` | ❌ Static / no integration | ⚠️ Static only |
| Local Business | `/arts-livelihood/local-business` | ✅ `apiFetchPublishedPlaces` | ✅ Done |
| Community | `/community` | ❌ Static layout page | ⚠️ Static only |
| Hospitals | `/community/hospitals` | ✅ `apiFetchPublishedPlaces` (label: hospitals) | ✅ Done |
| Schools | `/community/schools` | ✅ `apiFetchPublishedPlaces` (label: schools) | ✅ Done |
| Inquire | `/inquire` | ✅ `apiCreateInquiry` → inquiries/create.php | ✅ Done |
| Contact | `/contact` | ❌ Static layout page | ⚠️ Static only |
| Mission & Vision | `/mission-vision` | ❌ Static layout page | ⚠️ Static only |
| Tourism Office | `/tourism-office` | ❌ Static layout page | ⚠️ Static only |

##### Admin CMS Pages (`app/(admin)/admin/`)

| Page | Route | Backend Integrated | Status |
|------|-------|-------------------|--------|
| Login / Root | `/admin` | ✅ `apiLogin` → auth/login.php | ✅ Done |
| Dashboard | `/admin/dashboard` | ✅ `apiFetchPageViews`, `apiFetchDailyVisits`, `apiFetchTopDestinations`, `apiFetchPosts`, `apiFetchInquiries` | ✅ Done |
| CMS / Posts | `/admin/cms` | ✅ `apiFetchPosts`, `apiCreatePost`, `apiUpdatePost`, `apiDeletePost` | ✅ Done |
| Inquiries | `/admin/inquiries` | ✅ `apiFetchInquiries`, `apiUpdateInquiry`, `apiDeleteInquiry` | ✅ Done |
| Heroes | `/admin/heroes` | ✅ `apiFetchAllPageHeroes`, `apiUpdatePageHero` | ✅ Done |
| Home Content | `/admin/home-content` | ✅ `apiFetchSettings`, `apiUpdateSettings` | ✅ Done |
| Settings | `/admin/settings` | ✅ `apiFetchSettings`, `apiUpdateSettings` | ✅ Done |
| Activity Log | `/admin/activity-log` | ✅ `apiFetchActivityLog` → activity/read.php | ✅ Done |

##### Reusable Sections (`components/sections/`)

| Component | Backend Integrated | Status |
|-----------|-------------------|--------|
| `hero-section.tsx` | ✅ `apiFetchHeroSettings` → home/hero-settings.php | ✅ Done |
| `featured-spotlight.tsx` | ✅ `apiFetchSpotlight` → home/spotlight.php | ✅ Done |
| `places-carousel.tsx` | ✅ `apiFetchLandmarks` → home/landmarks.php | ✅ Done |
| `news-section.tsx` | ✅ `apiFetchPublishedNews` → posts/read.php | ✅ Done |
| `culinary-section.tsx` | ✅ `apiFetchCulinaries` → home/culinary.php | ✅ Done |
| `history-art-section.tsx` | ✅ `apiFetchMilestones` → home/milestones.php | ✅ Done |
| `inquiry-section.tsx` | ✅ `apiCreateInquiry` → inquiries/create.php | ✅ Done |
| `page-hero.tsx` | ✅ `apiFetchPageHero` → heroes/read.php | ✅ Done |
| `featured-events-portrait.tsx` | ❌ No backend call (static/placeholder) | ⚠️ Not integrated |
| `announcement-section.tsx` | ❌ No backend call (static/placeholder) | ⚠️ Not integrated |
| `location-section.tsx` | ❌ Static embed | ⚠️ Static only |
| `tourism-tagline-section.tsx` | ❌ Static copy | ⚠️ Static only |

##### Layout Components (`components/layout/`)

| Component | Status |
|-----------|--------|
| `navbar.tsx` | ✅ Done |
| `footer.tsx` | ✅ Done |
| `admin-sidebar.tsx` | ✅ Done |
| `places-events-dropdown.tsx` | ✅ Done |
| `search-overlay.tsx` | ✅ Done (uses static search index) |

---

#### Backend — API Endpoints

##### Auth (`api/auth/`)

| File | Method | Description | Status |
|------|--------|-------------|--------|
| `login.php` | POST | Validate credentials, return session token | ✅ Done |
| `register.php` | POST | Create new admin user | ✅ Done |

##### Posts / CMS (`api/posts/`)

| File | Method | Description | Status |
|------|--------|-------------|--------|
| `read.php` | GET | List posts — filterable by `type`, `status`, `category` | ✅ Done |
| `create.php` | POST | Create a new content post | ✅ Done |
| `update.php` | PUT | Update post by `?id=` | ✅ Done |
| `delete.php` | DELETE | Delete post by `?id=` | ✅ Done |

##### Inquiries (`api/inquiries/`)

| File | Method | Description | Status |
|------|--------|-------------|--------|
| `create.php` | POST | Submit public inquiry | ✅ Done |
| `read.php` | GET | List inquiries — filterable by `status` | ✅ Done |
| `update.php` | PUT | Update inquiry status by `?id=` | ✅ Done |
| `delete.php` | DELETE | Delete inquiry by `?id=` | ✅ Done |
| `reply.php` | POST | ⚠️ Deprecated — removed in schema v3 | ⚠️ Deprecated |

##### Heroes (`api/heroes/`)

| File | Method | Description | Status |
|------|--------|-------------|--------|
| `read.php` | GET | Get all page heroes or single by `?slug=` | ✅ Done |
| `update.php` | PUT | Update hero config by `?slug=` | ✅ Done |

##### Home Content (`api/home/`)

| File | Method | Description | Status |
|------|--------|-------------|--------|
| `hero.php` | GET | Hero section data | ✅ Done |
| `hero-settings.php` | GET | Hero config from `config` table | ✅ Done |
| `spotlight.php` | GET | Featured spotlight content | ✅ Done |
| `landmarks.php` | GET | Landmark places for carousel | ✅ Done |
| `milestones.php` | GET | Historical timeline milestones | ✅ Done |
| `culinary.php` | GET | Culinary/food section content | ✅ Done |

##### Destinations (`api/destinations/`)

| File | Method | Description | Status |
|------|--------|-------------|--------|
| `read.php` | GET | List destinations/places | ✅ Done |
| `create.php` | POST | Create destination | ✅ Done |

##### Analytics (`api/analytics/`)

| File | Method | Description | Status |
|------|--------|-------------|--------|
| `log-view.php` | POST | Log a destination page click | ✅ Done |
| `top-destinations.php` | GET | Top N most-clicked destinations | ✅ Done |
| `pageviews.php` | GET | Page view stats for dashboard | ✅ Done |
| `visits.php` | GET | Daily visit counts (`?days=`) | ✅ Done |

##### Activity Logs (`api/activity/`)

| File | Method | Description | Status |
|------|--------|-------------|--------|
| `log.php` | POST | Record a CMS action (create/update/delete/login) | ✅ Done |
| `read.php` | GET | List activity log entries (`?limit=`) | ✅ Done |

##### Media (`api/media/`)

| File | Method | Description | Status |
|------|--------|-------------|--------|
| `upload.php` | POST | Upload image/video to `uploads/images/` | ✅ Done |
| `list.php` | GET | List uploaded media files (`?type=`) | ✅ Done |
| `delete.php` | DELETE | Delete media file by `?path=` | ✅ Done |

##### Settings (`api/settings/`)

| File | Method | Description | Status |
|------|--------|-------------|--------|
| `read.php` | GET | Read all settings from `config` table | ✅ Done |
| `update.php` | PUT | Bulk-update settings | ✅ Done |

##### Models (`models/`)

| Model | Tables Used | Status |
|-------|-------------|--------|
| `User.php` | `users` | ✅ Done |
| `Post.php` | `content`, `content_fields`, `content_images`, `category` | ✅ Done |
| `Inquiry.php` | `inquiries` | ✅ Done |
| `HomeContent.php` | `config`, `content`, `featured_content` | ✅ Done |
| `PageHero.php` | `config` | ✅ Done |
| `Destination.php` | `content`, `category`, `content_images` | ✅ Done |
| `Analytics.php` | `page_views`, `activity_logs` | ✅ Done |
| `ActivityLog.php` | `activity_logs` | ✅ Done |
| `PageView.php` | `page_views`, `content` | ✅ Done |
| `Settings.php` | `config` | ✅ Done |

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
