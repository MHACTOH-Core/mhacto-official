# MHACTO Official — Bocaue Municipal History, Arts, Culture & Tourism Office

A full-stack web application for the Municipality of Bocaue, Bulacan, Philippines — showcasing local tourism, culture, history, and community services with an admin CMS dashboard.

## Tech Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Frontend | Next.js 16, React, TypeScript, Tailwind CSS     |
| UI       | shadcn/ui component library                     |
| Backend  | PHP (vanilla, no framework)                     |
| Database | MySQL (10 tables — see `backend/…/schema.sql`)  |
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
