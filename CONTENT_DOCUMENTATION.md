# MHACTO Bocaue Tourism Website - Content Documentation

> This document serves as a reference for all dynamic content managed through the CMS.  
> **Last Updated:** February 26, 2026

---

## 📋 Table of Contents

1. [Home Page Sections](#home-page-sections)
2. [Hero Section (Carousel)](#1-hero-section-carousel)
3. [Featured Spotlight](#2-featured-spotlight)
4. [Taste of Bocaue (Culinary)](#3-taste-of-bocaue-culinary-section)
5. [Heritage & Culture (Milestones)](#4-heritage--culture-milestones)
6. [Latest Updates (News)](#5-latest-updates-news-section)
7. [Places & Destinations](#6-places--destinations)
8. [Database Schema](#database-schema)
9. [API Endpoints](#api-endpoints)

---

## Home Page Sections

The home page consists of the following CMS-managed sections:

| Section | Description | Admin Editable | Display Limit |
|---------|-------------|----------------|---------------|
| Hero Carousel | Full-screen rotating slides | ✅ Yes | No limit |
| Featured Spotlight | Highlighted event (Pagoda Festival) | ✅ Yes | 1 active |
| Taste of Bocaue | Featured culinary delicacies | ✅ Yes | 4 items max |
| Heritage & Culture | Timeline milestones of Bocaue | ✅ Yes | No limit |
| Latest Updates | News & stories from Bocaue | ✅ Yes | 4 items max |
| Places Carousel | Tourist destinations | ✅ Yes (via CMS) | Dynamic |

---

## 1. Hero Section (Carousel)

### Current Content:
| Order | Title | Highlight | Link |
|-------|-------|-----------|------|
| 1 | The Iconic | Pagoda Festival | /places/bocaue-river-festival |
| 2 | Explore The River | Town Wonders | /destinations |
| 3 | St. Martin of Tours | Parish Church | /places/st-martin-church |
| 4 | The Iconic | Philippine Arena | /places/philippine-arena |
| 5 | Bocaue's Famous | Pyrotechnic Arts | /destinations |

### Fields:
```typescript
interface HeroSlide {
  slideId: number
  src: string          // Image/video URL
  alt: string          // Image alt text
  subtitle: string     // Small text above title
  title: string        // Main title (first line)
  highlight: string    // Highlighted text (second line)
  description: string  // Description paragraph
  href: string         // Link destination
  sortOrder: number    // Display order
  isActive: boolean    // Show/hide slide
}
```

---

## 2. Featured Spotlight

### Current Content:
- **Event:** Pagoda Festival 2026
- **Date:** July 4, 2026
- **Location:** Bocaue River, Bulacan
- **Description:** Join us for the centuries-old fluvial celebration of faith...

### Fields:
```typescript
interface Spotlight {
  spotlightId: number
  title: string        // Event name
  description: string  // Event description
  image: string | null // Background image URL
  date: string | null  // Event date (ISO format)
  location: string | null // Event location
  isActive: boolean    // Only 1 can be active at a time
}
```

---

## 3. Taste of Bocaue (Culinary Section)

### Current Content:
| Order | Title | Tag | Description |
|-------|-------|-----|-------------|
| 1 | Bocaue Chicharon | Street Food Icon | Crispy, golden pork rinds perfected over generations... |
| 2 | Traditional Kakanin | Heritage Sweets | Suman, bibingka, puto, and other rice cakes... |
| 3 | River Seafood & Ulam | Local Favourites | Fresh catches from the Bocaue River... |

### Display Rules:
- **Maximum displayed:** 4 items
- **"Discover All Delicacies" button** appears when content exists
- Items sorted by `sortOrder`

### Fields:
```typescript
interface CulinaryItem {
  itemId: number
  title: string       // Dish name
  description: string // Description
  image: string       // Image URL
  tag: string         // Badge text (e.g., "Street Food Icon")
  sortOrder: number   // Display order
  isActive: boolean   // Show/hide item
}
```

---

## 4. Heritage & Culture (Milestones)

### Current Content (Timeline):
| Year | Title | Description |
|------|-------|-------------|
| 1580 | Founding of Bocaue | One of the oldest municipalities in Bulacan... |
| 1600s | The First Parish Church | Augustinian missionaries built the first chapel... |
| 1787 | Origin of the Pagoda Festival | A fisherman discovered a wooden cross... |
| 1800s | Rise of the Pyrotechnics Industry | Chinese-Filipino craftsmen introduced gunpowder... |
| 1896 | The Philippine Revolution | Bocaueños joined the Katipunan uprising... |
| 1940s | World War II & Rebuilding | Bocaue endured Japanese occupation... |
| 1993 | The Pagoda Tragedy & Renewal | A devastating pagoda collapse... |
| 2014 | The Philippine Arena Opens | The world's largest indoor arena... |
| Present | Heritage Meets Tomorrow | MHACTO preserves traditions... |

### Display Rules:
- Alternating left/right layout on desktop
- Single column on mobile
- Each milestone expandable with detailed content
- Admin can add/remove without breaking timeline structure

### Fields:
```typescript
interface Milestone {
  milestoneId: number
  year: string        // Display year (e.g., "1580", "Present")
  title: string       // Milestone title
  description: string // Short description
  detail: string      // Expanded detail (shown on click)
  side: "left" | "right" // Timeline position
  sortOrder: number   // Display order (chronological)
  isActive: boolean   // Show/hide milestone
}
```

---

## 5. Latest Updates (News Section)

### Display Rules:
- **Maximum displayed on home:** 4 articles
- **Stacking order:** Newest first (by `newsDate` DESC)
- **"View All News" button** appears when content exists
- Individual news pages at `/news/[id]`

### Current Sample Content:
| Date | Title | Category |
|------|-------|----------|
| Feb 12, 2026 | Bocaue Youth Wins Regional Quiz Bee Championship | Competition |
| Feb 6, 2026 | New Bocaue River Esplanade Project Breaks Ground | Development |
| Feb 1, 2026 | Bocaue Gears Up for the Grand Pagoda Festival 2026 | Festival |
| Jan 28, 2026 | Barangay Cleanup Drive Brings Community Together | Community |

### Fields:
```typescript
interface NewsArticle {
  id: string
  title: string        // Article headline
  summary: string      // Short summary (card display)
  description: string  // Meta description
  content: string      // Full article content (markdown)
  image: string        // Featured image URL
  date: string         // Publication date (ISO)
  category: string     // competition | project | community | festival
  author: string       // Author name
  places: string[]     // Related places (tags)
  isFeatured: boolean  // Pin to top
  status: string       // draft | published | archived
  createdAt: string
  updatedAt: string
}
```

---

## 6. Places & Destinations

### Categories:
- Heritage (Churches, Historical Sites)
- Nature (Parks, Rivers)
- Festival (Events, Celebrations)
- Arts & Culture (Museums, Galleries)
- Cuisine (Restaurants, Food)
- Landmark (Modern Structures)

### Current Places:
| ID | Title | Category |
|----|-------|----------|
| philippine-arena | Philippine Arena | Landmark |
| st-martin-church | St. Martin of Tours Church | Heritage |
| bocaue-river-festival | Bocaue River Festival | Festival |
| local-delicacies | Local Delicacies | Cuisine |
| fireworks-industry | Fireworks Industry | Arts |
| bocaue-river-walk | Bocaue River Walk | Nature |

### Fields:
```typescript
interface Place {
  id: string
  title: string
  description: string
  image: string
  fullDescription?: string
  story?: string
  location?: string
  hours?: string
  contact?: string
  category: PlaceCategory
  established?: string
  highlights?: string[]
  status: string
}
```

---

## Database Schema

### New Tables for Home Content:

```sql
-- Hero Slides
CREATE TABLE hero_slides (
  slide_id INT AUTO_INCREMENT PRIMARY KEY,
  src VARCHAR(500) NOT NULL,
  alt VARCHAR(255),
  subtitle VARCHAR(100),
  title VARCHAR(100) NOT NULL,
  highlight VARCHAR(100),
  description TEXT,
  href VARCHAR(255),
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Featured Spotlight
CREATE TABLE spotlight (
  spotlight_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image VARCHAR(500),
  event_date DATE,
  location VARCHAR(255),
  is_active TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Culinary Items (Taste of Bocaue)
CREATE TABLE culinary_items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image VARCHAR(500),
  tag VARCHAR(100),
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- History Milestones
CREATE TABLE milestones (
  milestone_id INT AUTO_INCREMENT PRIMARY KEY,
  year VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  detail TEXT,
  side ENUM('left', 'right') DEFAULT 'left',
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## API Endpoints

### Public Endpoints (No Auth):
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/home/hero.php` | Get active hero slides |
| GET | `/api/home/spotlight.php` | Get active spotlight |
| GET | `/api/home/culinary.php` | Get active culinary items |
| GET | `/api/home/milestones.php` | Get active milestones |
| GET | `/api/posts/read.php?type=news&limit=4` | Get latest 4 news |
| GET | `/api/posts/read.php?type=places` | Get published places |

### Admin Endpoints (Auth Required):
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/home/hero.php?all=1` | Get all hero slides |
| POST | `/api/home/hero.php` | Create hero slide |
| PUT | `/api/home/hero.php?id={id}` | Update hero slide |
| DELETE | `/api/home/hero.php?id={id}` | Delete hero slide |
| GET | `/api/home/spotlight.php?all=1` | Get all spotlights |
| POST | `/api/home/spotlight.php` | Create spotlight |
| PUT | `/api/home/spotlight.php?id={id}` | Update spotlight |
| DELETE | `/api/home/spotlight.php?id={id}` | Delete spotlight |
| GET | `/api/home/culinary.php?all=1` | Get all culinary items |
| POST | `/api/home/culinary.php` | Create culinary item |
| PUT | `/api/home/culinary.php?id={id}` | Update culinary item |
| DELETE | `/api/home/culinary.php?id={id}` | Delete culinary item |
| GET | `/api/home/milestones.php?all=1` | Get all milestones |
| POST | `/api/home/milestones.php` | Create milestone |
| PUT | `/api/home/milestones.php?id={id}` | Update milestone |
| DELETE | `/api/home/milestones.php?id={id}` | Delete milestone |
| PATCH | `/api/home/milestones.php` | Reorder milestones |

---

## Implementation Notes

### Design Preservation Rules:
1. **Styles must not change** - Only data sources change
2. **Dynamic limits** - Culinary: 4 max, News: 4 max with "View All"
3. **Newest first** - News stacked by date DESC
4. **Graceful fallback** - If API fails, show loading skeleton
5. **Timeline integrity** - Milestones maintain alternating L/R pattern

### Admin Features:
- Hero slide management (reorder, toggle active)
- Spotlight editor (single active at a time)
- Culinary item CRUD (4 max display, unlimited storage)
- Milestone timeline editor (add/remove preserves design)
- News/stories management (auto-stacking by date)

---

*Generated for MHACTO Bocaue Tourism CMS*
