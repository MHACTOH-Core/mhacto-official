-- ========================================================================
-- MHACTO Home Content Tables Migration
-- Run this script to add home page content tables to the database
-- ========================================================================

-- Hero Slides for the home page carousel
CREATE TABLE IF NOT EXISTS hero_slides (
  slide_id INT AUTO_INCREMENT PRIMARY KEY,
  src VARCHAR(500) NOT NULL COMMENT 'Image/video URL',
  alt VARCHAR(255) DEFAULT '' COMMENT 'Image alt text',
  subtitle VARCHAR(100) DEFAULT '' COMMENT 'Small text above title',
  title VARCHAR(100) NOT NULL COMMENT 'Main title (first line)',
  highlight VARCHAR(100) DEFAULT '' COMMENT 'Highlighted text (second line)',
  description TEXT COMMENT 'Description paragraph',
  href VARCHAR(255) DEFAULT '/' COMMENT 'Link destination',
  sort_order INT DEFAULT 0 COMMENT 'Display order',
  is_active TINYINT(1) DEFAULT 1 COMMENT '1=visible, 0=hidden',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active_order (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Featured Spotlight (single featured event/highlight)
CREATE TABLE IF NOT EXISTS spotlight (
  spotlight_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL COMMENT 'Event/feature name',
  description TEXT COMMENT 'Event description',
  image VARCHAR(500) DEFAULT NULL COMMENT 'Background image URL',
  event_date DATE DEFAULT NULL COMMENT 'Event date',
  location VARCHAR(255) DEFAULT NULL COMMENT 'Event location',
  is_active TINYINT(1) DEFAULT 0 COMMENT 'Only 1 can be active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Culinary Items (Taste of Bocaue section)
CREATE TABLE IF NOT EXISTS culinary_items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL COMMENT 'Dish name',
  description TEXT COMMENT 'Description',
  image VARCHAR(500) DEFAULT '' COMMENT 'Image URL',
  tag VARCHAR(100) DEFAULT '' COMMENT 'Badge text (e.g., Street Food Icon)',
  sort_order INT DEFAULT 0 COMMENT 'Display order',
  is_active TINYINT(1) DEFAULT 1 COMMENT '1=visible, 0=hidden',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active_order (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- History Milestones (Heritage & Culture timeline)
CREATE TABLE IF NOT EXISTS milestones (
  milestone_id INT AUTO_INCREMENT PRIMARY KEY,
  year VARCHAR(50) NOT NULL COMMENT 'Display year (e.g., 1580, Present)',
  title VARCHAR(255) NOT NULL COMMENT 'Milestone title',
  description TEXT COMMENT 'Short description',
  detail TEXT COMMENT 'Expanded detail (shown on click)',
  side ENUM('left', 'right') DEFAULT 'left' COMMENT 'Timeline position',
  sort_order INT DEFAULT 0 COMMENT 'Display order (chronological)',
  is_active TINYINT(1) DEFAULT 1 COMMENT '1=visible, 0=hidden',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active_order (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- Seed Data: Insert default content from the current static data
-- ========================================================================

-- Hero Slides
INSERT INTO hero_slides (src, alt, subtitle, title, highlight, description, href, sort_order, is_active) VALUES
('/images/places/river-festival.jpg', 'Pagoda sa Wawa — Bocaue River Festival', 'Bocaue''s Grandest Tradition', 'The Iconic', 'Pagoda Festival', 'Experience the Pagoda sa Wawa — a centuries-old fluvial celebration of faith, color, and community spirit on the historic Bocaue River.', '/places/bocaue-river-festival', 1, 1),
('/images/heroes/hero-bocaue.jpg', 'Scenic view of Bocaue, Bulacan', 'Bocaue, Bulacan', 'Explore The River', 'Town Wonders', 'Where rich heritage meets vibrant culture — explore centuries of tradition, lively festivals, and the warm hospitality of Bocaue.', '/destinations', 2, 1),
('/images/places/church-bocaue.jpg', 'St. Martin of Tours Parish Church', 'Heritage & Faith', 'St. Martin of Tours', 'Parish Church', 'A centuries-old landmark standing as a testament to Bocaue''s enduring faith and Spanish colonial heritage.', '/places/st-martin-church', 3, 1),
('/images/places/philippine-arena.jpg', 'Philippine Arena', 'Modern Landmarks', 'The Iconic', 'Philippine Arena', 'Home to the world''s largest indoor arena, Bocaue is where tradition meets modernity on a grand scale.', '/places/philippine-arena', 4, 1),
('/images/places/fireworks.jpg', 'Fireworks in Bocaue', 'The Fireworks Capital', 'Bocaue''s Famous', 'Pyrotechnic Arts', 'Known nationwide as the fireworks capital of the Philippines, Bocaue lights up the sky with dazzling displays year-round.', '/destinations', 5, 1);

-- Featured Spotlight (Pagoda Festival 2026)
INSERT INTO spotlight (title, description, image, event_date, location, is_active) VALUES
('Pagoda Festival 2026', 'Join us for the centuries-old fluvial celebration of faith, color, and community spirit. The Pagoda sa Wawa is Bocaue''s most anticipated annual event, featuring the iconic river procession of the Holy Cross.', '/images/places/river-festival.jpg', '2026-07-04', 'Bocaue River, Bulacan', 1);

-- Culinary Items (Taste of Bocaue)
INSERT INTO culinary_items (title, description, image, tag, sort_order, is_active) VALUES
('Bocaue Chicharon', 'Crispy, golden pork rinds perfected over generations — Bocaue''s most celebrated street food and the pride of MacArthur Highway.', '/images/places/local-delicacies.jpg', 'Street Food Icon', 1, 1),
('Traditional Kakanin', 'Suman, bibingka, puto, and other rice cakes rooted in pre-colonial harvest traditions. A sweet taste of Bulacan''s indigenous heritage.', '/images/places/Food.jpg', 'Heritage Sweets', 2, 1),
('River Seafood & Ulam', 'Fresh catches from the Bocaue River transformed into classic Filipino ulam — sinangag, bangus dishes, and slow-cooked stews served by local eateries.', '/images/heroes/hero-bocaue.jpg', 'Local Favourites', 3, 1);

-- History Milestones
INSERT INTO milestones (year, title, description, detail, side, sort_order, is_active) VALUES
('1580', 'Founding of Bocaue', 'One of the oldest municipalities in Bulacan, Bocaue was founded under Spanish colonial administration.', 'The name "Bocaue" is believed to derive from the Tagalog word "bukaw" — a type of owl once abundant in the marshlands and riverbanks of the area. The Augustinian friars established the parish and organized the early settlement around the Bocaue River, which served as the town''s lifeline for trade, fishing, and transportation. The founding set the stage for a community that would endure for over four centuries.', 'left', 1, 1),
('1600s', 'The First Parish Church', 'Augustinian missionaries built the first chapel that would evolve into St. Martin of Tours Church.', 'The original structure was a modest chapel of bamboo and nipa palm, erected beside the river to serve the growing Catholic population. As the town prospered, the church was rebuilt in stone with a Baroque façade, hand-carved retablos, and centuries-old wooden santos. It became the spiritual anchor of Bocaue, hosting sacraments, festivals, and the annual procession that would later become the town''s most famous tradition.', 'right', 2, 1),
('1787', 'Origin of the Pagoda Festival', 'A fisherman discovered a wooden cross floating in the Bocaue River, sparking a devotion that endures to this day.', 'According to local legend, a humble fisherman pulled a small miraculous cross from the waters of the Wawa (river mouth). The townspeople enshrined it as the Holy Cross of Wawa and began an annual fluvial procession — carrying an ornate bamboo-and-cloth pagoda down the river accompanied by decorated boats, music, and prayers. This tradition, the Pagoda sa Wawa, became the spiritual heartbeat of Bocaue and one of the most iconic religious festivals in the Philippines.', 'left', 3, 1),
('1800s', 'Rise of the Pyrotechnics Industry', 'Chinese-Filipino craftsmen introduced gunpowder-based fireworks, establishing Bocaue as the fireworks capital of the Philippines.', 'By the late Spanish colonial era, Bocaue families had mastered the art of creating fireworks — from simple sparklers and luces (ground sparks) to towering cascadas and thundering aerial shells. The craft was a closely guarded family secret, passed from parent to child in backyard workshops. Fireworks from Bocaue became the go-to choice for town fiestas, patron saint celebrations, and New Year festivities across the archipelago.', 'right', 4, 1),
('1896', 'The Philippine Revolution', 'Bocaueños joined the Katipunan uprising against Spanish rule, gathering at the Old Town Plaza.', 'When Andrés Bonifacio and the Katipunan launched the revolution, Bocaue was among the Bulacan towns that rose in solidarity. Local Katipuneros gathered at the town plaza — the same square where generations had celebrated fiestas — to organize resistance. The town saw skirmishes and acts of bravery that are still commemorated today. The revolution forged a civic identity rooted in resilience and the defense of freedom.', 'left', 5, 1),
('1940s', 'World War II & Rebuilding', 'Bocaue endured Japanese occupation and the devastation of liberation, then rebuilt with determination.', 'During the Second World War, Japanese Imperial forces occupied Bocaue and used the town plaza as a garrison. The liberation battles of 1945 damaged many structures, including parts of the historic church. In the post-war years, the community pulled together to reconstruct their town — restoring the church, reopening markets, and reviving the fireworks industry. This period of rebuilding cemented the Bocaueño spirit of perseverance.', 'right', 6, 1),
('1993', 'The Pagoda Tragedy & Renewal', 'A devastating pagoda collapse on the river claimed many lives — but the tradition survived and grew stronger.', 'During the 1993 fluvial procession, the towering pagoda structure collapsed mid-river under the weight of hundreds of devotees. The tragedy sent shockwaves through the nation. Rather than abandon the beloved tradition, Bocaueños mourned, reformed safety protocols, and vowed to continue. The festival was restructured with engineering oversight and crowd controls. Today, the event honors both the Holy Cross and the memory of those who perished, making it an even more profound expression of faith and community resilience.', 'left', 7, 1),
('2014', 'The Philippine Arena Opens', 'The world''s largest indoor arena was inaugurated in Ciudad de Victoria, putting Bocaue on the global map.', 'Built for the Iglesia ni Cristo centennial, the Philippine Arena rose from farmland on the Bocaue–Santa Maria border. With a seating capacity of over 55,000, it was recognized by Guinness World Records as the largest indoor arena on Earth. The complex, Ciudad de Victoria, also includes the Philippine Sports Stadium and an aquatic center. The development brought thousands of jobs and international visitors, transforming Bocaue from a quiet heritage town into a modern tourism destination.', 'right', 8, 1),
('Present', 'Heritage Meets Tomorrow', 'MHACTO preserves traditions while fostering contemporary arts, sustainable tourism, and community identity.', 'Today, the Municipal History, Arts, Culture and Tourism Office (MHACTO) leads efforts to document oral histories, support local artisans, and develop heritage trails. Programs include cultural workshops, art exhibits, parol-making contests, and culinary festivals that celebrate Bocaue''s kakanin and chicharon traditions. The town balances rapid urbanization with a deep commitment to preserving its identity — ensuring that the stories of the Bukaw, the river, the pagoda, and the fireworks continue to inspire future generations.', 'left', 9, 1);
