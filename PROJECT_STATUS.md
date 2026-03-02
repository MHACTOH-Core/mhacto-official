# MHACTO Official — Project Status & Documentation

> **Municipality of Bocaue Tourism & Heritage Website**
> Last updated: February 28, 2026

---

## Tech Stack

| Layer | Technology | Details |
|-------|-----------|---------|
| **Frontend** | Next.js 16.1.6 (Turbopack) | React 19, App Router, TypeScript |
| **Styling** | Tailwind CSS 4 + shadcn/ui | Dark/light mode via `next-themes` |
| **Backend** | PHP (vanilla) | REST API, served at `localhost:8000` |
| **Database** | MySQL | Database: `mhacto_db` |
| **Package Manager** | pnpm | Frontend dependency management |
| **Icons** | Lucide React | Icon library |
| **Carousel** | Embla Carousel | Used in hero, cuisine, places, spotlight |
| **Charts** | Recharts | Admin dashboard analytics |
| **Date Handling** | date-fns | News & event date formatting |

---

## Codebase Structure

```
mhacto-official/
├── frontend/                         # Next.js application
│   ├── app/
│   │   ├── (site)/                   # Public tourist website (all pages)
│   │   │   ├── page.tsx              # Home page (hero, spotlight, sections)
│   │   │   ├── destinations/         # Heritage sites, museums, religious sites
│   │   │   ├── culture/              # Cuisine, festivals, traditions, artisans, people
│   │   │   ├── history/              # Timeline, notable persons
│   │   │   ├── community/            # Schools, colleges, hospitals, bocauenos
│   │   │   ├── travel-tours/         # Tour packages
│   │   │   ├── arts-livelihood/      # Crafts & artisans overview
│   │   │   ├── places/               # All places index, detail view
│   │   │   ├── news/                 # News listing & detail
│   │   │   ├── events/               # Events listing
│   │   │   ├── inquire/              # Public inquiry form
│   │   │   ├── contact/              # Contact information (static)
│   │   │   ├── mission-vision/       # Mission & Vision (static)
│   │   │   └── tourism-office/       # Tourism office info (static)
│   │   └── (admin)/admin/            # Admin CMS panel
│   │       ├── page.tsx              # Login
│   │       ├── dashboard/            # Analytics dashboard
│   │       ├── cms/                  # Content management (create/edit/delete posts)
│   │       ├── home-content/         # Home page content manager
│   │       ├── inquiries/            # Inquiry management + reply
│   │       ├── activity-log/         # Activity log viewer
│   │       └── settings/             # Site settings
│   ├── components/
│   │   ├── layout/                   # Navbar, Footer, AdminSidebar, SearchOverlay
│   │   ├── sections/                 # Home page sections (hero, spotlight, culinary, etc.)
│   │   ├── providers/                # AdminProvider, ThemeProvider
│   │   └── ui/                       # shadcn/ui components + MediaPicker
│   ├── lib/
│   │   ├── api.ts                    # All API fetch functions + types
│   │   ├── cms-mappers.ts            # CMSPost → page-specific data type mappers
│   │   ├── utils.ts                  # Asset helper, cn(), etc.
│   │   └── data/                     # TypeScript interfaces + fallback data
│   └── public/                       # Static assets (images, fonts)
│
├── backend/my-php-backend/           # PHP REST API
│   ├── api/
│   │   ├── posts/                    # CRUD for content posts
│   │   ├── home/                     # Home page data endpoints (hero, spotlight, etc.)
│   │   ├── inquiries/                # Inquiry CRUD + reply
│   │   ├── auth/                     # Login & register
│   │   ├── media/                    # Image upload, list, delete
│   │   ├── activity/                 # Activity logging
│   │   ├── analytics/                # Pageviews & visits
│   │   ├── settings/                 # Site settings read/update
│   │   └── destinations/             # Legacy destinations endpoint
│   ├── models/                       # PHP model classes (Post, User, Inquiry, etc.)
│   ├── config/database.php           # MySQL connection config
│   ├── core/                         # Response helper, security middleware
│   └── database/                     # SQL schema + migrations
│
├── PROJECT_STATUS.md                 # ← This file
└── mhacto_db_export_20260226.sql     # Database export
```

---

## Content Labels (CMS)

All content is organized by **Category → Label** in the CMS:

| Category | Labels | Backend Label Key |
|----------|--------|-------------------|
| **Destinations** | Destinations | `destinations` |
| **Culture** | Local Cuisine, Festivals, Cultural Practices, Crafts & Artisan, People & Wonders | `local-cuisine`, `festivals`, `cultural-practices`, `crafts-artisan`, `people-wonders` |
| **History** | Timeline of Events, Notable Figures | `timeline-of-events`, `notable-figures` |
| **Tourism** | Travel & Tours | `travel-tours` |
| **News** | News | `news` |
| **Events** | Events | `events` |
| **Community** | Schools, Colleges, Hospitals, Bocaueños | `schools`, `colleges`, `hospitals`, `bocauenos` |

---

## Backend Integration Status

### ✅ Fully Connected to Backend (Working)

These pages fetch data from the PHP backend API via `api.ts` and display CMS-managed content:

| Page | Route | API Function | Backend Label/Endpoint |
|------|-------|-------------|----------------------|
| **Home — Hero** | `/` (section) | `apiFetchHeroSlides()` | `/api/home/hero.php` |
| **Home — Featured Spotlight** | `/` (section) | `apiFetchSpotlight()` | `/api/home/spotlight.php` |
| **Home — Culinary** | `/` (section) | `apiFetchCulinaryItems()` | `/api/home/culinary.php` |
| **Home — History Timeline** | `/` (section) | `apiFetchMilestones()` | `/api/home/milestones.php` |
| **Home — Places Carousel** | `/` (section) | `apiFetchPublishedPlaces()` | `/api/posts/read.php` |
| **Home — News** | `/` (section) | `apiFetchPublishedNews()` | `/api/posts/read.php` |
| **Destinations Hub** | `/destinations` | `apiFetchByLabel("destinations")` | `/api/posts/read.php?label=destinations` |
| **Heritage Sites** | `/destinations/heritage-sites` | `apiFetchByLabel("destinations")` | filtered by category |
| **Museums** | `/destinations/museums` | `apiFetchByLabel("destinations")` | filtered by category |
| **Religious Sites** | `/destinations/religious-sites` | `apiFetchByLabel("destinations")` | filtered by category |
| **Culture Hub** | `/culture` | Multiple `apiFetchByLabel()` | cuisine + festivals + practices |
| **Local Cuisine** | `/culture/local-cuisine` | `apiFetchByLabel("local-cuisine")` | Food type via `place_category` |
| **Festivals** | `/culture/festivals-celebrations` | `apiFetchByLabel("festivals")` | label: `festivals` |
| **Cultural Practices** | `/culture/practices-traditions` | `apiFetchByLabel("cultural-practices")` | label: `cultural-practices` |
| **Crafts & Artisan** | `/culture/crafts-artisan` | `apiFetchByLabel("crafts-artisan")` | + `cultural-practices` |
| **People & Wonders** | `/culture/people-wonders` | `apiFetchByLabel("people-wonders")` | label: `people-wonders` |
| **History Hub** | `/history` | Multiple `apiFetchByLabel()` | timeline + notable figures |
| **Timeline** | `/history/timeline` | `apiFetchByLabel("timeline-of-events")` | label: `timeline-of-events` |
| **Notable Persons** | `/history/notable-persons` | `apiFetchByLabel("notable-figures")` | label: `notable-figures` |
| **Travel & Tours** | `/travel-tours` | `apiFetchByLabel("travel-tours")` | label: `travel-tours` |
| **Arts & Livelihood Hub** | `/arts-livelihood` | `apiFetchByLabel("crafts-artisan")` | label: `crafts-artisan` |
| **All Places** | `/places` | `apiFetchPublishedPlaces()` | all published place posts |
| **Place Detail** | `/places/[id]` | `apiFetchPostById(id)` | single post fetch |
| **News Listing** | `/news` | `apiFetchPublishedNews()` | post_type: `news` |
| **Events Listing** | `/events` | `apiFetchPublishedEvents()` | post_type: `event` |
| **Inquiry Form** | `/inquire` | `apiCreateInquiry()` | `/api/inquiries/create.php` |
| **Schools** | `/community/schools` | `apiFetchByLabel("schools")` | label: `schools` |
| **Public Schools** | `/community/public-schools` | `apiFetchByLabel("schools")` | filtered subset |
| **Colleges** | `/community/colleges` | `apiFetchByLabel("colleges")` | label: `colleges` |
| **Hospitals** | `/community/hospitals` | `apiFetchByLabel("hospitals")` | label: `hospitals` |
| **Bocaueños** | `/community/bocauenos` | `apiFetchByLabel("bocauenos")` | label: `bocauenos` |

### ✅ Admin Panel (Working)

| Page | Route | Description |
|------|-------|-------------|
| **Login** | `/admin` | JWT-based authentication |
| **Dashboard** | `/admin/dashboard` | Analytics with charts (pageviews, visits) |
| **CMS** | `/admin/cms` | Full CRUD for all content posts (place/news/event) |
| **Home Content** | `/admin/home-content` | Manage home page sections (hero, spotlight, culinary, milestones) |
| **Inquiries** | `/admin/inquiries` | View, reply, delete inquiries |
| **Activity Log** | `/admin/activity-log` | View admin activity history |
| **Settings** | `/admin/settings` | Site settings management |

### ❌ Not Connected to Backend (Static / Hardcoded)

These pages use only local TypeScript data or are fully static with no dynamic content:

| Page | Route | Notes |
|------|-------|-------|
| **Contact** | `/contact` | Static contact info (address, phone, email) — OK as static |
| **Mission & Vision** | `/mission-vision` | Static institutional content — OK as static |
| **Tourism Office** | `/tourism-office` | Static info about the tourism office — OK as static |
| **Crafts & Artisans** (sub) | `/arts-livelihood/crafts-artisans` | Duplicate/legacy page under arts-livelihood |
| **Local Business** | `/arts-livelihood/local-business` | Uses local hardcoded data |
| **News Detail** | `/news/[id]` | Renders from passed state/params, no dedicated API fetch |
| **Places by Category** | `/places/category/[slug]` | Uses local data, not connected to API |

### ⚠️ Known Issues

| Issue | Details |
|-------|---------|
| `/places/[id]` build error | Missing `generateStaticParams()` — required for `output: export` mode. Does not affect dev mode, only static export builds. |
| Home page (`/`) | No direct API call in `page.tsx` — each section component independently fetches its own data. This is by design. |

---

## CMS Features

### Content Post Fields
- **Title** — Post title
- **Body** — Main content / description
- **Category** — Top-level category (destinations, culture, history, etc.)
- **Label** — Sub-category label (local-cuisine, festivals, etc.)
- **Post Type** — `place` | `news` | `event`
- **Status** — `draft` | `published` | `archived`
- **Images** — Multiple images via URL or file upload (MediaPicker)
- **Location** — Address / location text
- **Hours** — Operating hours or best time
- **Contact** — Contact information
- **Established** — Year established or date
- **Place Type / Food Type** — Category-specific sub-type:
  - Destinations: Heritage Site, Religious Site, Museum, Nature & Parks, Landmark, etc.
  - Local Cuisine: Main Dish, Snack, Dessert & Sweets, Drink
  - Festivals: Festival Grounds, Arena & Events Venue
  - Other labels have their own relevant types
- **Story** — Extended narrative / background story
- **Highlights** — Bullet-point highlights (one per line)
- **Featured** — Toggle to mark as featured (appears in carousels, spotlights, dropdowns)
- **News Date** — Date field for news articles and events

### Data Flow
```
Admin CMS → PHP API → MySQL (content table) → API endpoints → Next.js pages → cmsToCuisineItem() / cmsToHeritageSite() etc. → Rendered UI
```

### CMS Mappers (`cms-mappers.ts`)
Converts generic `CMSPost` objects to page-specific types:
- `cmsToHeritageSite()` — Heritage site cards
- `cmsToMuseum()` — Museum entries
- `cmsToReligiousSite()` — Religious site cards
- `cmsToTourPackage()` — Tour package cards
- `cmsToCuisineItem()` — Cuisine items (type mapped from `place_category`)
- `cmsToFestival()` — Festival entries
- `cmsToCulturalPractice()` — Cultural practice cards
- `cmsToArtisan()` — Artisan profiles
- `cmsToPeopleWonder()` — People & wonders entries
- `cmsToTimelineEvent()` — History timeline events
- `cmsToNotablePerson()` — Notable person profiles
- `cmsToSchoolEntry()` / `cmsToPublicSchool()` / `cmsToCollege()` / `cmsToHospital()` — Community entries

---

## Backend API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts/read.php` | Read posts (supports `?label=`, `?category=`, `?id=`, `?type=`, `?status=`) |
| POST | `/api/posts/create.php` | Create new content post |
| PUT | `/api/posts/update.php` | Update existing post |
| DELETE | `/api/posts/delete.php` | Delete post |
| GET | `/api/home/hero.php` | Hero slider content |
| GET | `/api/home/spotlight.php` | Featured spotlight |
| GET | `/api/home/culinary.php` | Culinary section items |
| GET | `/api/home/milestones.php` | History milestones |
| GET | `/api/home/landmarks.php` | Featured landmarks |
| GET | `/api/home/hero-settings.php` | Hero configuration |
| GET | `/api/inquiries/read.php` | Read inquiries |
| POST | `/api/inquiries/create.php` | Submit inquiry (public) |
| PUT | `/api/inquiries/update.php` | Update inquiry status |
| POST | `/api/inquiries/reply.php` | Reply to inquiry |
| DELETE | `/api/inquiries/delete.php` | Delete inquiry |
| POST | `/api/auth/login.php` | Admin login (JWT) |
| POST | `/api/auth/register.php` | Admin registration |
| POST | `/api/media/upload.php` | Upload media file |
| GET | `/api/media/list.php` | List uploaded media |
| DELETE | `/api/media/delete.php` | Delete media file |
| POST | `/api/activity/log.php` | Log admin activity |
| GET | `/api/activity/read.php` | Read activity log |
| GET | `/api/analytics/pageviews.php` | Pageview analytics |
| GET | `/api/analytics/visits.php` | Visit analytics |
| GET | `/api/settings/read.php` | Read site settings |
| PUT | `/api/settings/update.php` | Update site settings |

---

## Database Schema (Key Tables)

### `content` (main content table)
| Column | Type | Description |
|--------|------|-------------|
| id | INT AUTO_INCREMENT | Primary key |
| title | VARCHAR(255) | Post title |
| body | TEXT | Main content |
| post_type | ENUM('place','news','event') | Type of content |
| content_category | VARCHAR(100) | Category (destinations, culture, etc.) |
| label_id | VARCHAR(100) | Label slug (local-cuisine, festivals, etc.) |
| status | ENUM('draft','published','archived') | Publication status |
| is_featured | TINYINT(1) | Featured flag |
| image | JSON | Array of image URLs |
| location | VARCHAR(255) | Location text |
| hours | VARCHAR(255) | Operating hours |
| contact | VARCHAR(255) | Contact info |
| established | VARCHAR(100) | Year/date established |
| place_category | VARCHAR(100) | Sub-type (Heritage Site, Main Dish, etc.) |
| story | TEXT | Extended narrative |
| highlights | JSON | Array of highlight strings |
| news_date | DATE | Date for news/events |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

---

## What Should Be Done Next

### High Priority
1. **Fix `/places/[id]` static export** — Add `generateStaticParams()` or convert to client-side fetching to fix the build error with `output: export`
2. **News Detail page (`/news/[id]`)** — Connect to backend API for individual news article fetching
3. **Places by Category (`/places/category/[slug]`)** — Wire to backend API filtering by `place_category`

### Medium Priority
4. **Local Business page (`/arts-livelihood/local-business`)** — Add CMS label and connect to backend
5. **Clean up duplicate arts-livelihood pages** — `/arts-livelihood/crafts-artisans` appears to be a duplicate of `/culture/crafts-artisan`; consolidate or remove
6. **Inquiry email notifications** — Send email to admin when a new inquiry is submitted
7. **Search functionality** — The search overlay exists but `search-index.ts` may need to pull from API instead of static data

### Low Priority / Enhancements
8. **Image optimization** — Use Next.js Image component consistently with proper `sizes` and formats; consider CDN
9. **SEO metadata** — Add dynamic `generateMetadata()` for all pages using CMS data
10. **Pagination** — Add pagination for news, events, and places listing pages when content grows
11. **Caching** — Add API response caching (SWR or React Query) to reduce redundant fetches
12. **Tourism Tagline section** — Currently static on home page; could be made CMS-editable via settings
13. **Contact page** — Could be connected to backend settings for editable contact info
14. **User roles** — Currently single admin; could add editor/viewer roles
15. **Content versioning** — Track edit history for content posts

---

## Development Setup

### Frontend
```bash
cd frontend
pnpm install
pnpm dev          # Starts at http://localhost:3000
```

### Backend
```bash
cd backend/my-php-backend
php -S localhost:8000   # Built-in PHP server
```

### Database
- Import `mhacto_db_export_20260226.sql` into MySQL
- Run migrations in `backend/my-php-backend/database/` if needed
- Config: `backend/my-php-backend/config/database.php`

---

## Recent Changes (Feb 28, 2026)

- **CMS Food Type selector**: When creating local-cuisine posts, the "Place Type" dropdown now shows as "Food Type" with options: Main Dish, Snack, Dessert & Sweets, Drink
- **Featured cuisine carousel**: Local cuisine page carousel now filters to `is_featured` items only (falls back to all if none marked)
- **`isFeatured` on CuisineItem**: Added to interface and mapper so the featured toggle in CMS propagates to the cuisine page
- **Removed food ratings/reviews**: Local cuisine page cleaned of star ratings, reviews — site is a tourism showcase, not a food review platform
- **All tourist site pages connected to backend**: Destinations, culture, history, community, travel-tours, arts-livelihood — all fetch from CMS API
- **Community pages added**: Schools, public schools, colleges, hospitals, bocaueños — all CMS-managed
- **Home page mock data removed**: All home sections (hero, spotlight, culinary, places, history, news) fetch from backend; empty states shown when no data
