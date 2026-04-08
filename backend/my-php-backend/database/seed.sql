-- ========================================================================
-- MHACTO Sample / Test Data Seed — mhacto_db
-- Bocaue, Bulacan — Municipal History, Arts, Culture & Tourism Office
--
-- Run AFTER database-schema.sql:
--   mysql -u root -p mhacto_db < seed.sql
--
-- Seeds: places, museums, religious sites, news, events, local cuisine,
--        tour packages, timeline of events, notable figures,
--        cultural practices, crafts & artisan, people & wonders,
--        schools, hospitals, restaurants, tourism wonders,
--        featured content, milestones, inquiries, activity logs,
--        and page view analytics.
--
-- Uses INSERT IGNORE and SELECT-based variable lookups so it is safe
-- to re-run on a database that already has base data.
-- ========================================================================

USE mhacto_db;


-- ========================================================================
-- RA 10173 COMPLIANCE SEED — initial consent statement version
-- ========================================================================

INSERT IGNORE INTO consent_versions (version_code, statement_text, effective_from) VALUES (
  'v1.0',
  'By submitting this form, I consent to the Municipal History, Arts, Culture & Tourism Office (MHACTO) of Bocaue, Bulacan collecting and processing my personal information (name, email address, contact number) for the purpose of responding to my inquiry. My data will be retained for the minimum period required by law and will not be shared with third parties without my consent, in accordance with the Philippines Data Privacy Act of 2012 (RA 10173).',
  CURDATE()
);


-- ========================================================================
-- PLACES (post_type = 'place', label = destinations)
-- ========================================================================

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 3, 'Bocaue River Cruise',
 'Experience the serene beauty of the Bocaue River on a traditional bangka ride. Glide past historic landmarks, lush mangroves, and riverside communities while learning about the town''s deep connection to the waterways that shaped its identity.',
 'published', 'place'),
(1, 3, 'San Martin de Tours Parish Church',
 'One of the oldest churches in Bulacan, the San Martin de Tours Parish Church has stood as a beacon of faith since the Spanish colonial era. Its Baroque-influenced architecture and centuries-old interior make it a must-visit heritage landmark.',
 'published', 'place'),
(1, 3, 'Bocaue Fireworks District',
 'Bocaue is the fireworks capital of the Philippines. Visit the Fireworks District to see master pyrotechnicians at work, browse dazzling displays, and learn about the centuries-old craft that has made the town world-famous.',
 'published', 'place'),
(1, 3, 'Barangay Lolomboy Heritage Walk',
 'Take a leisurely stroll through one of Bocaue''s oldest barangays, where ancestral homes, cobblestone paths, and a vibrant local community reveal the town''s rich colonial past and enduring resilience.',
 'published', 'place'),
(1, 3, 'Taal–Bocaue Footbridge',
 'A charming pedestrian footbridge connecting Bocaue to neighboring Taal, offering panoramic views of the river delta. Best visited at golden hour when the sunset paints the water in hues of amber and rose.',
 'published', 'place'),
(1, 3, 'Bocaue Municipal Plaza',
 'The heart of civic life, the Municipal Plaza hosts weekend markets, cultural performances, and community events. Surrounded by heritage buildings and shaded by centuries-old acacia trees, it is the perfect starting point for exploring the town.',
 'published', 'place');

SET @place1 = (SELECT content_id FROM content WHERE title = 'Bocaue River Cruise' LIMIT 1);
SET @place2 = (SELECT content_id FROM content WHERE title = 'San Martin de Tours Parish Church' LIMIT 1);
SET @place3 = (SELECT content_id FROM content WHERE title = 'Bocaue Fireworks District' LIMIT 1);
SET @place4 = (SELECT content_id FROM content WHERE title = 'Barangay Lolomboy Heritage Walk' LIMIT 1);
SET @place5 = (SELECT content_id FROM content WHERE title = 'Taal–Bocaue Footbridge' LIMIT 1);
SET @place6 = (SELECT content_id FROM content WHERE title = 'Bocaue Municipal Plaza' LIMIT 1);

SET @lbl_destinations = (SELECT category_id FROM categories WHERE label_key = 'destinations' LIMIT 1);

INSERT IGNORE INTO content_fields (content_id, meta_key, meta_value) VALUES
(@place1, 'label_key',       'destinations'),
(@place1, 'label_id',        CAST(@lbl_destinations AS CHAR)),
(@place1, 'is_featured',     '1'),
(@place1, 'location',        'Bocaue River, Bocaue, Bulacan'),
(@place1, 'hours',           'Daily 6:00 AM – 5:00 PM'),
(@place1, 'established',     '1920'),
(@place1, 'place_category',  'heritage'),
(@place1, 'story',           'The Bocaue River has been the lifeblood of the town since the Spanish colonial era, serving as the primary route for trade, transport, and the iconic Pagoda Festival river procession.'),

(@place2, 'label_key',       'destinations'),
(@place2, 'label_id',        CAST(@lbl_destinations AS CHAR)),
(@place2, 'is_featured',     '1'),
(@place2, 'location',        'Poblacion, Bocaue, Bulacan'),
(@place2, 'hours',           'Daily 5:00 AM – 8:00 PM'),
(@place2, 'established',     '1707'),
(@place2, 'place_category',  'heritage'),
(@place2, 'story',           'The parish was established by Augustinian friars in the early 1700s and has survived earthquakes, typhoons, and World War II. It remains the spiritual center of Bocaue.'),

(@place3, 'label_key',       'destinations'),
(@place3, 'label_id',        CAST(@lbl_destinations AS CHAR)),
(@place3, 'is_featured',     '1'),
(@place3, 'location',        'Fireworks District, Bocaue, Bulacan'),
(@place3, 'hours',           'Mon–Sat 8:00 AM – 6:00 PM'),
(@place3, 'established',     '1860'),
(@place3, 'place_category',  'heritage'),
(@place3, 'story',           'Bocaue''s fireworks tradition dates back to the 1860s when Chinese merchants introduced pyrotechnic techniques to local artisans.'),

(@place4, 'label_key',       'destinations'),
(@place4, 'label_id',        CAST(@lbl_destinations AS CHAR)),
(@place4, 'is_featured',     '0'),
(@place4, 'location',        'Lolomboy, Bocaue, Bulacan'),
(@place4, 'hours',           'Open 24/7'),
(@place4, 'place_category',  'heritage'),
(@place4, 'story',           'Lolomboy is one of the oldest barangays in Bocaue, where ancestral homes and cobblestone paths bear witness to centuries of colonial history.'),

(@place5, 'label_key',       'destinations'),
(@place5, 'label_id',        CAST(@lbl_destinations AS CHAR)),
(@place5, 'is_featured',     '0'),
(@place5, 'location',        'Bocaue-Taal Border, Bulacan'),
(@place5, 'hours',           'Open 24/7'),
(@place5, 'place_category',  'heritage'),
(@place5, 'story',           'This pedestrian footbridge has connected Bocaue and Taal for decades, offering panoramic views of the river delta at sunset.'),

(@place6, 'label_key',       'destinations'),
(@place6, 'label_id',        CAST(@lbl_destinations AS CHAR)),
(@place6, 'is_featured',     '0'),
(@place6, 'location',        'Poblacion, Bocaue, Bulacan'),
(@place6, 'hours',           'Open 24/7'),
(@place6, 'place_category',  'heritage'),
(@place6, 'story',           'The Municipal Plaza has been the center of civic life and public gatherings since the Spanish era, surrounded by heritage-era buildings and centuries-old acacia trees.');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@place1, '/images/defaults/no-image.svg', 1, 0),
(@place2, '/images/defaults/no-image.svg', 1, 0),
(@place3, '/images/defaults/no-image.svg', 1, 0),
(@place4, '/images/defaults/no-image.svg', 1, 0),
(@place5, '/images/defaults/no-image.svg', 1, 0),
(@place6, '/images/defaults/no-image.svg', 1, 0);


-- ========================================================================
-- MUSEUMS (post_type = 'place', place_category = museum)
-- ========================================================================

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 3, 'MHACTO Heritage Gallery',
 'A curated museum space inside the Municipal Hall showcasing Bocaue''s history from pre-colonial times to the present. Exhibits include vintage photographs, Spanish-era artifacts, traditional weaving tools, and a scale replica of the Pagoda Festival procession.',
 'published', 'place'),
(1, 3, 'Pagoda Festival Museum',
 'Dedicated to the centuries-old Pagoda Festival tradition, this museum houses ornate pagoda replicas, historical vestments, devotional artwork, and an interactive timeline tracing the festival from its 17th-century origins.',
 'published', 'place'),
(1, 3, 'Philippine Arena Visitor Center',
 'The Philippine Arena, the world''s largest indoor arena, sits on the border of Bocaue and Santa Maria. Its visitor center offers guided architectural tours, event history displays, and a panoramic observation deck.',
 'published', 'place');

SET @mus1 = (SELECT content_id FROM content WHERE title = 'MHACTO Heritage Gallery' LIMIT 1);
SET @mus2 = (SELECT content_id FROM content WHERE title = 'Pagoda Festival Museum' LIMIT 1);
SET @mus3 = (SELECT content_id FROM content WHERE title = 'Philippine Arena Visitor Center' LIMIT 1);

INSERT IGNORE INTO content_fields (content_id, meta_key, meta_value) VALUES
(@mus1, 'label_key',      'destinations'),
(@mus1, 'label_id',       CAST(@lbl_destinations AS CHAR)),
(@mus1, 'is_featured',    '1'),
(@mus1, 'place_category', 'museum'),
(@mus1, 'location',       'Municipal Hall, Poblacion, Bocaue, Bulacan'),
(@mus1, 'hours',          'Mon–Fri 8:00 AM – 5:00 PM'),
(@mus1, 'established',    '2018'),
(@mus1, 'story',          'Founded as part of the MHACTO office, this gallery preserves local historical documents, artifacts, and oral histories collected from Bocaue elders over the past decade.'),

(@mus2, 'label_key',      'destinations'),
(@mus2, 'label_id',       CAST(@lbl_destinations AS CHAR)),
(@mus2, 'is_featured',    '1'),
(@mus2, 'place_category', 'museum'),
(@mus2, 'location',       'San Martin de Tours Parish Compound, Bocaue, Bulacan'),
(@mus2, 'hours',          'Tue–Sun 9:00 AM – 4:00 PM'),
(@mus2, 'established',    '2015'),
(@mus2, 'story',          'Established to preserve the Pagoda Festival''s rich legacy, the museum contains artifacts spanning over 300 years and serves as the official archive for festival documentation.'),

(@mus3, 'label_key',      'destinations'),
(@mus3, 'label_id',       CAST(@lbl_destinations AS CHAR)),
(@mus3, 'is_featured',    '0'),
(@mus3, 'place_category', 'museum'),
(@mus3, 'location',       'Ciudad de Victoria, Bocaue–Santa Maria, Bulacan'),
(@mus3, 'hours',          'Daily 10:00 AM – 6:00 PM (except event days)'),
(@mus3, 'established',    '2014'),
(@mus3, 'story',          'The Philippine Arena holds a Guinness World Record as the largest indoor arena, seating over 55,000. Its visitor center tells the story of its construction and events.');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@mus1, '/images/defaults/no-image.svg', 1, 0),
(@mus2, '/images/defaults/no-image.svg', 1, 0),
(@mus3, '/images/defaults/no-image.svg', 1, 0);


-- ========================================================================
-- RELIGIOUS SITES (post_type = 'place', place_category = religious)
-- ========================================================================

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 3, 'St. Martin of Tours Parish Church',
 'The spiritual heart of Bocaue, St. Martin of Tours Parish Church has served the community since 1707. Its Baroque-influenced facade, hand-carved retablos, and bell tower are recognized as Important Cultural Property by the NHCP.',
 'published', 'place'),
(1, 3, 'Iglesia Ni Cristo Central Temple – Bocaue',
 'A striking modernist worship hall of the Iglesia Ni Cristo, this temple features soaring spires and geometric stained glass. It serves as the central congregation for INC members in Bocaue and nearby towns.',
 'published', 'place'),
(1, 3, 'Shrine of the Holy Cross of Wawa',
 'A riverside chapel marking the legendary site where a miraculous crucifix was found floating in the Bocaue River. This shrine is the starting point of the annual Pagoda Festival river procession.',
 'published', 'place');

SET @rel1 = (SELECT content_id FROM content WHERE title = 'St. Martin of Tours Parish Church' LIMIT 1);
SET @rel2 = (SELECT content_id FROM content WHERE title = 'Iglesia Ni Cristo Central Temple – Bocaue' LIMIT 1);
SET @rel3 = (SELECT content_id FROM content WHERE title = 'Shrine of the Holy Cross of Wawa' LIMIT 1);

INSERT IGNORE INTO content_fields (content_id, meta_key, meta_value) VALUES
(@rel1, 'label_key',      'destinations'),
(@rel1, 'label_id',       CAST(@lbl_destinations AS CHAR)),
(@rel1, 'is_featured',    '1'),
(@rel1, 'place_category', 'religious'),
(@rel1, 'location',       'Poblacion, Bocaue, Bulacan'),
(@rel1, 'hours',          'Daily 5:00 AM – 8:00 PM'),
(@rel1, 'established',    '1707'),
(@rel1, 'story',          'Established by Augustinian friars in the early 1700s, this church has withstood earthquakes, typhoons, and the devastation of World War II. Its icons, wooden santos, and centuries-old bells are treasures of Philippine colonial heritage.'),

(@rel2, 'label_key',      'destinations'),
(@rel2, 'label_id',       CAST(@lbl_destinations AS CHAR)),
(@rel2, 'is_featured',    '0'),
(@rel2, 'place_category', 'religious'),
(@rel2, 'location',       'Wakas, Bocaue, Bulacan'),
(@rel2, 'hours',          'Worship schedules only — contact local congregation'),
(@rel2, 'established',    '1990'),
(@rel2, 'story',          'The Iglesia Ni Cristo Central Temple in Bocaue was built as the worship center for the growing INC community in the municipality.'),

(@rel3, 'label_key',      'destinations'),
(@rel3, 'label_id',       CAST(@lbl_destinations AS CHAR)),
(@rel3, 'is_featured',    '1'),
(@rel3, 'place_category', 'religious'),
(@rel3, 'location',       'Wawa, Bocaue, Bulacan'),
(@rel3, 'hours',          'Daily 6:00 AM – 6:00 PM'),
(@rel3, 'established',    'circa 1787'),
(@rel3, 'story',          'Legend holds that a wooden crucifix was discovered floating in the Bocaue River at this very spot in the late 18th century. The miraculous finding gave rise to the Pagoda Festival, one of the Philippines'' most dramatic river processions.');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@rel1, '/images/defaults/no-image.svg', 1, 0),
(@rel2, '/images/defaults/no-image.svg', 1, 0),
(@rel3, '/images/defaults/no-image.svg', 1, 0);


-- ========================================================================
-- NEWS ARTICLES (post_type = 'news', label = news)
-- ========================================================================

SET @lbl_news = (SELECT category_id FROM categories WHERE label_key = 'news' LIMIT 1);

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 4, 'Bocaue Launches New Tourism Website',
 'The Municipal History, Arts, Culture & Tourism Office (MHACTO) officially launched its revamped digital platform to promote Bocaue''s heritage and tourism offerings to a wider audience.',
 'published', 'news'),
(1, 4, 'River Clean-Up Drive a Success',
 'Over 500 volunteers participated in the annual Bocaue River clean-up, collecting 3 tons of waste and planting 200 mangrove seedlings along the riverbanks.',
 'published', 'news'),
(1, 4, 'Heritage Preservation Ordinance Approved',
 'The Sangguniang Bayan of Bocaue approved a landmark ordinance protecting historical structures within the municipality, designating 15 buildings and sites as protected heritage properties.',
 'published', 'news');

SET @news1 = (SELECT content_id FROM content WHERE title = 'Bocaue Launches New Tourism Website' LIMIT 1);
SET @news2 = (SELECT content_id FROM content WHERE title = 'River Clean-Up Drive a Success' LIMIT 1);
SET @news3 = (SELECT content_id FROM content WHERE title = 'Heritage Preservation Ordinance Approved' LIMIT 1);

INSERT IGNORE INTO content_fields (content_id, meta_key, meta_value) VALUES
(@news1, 'label_key',   'news'),
(@news1, 'label_id',    CAST(@lbl_news AS CHAR)),
(@news1, 'is_featured', '1'),
(@news1, 'news_date',   '2026-03-01'),

(@news2, 'label_key',   'news'),
(@news2, 'label_id',    CAST(@lbl_news AS CHAR)),
(@news2, 'is_featured', '0'),
(@news2, 'news_date',   '2026-02-20'),

(@news3, 'label_key',   'news'),
(@news3, 'label_id',    CAST(@lbl_news AS CHAR)),
(@news3, 'is_featured', '0'),
(@news3, 'news_date',   '2026-02-15');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@news1, '/images/defaults/no-image.svg', 1, 0),
(@news2, '/images/defaults/no-image.svg', 1, 0),
(@news3, '/images/defaults/no-image.svg', 1, 0);


-- ========================================================================
-- EVENTS (post_type = 'event', label = events / festivals)
-- ========================================================================

SET @lbl_events   = (SELECT category_id FROM categories WHERE label_key = 'events' LIMIT 1);
SET @lbl_festivals = (SELECT category_id FROM categories WHERE label_key = 'festivals' LIMIT 1);

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 4, 'Pagoda Festival 2026',
 'The famous Pagoda Festival returns with a grand river procession honoring the Holy Cross of Wawa. Thousands of devotees gather to witness the floating pagodas, fireworks displays, and cultural performances that make this one of the most spectacular fiestas in Bulacan.',
 'published', 'event'),
(1, 4, 'Bocaue Heritage Week',
 'A week-long celebration of Bocaue''s history and culture featuring museum tours, traditional cooking demos, folk dance presentations, and a heritage photo exhibition. Open to all residents and visitors.',
 'published', 'event'),
(1, 4, 'Pyrotechnics International Competition',
 'Bocaue hosts fireworks teams from around the world in a dazzling competition of pyrotechnic artistry. Held annually at the Municipal Grounds, the event draws over 50,000 spectators each year.',
 'published', 'event');

SET @event1 = (SELECT content_id FROM content WHERE title = 'Pagoda Festival 2026' LIMIT 1);
SET @event2 = (SELECT content_id FROM content WHERE title = 'Bocaue Heritage Week' LIMIT 1);
SET @event3 = (SELECT content_id FROM content WHERE title = 'Pyrotechnics International Competition' LIMIT 1);

INSERT IGNORE INTO content_fields (content_id, meta_key, meta_value) VALUES
(@event1, 'label_key',   'events'),
(@event1, 'label_id',    CAST(@lbl_events AS CHAR)),
(@event1, 'is_featured', '1'),
(@event1, 'news_date',   '2026-07-01'),
(@event1, 'location',    'Bocaue River, Bocaue, Bulacan'),

(@event2, 'label_key',   'events'),
(@event2, 'label_id',    CAST(@lbl_events AS CHAR)),
(@event2, 'is_featured', '1'),
(@event2, 'news_date',   '2026-05-15'),
(@event2, 'location',    'Municipal Hall, Bocaue, Bulacan'),

(@event3, 'label_key',   'festivals'),
(@event3, 'label_id',    CAST(@lbl_festivals AS CHAR)),
(@event3, 'is_featured', '0'),
(@event3, 'news_date',   '2026-12-28'),
(@event3, 'location',    'Municipal Grounds, Bocaue, Bulacan');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@event1, '/images/defaults/no-image.svg', 1, 0),
(@event2, '/images/defaults/no-image.svg', 1, 0),
(@event3, '/images/defaults/no-image.svg', 1, 0);


-- ========================================================================
-- LOCAL CUISINE (post_type = 'place', label = local-cuisine)
-- ========================================================================

SET @lbl_cuisine = (SELECT category_id FROM categories WHERE label_key = 'local-cuisine' LIMIT 1);

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 2, 'Chicharon ni Mang Tomas',
 'The crispiest, most flavorful chicharon in Bulacan. Made from premium pork rind fried to golden perfection, this local favorite has been a staple of Bocaue for over four decades. Best paired with spiced vinegar.',
 'published', 'place'),
(1, 2, 'Kakanin sa Palengke',
 'A colorful array of traditional Filipino rice cakes — puto, kutsinta, sapin-sapin, and biko — freshly made every morning by local mananahi. Visit the Bocaue Public Market early for the best selection.',
 'published', 'place'),
(1, 2, 'Pancit Bocaue',
 'A unique local noodle dish featuring thick egg noodles stir-fried with fresh vegetables, shrimp, and pork, seasoned with calamansi and soy sauce. A must-try dish that you won''t find anywhere else.',
 'published', 'place');

SET @food1 = (SELECT content_id FROM content WHERE title = 'Chicharon ni Mang Tomas' LIMIT 1);
SET @food2 = (SELECT content_id FROM content WHERE title = 'Kakanin sa Palengke' LIMIT 1);
SET @food3 = (SELECT content_id FROM content WHERE title = 'Pancit Bocaue' LIMIT 1);

INSERT IGNORE INTO content_fields (content_id, meta_key, meta_value) VALUES
(@food1, 'label_key',   'local-cuisine'),
(@food1, 'label_id',    CAST(@lbl_cuisine AS CHAR)),
(@food1, 'is_featured', '1'),
(@food1, 'location',    'National Highway, Bocaue, Bulacan'),

(@food2, 'label_key',   'local-cuisine'),
(@food2, 'label_id',    CAST(@lbl_cuisine AS CHAR)),
(@food2, 'is_featured', '1'),
(@food2, 'location',    'Bocaue Public Market, Bulacan'),

(@food3, 'label_key',   'local-cuisine'),
(@food3, 'label_id',    CAST(@lbl_cuisine AS CHAR)),
(@food3, 'is_featured', '0'),
(@food3, 'location',    'Various eateries, Bocaue, Bulacan');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@food1, '/images/defaults/no-image.svg', 1, 0),
(@food2, '/images/defaults/no-image.svg', 1, 0),
(@food3, '/images/defaults/no-image.svg', 1, 0);


-- ========================================================================
-- TOUR PACKAGES (post_type = 'place', label = travel-tours)
-- ========================================================================

SET @lbl_tours = (SELECT category_id FROM categories WHERE label_key = 'travel-tours' LIMIT 1);

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 3, 'Bocaue Heritage Day Tour',
 'A guided walking and jeepney tour through Bocaue''s heritage sites, including the St. Martin of Tours Church, the historic plaza, the MHACTO Heritage Gallery, and the Bocaue River waterfront.',
 'published', 'place'),
(1, 3, 'Pagoda Festival Immersion Package',
 'An all-inclusive festival experience package for the annual Bocaue Pagoda Festival — including riverside viewing area access, the solemn mass, street fair access, and a post-festival heritage tour.',
 'published', 'place'),
(1, 3, 'Bocaue Food Heritage Trail',
 'A guided food tour through the edible heritage of Bocaue — visiting the public market, local bakeries, kakanin stalls, and a live cooking demonstration of traditional dishes.',
 'published', 'place'),
(1, 3, 'Bocaue River & Nature Trek',
 'Explore the natural beauty surrounding Bocaue''s riverways. This half-day eco-tour follows the river downstream, passing through mangrove areas, fish pens, and riverside barangays with a licensed nature guide.',
 'published', 'place');

SET @tour1 = (SELECT content_id FROM content WHERE title = 'Bocaue Heritage Day Tour' LIMIT 1);
SET @tour2 = (SELECT content_id FROM content WHERE title = 'Pagoda Festival Immersion Package' LIMIT 1);
SET @tour3 = (SELECT content_id FROM content WHERE title = 'Bocaue Food Heritage Trail' LIMIT 1);
SET @tour4 = (SELECT content_id FROM content WHERE title = 'Bocaue River & Nature Trek' LIMIT 1);

INSERT IGNORE INTO content_fields (content_id, meta_key, meta_value) VALUES
-- Heritage Day Tour
(@tour1, 'label_key',         'travel-tours'),
(@tour1, 'label_id',          CAST(@lbl_tours AS CHAR)),
(@tour1, 'is_featured',       '1'),
(@tour1, 'hours',             'Full Day (8 hours)'),
(@tour1, 'contact',           'MHACTO Office: (044) 123-4567 | mhacto.bocaue@email.com'),
(@tour1, 'tour_type',         'heritage'),
(@tour1, 'tour_difficulty',   'easy'),
(@tour1, 'tour_includes',     '["Licensed MHACTO heritage guide","Church and gallery entrance fees","Welcome snack (puto seko and native drinks)","Souvenir heritage map of Bocaue"]'),
(@tour1, 'tour_highlights',   '["400-year-old St. Martin of Tours Church","Access to the MHACTO Heritage Gallery","Bocaue River waterfront with pagoda route","Live artisan workshop visit"]'),
(@tour1, 'tour_itinerary',    '[{"time":"8:00 AM","activity":"Meet at Bocaue Municipal Hall; welcome briefing by MHACTO guide"},{"time":"8:30 AM","activity":"Guided tour of St. Martin of Tours Parish Church & Shrine of the Holy Cross"},{"time":"10:00 AM","activity":"Visit to MHACTO Heritage Gallery & Old Municipal Hall archive"},{"time":"11:30 AM","activity":"Bocaue Town Plaza walk & Jose Corazon de Jesus Monument"},{"time":"12:30 PM","activity":"Traditional lunch at a heritage-style restaurant (own expense)"},{"time":"2:00 PM","activity":"Bocaue River waterfront walk and pagoda procession route tour"},{"time":"3:30 PM","activity":"Visit to a local artisan workshop (weaving or woodcarving)"},{"time":"5:00 PM","activity":"Tour ends. Optional pasalubong shopping at local market stalls."}]'),

-- Pagoda Festival Immersion
(@tour2, 'label_key',         'travel-tours'),
(@tour2, 'label_id',          CAST(@lbl_tours AS CHAR)),
(@tour2, 'is_featured',       '1'),
(@tour2, 'hours',             '2 Days / 1 Night (July festival weekend)'),
(@tour2, 'contact',           'MHACTO Office: (044) 123-4567 | Book at least 3 weeks in advance'),
(@tour2, 'tour_type',         'festival'),
(@tour2, 'tour_difficulty',   'active'),
(@tour2, 'tour_includes',     '["1-night accommodation (twin sharing)","Reserved riverside viewing area pass","Festival lunch and welcome snack","Licensed MHACTO guide","Post-festival heritage tour"]'),
(@tour2, 'tour_highlights',   '["Front-row viewing for the Pagoda river procession","Solemn mass at the historic church","Full street fair and fireworks experience","Overnight in Bocaue with local hosts"]'),
(@tour2, 'tour_itinerary',    '[{"time":"Day 1, 4:00 PM","activity":"Arrive in Bocaue; check-in; town orientation walk"},{"time":"Day 1, 6:00 PM","activity":"Bocaue River pre-festival program & street fair"},{"time":"Day 1, 8:00 PM","activity":"Fireworks display; communal dinner"},{"time":"Day 2, 7:00 AM","activity":"Solemn high mass at St. Martin of Tours Church"},{"time":"Day 2, 9:00 AM","activity":"River procession from reserved riverside area"},{"time":"Day 2, 12:00 PM","activity":"Festival lunch with local delicacies"},{"time":"Day 2, 2:00 PM","activity":"Post-festival heritage tour & artisan market"},{"time":"Day 2, 5:00 PM","activity":"Tour concludes; departure assistance"}]'),

-- Food Heritage Trail
(@tour3, 'label_key',         'travel-tours'),
(@tour3, 'label_id',          CAST(@lbl_tours AS CHAR)),
(@tour3, 'is_featured',       '1'),
(@tour3, 'hours',             'Half Day (4 hours)'),
(@tour3, 'contact',           'MHACTO Office: (044) 123-4567 | mhacto.bocaue@email.com'),
(@tour3, 'tour_type',         'food'),
(@tour3, 'tour_difficulty',   'easy'),
(@tour3, 'tour_includes',     '["Food tastings at all stops","Live cooking demonstrations","Recipe cards and take-home puto seko pack","Licensed MHACTO food guide"]'),
(@tour3, 'tour_highlights',   '["Authentic puto seko straight from a family bakery","Bocaue Public Market food experience","Bulacan lechon live demonstration","Community kitchen experience"]'),
(@tour3, 'tour_itinerary',    '[{"time":"8:00 AM","activity":"Bocaue Public Market tasting walk: fresh kakanin and native delicacies"},{"time":"9:00 AM","activity":"Heritage bakery: puto seko live baking demonstration"},{"time":"10:00 AM","activity":"Church yard stalls: bibingka and traditional drinks"},{"time":"11:00 AM","activity":"Community kitchen: live cooking demonstration of Bulacan lechon preparation"},{"time":"12:00 PM","activity":"Communal lunch with local specialties; tour ends"}]'),

-- River & Nature Trek
(@tour4, 'label_key',         'travel-tours'),
(@tour4, 'label_id',          CAST(@lbl_tours AS CHAR)),
(@tour4, 'is_featured',       '0'),
(@tour4, 'hours',             'Half Day (5 hours)'),
(@tour4, 'contact',           'MHACTO Office: (044) 123-4567 | mhacto.bocaue@email.com'),
(@tour4, 'tour_type',         'nature'),
(@tour4, 'tour_difficulty',   'moderate'),
(@tour4, 'tour_includes',     '["Licensed MHACTO nature guide","Bangka river ride","Light snack and water","Mangrove seedling planting activity"]'),
(@tour4, 'tour_highlights',   '["Scenic bangka ride along the Bocaue River","Mangrove conservation area visit","Traditional fish pen demonstration","Riverside barangay community interaction"]'),
(@tour4, 'tour_itinerary',    '[{"time":"6:30 AM","activity":"Meet at Bocaue River dock; safety briefing"},{"time":"7:00 AM","activity":"Bangka ride downstream: fish pens and river life"},{"time":"8:30 AM","activity":"Mangrove conservation area walk and seedling planting"},{"time":"10:00 AM","activity":"Visit riverside barangay; light snack"},{"time":"11:30 AM","activity":"Return upstream; tour concludes at dock"}]');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@tour1, '/images/defaults/no-image.svg', 1, 0),
(@tour2, '/images/defaults/no-image.svg', 1, 0),
(@tour3, '/images/defaults/no-image.svg', 1, 0),
(@tour4, '/images/defaults/no-image.svg', 1, 0);


-- ========================================================================
-- TIMELINE OF EVENTS (post_type = 'news', label = timeline-of-events)
-- ========================================================================

SET @lbl_timeline = (SELECT category_id FROM categories WHERE label_key = 'timeline-of-events' LIMIT 1);

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 1, 'Founding of Bocaue - 1580',
 'Bocaue was established as a visita (mission village) under the Augustinian missionaries, marking the beginning of organized settlement along the Bocaue River. The town name derives from bukaw, the nocturnal owl that populated the dense riverside forests.',
 'published', 'news'),
(1, 1, 'Birth of the Fireworks Industry - 1860',
 'Local artisans began crafting fireworks using techniques passed down from Chinese merchants, launching an industry that would define Bocaue for generations. Today more than 200 registered manufacturers operate in the municipality.',
 'published', 'news'),
(1, 1, 'Philippine Revolution in Bocaue - 1896',
 'Bocauenos joined the Katipunan and participated in the Philippine Revolution against Spanish colonial rule. The riverside location made Bocaue a strategic staging ground for revolutionary forces.',
 'published', 'news');

SET @tl1 = (SELECT content_id FROM content WHERE title = 'Founding of Bocaue - 1580' LIMIT 1);
SET @tl2 = (SELECT content_id FROM content WHERE title = 'Birth of the Fireworks Industry - 1860' LIMIT 1);
SET @tl3 = (SELECT content_id FROM content WHERE title = 'Philippine Revolution in Bocaue - 1896' LIMIT 1);

INSERT IGNORE INTO content_fields (content_id, meta_key, meta_value) VALUES
(@tl1, 'label_key',   'timeline-of-events'),
(@tl1, 'label_id',    CAST(@lbl_timeline AS CHAR)),
(@tl1, 'is_featured', '1'),
(@tl1, 'year',        '1580'),

(@tl2, 'label_key',   'timeline-of-events'),
(@tl2, 'label_id',    CAST(@lbl_timeline AS CHAR)),
(@tl2, 'is_featured', '1'),
(@tl2, 'year',        '1860'),

(@tl3, 'label_key',   'timeline-of-events'),
(@tl3, 'label_id',    CAST(@lbl_timeline AS CHAR)),
(@tl3, 'is_featured', '1'),
(@tl3, 'year',        '1896');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@tl1, '/images/defaults/no-image.svg', 1, 0),
(@tl2, '/images/defaults/no-image.svg', 1, 0),
(@tl3, '/images/defaults/no-image.svg', 1, 0);


-- ========================================================================
-- NOTABLE FIGURES (post_type = 'news', label = notable-figures)
-- ========================================================================

SET @lbl_notable = (SELECT category_id FROM categories WHERE label_key = 'notable-figures' LIMIT 1);

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 1, 'Gen. Emilio Jacinto',
 'Known as the Brains of the Katipunan, Emilio Jacinto was a revolutionary leader and close aide to Andres Bonifacio. His writings and battlefield leadership inspired countless Filipinos during the struggle for independence from Spanish colonial rule.',
 'published', 'news'),
(1, 1, 'Marcelo H. del Pilar',
 'A pioneering propagandist, journalist, and one of the foremost intellectuals of the Philippine reform movement.',
 'published', 'news'),
(1, 1, 'Lola Basyang of Bocaue',
 'A revered community elder and oral historian who dedicated her life to preserving Bocaue stories, folk songs, and traditions.',
 'published', 'news');

SET @fig1 = (SELECT content_id FROM content WHERE title = 'Gen. Emilio Jacinto' LIMIT 1);
SET @fig2 = (SELECT content_id FROM content WHERE title = 'Marcelo H. del Pilar' LIMIT 1);
SET @fig3 = (SELECT content_id FROM content WHERE title = 'Lola Basyang of Bocaue' LIMIT 1);

INSERT IGNORE INTO content_fields (content_id, meta_key, meta_value) VALUES
(@fig1, 'label_key',   'notable-figures'),
(@fig1, 'label_id',    CAST(@lbl_notable AS CHAR)),
(@fig1, 'is_featured', '1'),

(@fig2, 'label_key',   'notable-figures'),
(@fig2, 'label_id',    CAST(@lbl_notable AS CHAR)),
(@fig2, 'is_featured', '1'),

(@fig3, 'label_key',   'notable-figures'),
(@fig3, 'label_id',    CAST(@lbl_notable AS CHAR)),
(@fig3, 'is_featured', '0');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@fig1, '/images/defaults/no-image.svg', 1, 0),
(@fig2, '/images/defaults/no-image.svg', 1, 0),
(@fig3, '/images/defaults/no-image.svg', 1, 0);


-- ========================================================================
-- CULTURAL PRACTICES (post_type = 'news', label = cultural-practices)
-- ========================================================================

SET @lbl_cultural = (SELECT category_id FROM categories WHERE label_key = 'cultural-practices' LIMIT 1);

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 2, 'Pagoda River Procession',
 'Every year on the first Sunday of July, Bocaue holds its famous Pagoda Festival — a grand river procession honoring the Holy Cross of Wawa.',
 'published', 'news'),
(1, 2, 'Pamamanhikan Tradition',
 'Pamamanhikan is the Filipino tradition of formally visiting the partner''s family to seek blessings before marriage.',
 'published', 'news'),
(1, 2, 'Pasko ng Nayon - Village Christmas',
 'Bocaue village Christmas celebrations feature caroling with bamboo instruments, the Misa de Gallo, and communal feasts.',
 'published', 'news');

SET @cp1 = (SELECT content_id FROM content WHERE title = 'Pagoda River Procession' LIMIT 1);
SET @cp2 = (SELECT content_id FROM content WHERE title = 'Pamamanhikan Tradition' LIMIT 1);
SET @cp3 = (SELECT content_id FROM content WHERE title = 'Pasko ng Nayon - Village Christmas' LIMIT 1);

INSERT IGNORE INTO content_fields (content_id, meta_key, meta_value) VALUES
(@cp1, 'label_key',   'cultural-practices'),
(@cp1, 'label_id',    CAST(@lbl_cultural AS CHAR)),
(@cp1, 'is_featured', '1'),

(@cp2, 'label_key',   'cultural-practices'),
(@cp2, 'label_id',    CAST(@lbl_cultural AS CHAR)),
(@cp2, 'is_featured', '1'),

(@cp3, 'label_key',   'cultural-practices'),
(@cp3, 'label_id',    CAST(@lbl_cultural AS CHAR)),
(@cp3, 'is_featured', '0');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@cp1, '/images/defaults/no-image.svg', 1, 0),
(@cp2, '/images/defaults/no-image.svg', 1, 0),
(@cp3, '/images/defaults/no-image.svg', 1, 0);


-- ========================================================================
-- CRAFTS & ARTISAN (post_type = 'news', label = crafts-artisan)
-- ========================================================================

SET @lbl_crafts = (SELECT category_id FROM categories WHERE label_key = 'crafts-artisan' LIMIT 1);

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 2, 'Pyrotechnic Artistry',
 'Bocaue is the fireworks capital of the Philippines, home to generations of master pyrotechnicians. Each family-run workshop passes down secret formulas and techniques.',
 'published', 'news'),
(1, 2, 'Bamboo Weaving - Kawayan Craft',
 'Local artisans transform bamboo into beautifully crafted baskets, furniture, and decorative items using techniques handed down through generations.',
 'published', 'news'),
(1, 2, 'Tsinelas - Handcrafted Slippers',
 'Bocaue has a storied tradition of handcrafted tsinelas and footwear. Local cobblers stitch durable, colorful pairs using locally sourced materials.',
 'published', 'news');

SET @ca1 = (SELECT content_id FROM content WHERE title = 'Pyrotechnic Artistry' LIMIT 1);
SET @ca2 = (SELECT content_id FROM content WHERE title = 'Bamboo Weaving - Kawayan Craft' LIMIT 1);
SET @ca3 = (SELECT content_id FROM content WHERE title = 'Tsinelas - Handcrafted Slippers' LIMIT 1);

INSERT IGNORE INTO content_fields (content_id, meta_key, meta_value) VALUES
(@ca1, 'label_key',   'crafts-artisan'),
(@ca1, 'label_id',    CAST(@lbl_crafts AS CHAR)),
(@ca1, 'is_featured', '1'),

(@ca2, 'label_key',   'crafts-artisan'),
(@ca2, 'label_id',    CAST(@lbl_crafts AS CHAR)),
(@ca2, 'is_featured', '1'),

(@ca3, 'label_key',   'crafts-artisan'),
(@ca3, 'label_id',    CAST(@lbl_crafts AS CHAR)),
(@ca3, 'is_featured', '0');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@ca1, '/images/defaults/no-image.svg', 1, 0),
(@ca2, '/images/defaults/no-image.svg', 1, 0),
(@ca3, '/images/defaults/no-image.svg', 1, 0);


-- ========================================================================
-- PEOPLE & WONDERS (post_type = 'news', label = people-wonders)
-- ========================================================================

SET @lbl_people = (SELECT category_id FROM categories WHERE label_key = 'people-wonders' LIMIT 1);

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 2, 'Mang Carding - The Fireworks Legend',
 'For over 50 years, Mang Carding has been crafting fireworks in his workshop in Bocaue. His aerial shells have dazzled crowds at national celebrations.',
 'published', 'news'),
(1, 2, 'Ate Nena - The Kakanin Queen',
 'Ate Nena has been waking up at 3 AM every day for 30 years to prepare famous kakanin at the Bocaue Public Market.',
 'published', 'news'),
(1, 2, 'Dok Rudy - Keeper of History',
 'A retired teacher and self-taught historian, Dok Rudy has spent decades documenting Bocaue stories and photographing heritage structures.',
 'published', 'news');

SET @pw1 = (SELECT content_id FROM content WHERE title = 'Mang Carding - The Fireworks Legend' LIMIT 1);
SET @pw2 = (SELECT content_id FROM content WHERE title = 'Ate Nena - The Kakanin Queen' LIMIT 1);
SET @pw3 = (SELECT content_id FROM content WHERE title = 'Dok Rudy - Keeper of History' LIMIT 1);

INSERT IGNORE INTO content_fields (content_id, meta_key, meta_value) VALUES
(@pw1, 'label_key',   'people-wonders'),
(@pw1, 'label_id',    CAST(@lbl_people AS CHAR)),
(@pw1, 'is_featured', '1'),

(@pw2, 'label_key',   'people-wonders'),
(@pw2, 'label_id',    CAST(@lbl_people AS CHAR)),
(@pw2, 'is_featured', '1'),

(@pw3, 'label_key',   'people-wonders'),
(@pw3, 'label_id',    CAST(@lbl_people AS CHAR)),
(@pw3, 'is_featured', '0');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@pw1, '/images/defaults/no-image.svg', 1, 0),
(@pw2, '/images/defaults/no-image.svg', 1, 0),
(@pw3, '/images/defaults/no-image.svg', 1, 0);


-- ========================================================================
-- SCHOOLS (post_type = 'news', label = schools)
-- ========================================================================

SET @lbl_schools = (SELECT category_id FROM categories WHERE label_key = 'schools' LIMIT 1);

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 5, 'Bocaue Central School',
 'One of the oldest and most respected public elementary schools in Bocaue, educating generations of Bocauenos since the early 1900s.',
 'published', 'news'),
(1, 5, 'Lolomboy Elementary School',
 'Serving the vibrant community of Barangay Lolomboy with quality basic education, modern classrooms, and an active sports program.',
 'published', 'news'),
(1, 5, 'Bocaue National High School',
 'The flagship public high school of Bocaue, offering complete Junior and Senior High School programs.',
 'published', 'news');

SET @sc1 = (SELECT content_id FROM content WHERE title = 'Bocaue Central School' LIMIT 1);
SET @sc2 = (SELECT content_id FROM content WHERE title = 'Lolomboy Elementary School' LIMIT 1);
SET @sc3 = (SELECT content_id FROM content WHERE title = 'Bocaue National High School' LIMIT 1);

INSERT IGNORE INTO content_fields (content_id, meta_key, meta_value) VALUES
(@sc1, 'label_key',   'schools'),
(@sc1, 'label_id',    CAST(@lbl_schools AS CHAR)),
(@sc1, 'is_featured', '1'),
(@sc1, 'location',    'Poblacion, Bocaue, Bulacan'),

(@sc2, 'label_key',   'schools'),
(@sc2, 'label_id',    CAST(@lbl_schools AS CHAR)),
(@sc2, 'is_featured', '0'),
(@sc2, 'location',    'Lolomboy, Bocaue, Bulacan'),

(@sc3, 'label_key',   'schools'),
(@sc3, 'label_id',    CAST(@lbl_schools AS CHAR)),
(@sc3, 'is_featured', '1'),
(@sc3, 'location',    'Poblacion, Bocaue, Bulacan');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@sc1, '/images/defaults/no-image.svg', 1, 0),
(@sc2, '/images/defaults/no-image.svg', 1, 0),
(@sc3, '/images/defaults/no-image.svg', 1, 0);


-- ========================================================================
-- HOSPITALS (post_type = 'news', label = hospitals)
-- ========================================================================

SET @lbl_hospitals = (SELECT category_id FROM categories WHERE label_key = 'hospitals' LIMIT 1);

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 5, 'Bocaue District Hospital',
 'The primary government hospital serving Bocaue and surrounding municipalities. Provides emergency services, outpatient consultations, maternal care, and surgical facilities.',
 'published', 'news'),
(1, 5, 'Bocaue Rural Health Unit',
 'The Municipal Rural Health Unit provides accessible primary healthcare — prenatal care, immunization, family planning, dental services, and barangay health outreach.',
 'published', 'news'),
(1, 5, 'St. Anne Medical Clinic',
 'A trusted private clinic offering general consultations, laboratory services, and minor surgical procedures for over two decades.',
 'published', 'news');

SET @hp1 = (SELECT content_id FROM content WHERE title = 'Bocaue District Hospital' LIMIT 1);
SET @hp2 = (SELECT content_id FROM content WHERE title = 'Bocaue Rural Health Unit' LIMIT 1);
SET @hp3 = (SELECT content_id FROM content WHERE title = 'St. Anne Medical Clinic' LIMIT 1);

INSERT IGNORE INTO content_fields (content_id, meta_key, meta_value) VALUES
(@hp1, 'label_key',   'hospitals'),
(@hp1, 'label_id',    CAST(@lbl_hospitals AS CHAR)),
(@hp1, 'is_featured', '1'),
(@hp1, 'location',    'Poblacion, Bocaue, Bulacan'),
(@hp1, 'hours',       'Open 24/7'),

(@hp2, 'label_key',   'hospitals'),
(@hp2, 'label_id',    CAST(@lbl_hospitals AS CHAR)),
(@hp2, 'is_featured', '1'),
(@hp2, 'location',    'Municipal Hall Compound, Bocaue, Bulacan'),
(@hp2, 'hours',       'Mon–Fri 8:00 AM – 5:00 PM'),

(@hp3, 'label_key',   'hospitals'),
(@hp3, 'label_id',    CAST(@lbl_hospitals AS CHAR)),
(@hp3, 'is_featured', '0'),
(@hp3, 'location',    'Wakas, Bocaue, Bulacan'),
(@hp3, 'hours',       'Mon–Sat 8:00 AM – 6:00 PM');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@hp1, '/images/defaults/no-image.svg', 1, 0),
(@hp2, '/images/defaults/no-image.svg', 1, 0),
(@hp3, '/images/defaults/no-image.svg', 1, 0);


-- ========================================================================
-- RESTAURANTS (post_type = 'place', label = restaurants)
-- ========================================================================

SET @lbl_restaurants = (SELECT category_id FROM categories WHERE label_key = 'restaurants' LIMIT 1);

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 2, 'Ihaw-Ihaw ni Bong',
 'A beloved riverside grill serving freshly caught fish, pork liempo, and chicken inasal over hot charcoal. A fixture of Bocaue''s food scene for 25 years.',
 'published', 'place'),
(1, 2, 'Lutong Probinsya Carinderia',
 'No-frills, home-cooked Filipino food at its finest. Daily rotating specials of sinigang, kare-kare, pinakbet, and fried fish.',
 'published', 'place'),
(1, 2, 'Merienda Cafe sa Bocaue',
 'A charming cafe offering Filipino merienda classics: bibingka, puto bumbong, arroz caldo, and freshly brewed barako coffee.',
 'published', 'place');

SET @rs1 = (SELECT content_id FROM content WHERE title = 'Ihaw-Ihaw ni Bong' LIMIT 1);
SET @rs2 = (SELECT content_id FROM content WHERE title = 'Lutong Probinsya Carinderia' LIMIT 1);
SET @rs3 = (SELECT content_id FROM content WHERE title = 'Merienda Cafe sa Bocaue' LIMIT 1);

INSERT IGNORE INTO content_fields (content_id, meta_key, meta_value) VALUES
(@rs1, 'label_key',   'restaurants'),
(@rs1, 'label_id',    CAST(@lbl_restaurants AS CHAR)),
(@rs1, 'is_featured', '1'),
(@rs1, 'location',    'Riverside, Bocaue, Bulacan'),

(@rs2, 'label_key',   'restaurants'),
(@rs2, 'label_id',    CAST(@lbl_restaurants AS CHAR)),
(@rs2, 'is_featured', '1'),
(@rs2, 'location',    'Public Market Area, Bocaue, Bulacan'),

(@rs3, 'label_key',   'restaurants'),
(@rs3, 'label_id',    CAST(@lbl_restaurants AS CHAR)),
(@rs3, 'is_featured', '0'),
(@rs3, 'location',    'National Highway, Bocaue, Bulacan');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@rs1, '/images/defaults/no-image.svg', 1, 0),
(@rs2, '/images/defaults/no-image.svg', 1, 0),
(@rs3, '/images/defaults/no-image.svg', 1, 0);


-- ========================================================================
-- TOURISM WONDERS (post_type = 'place', label = tourism-wonders)
-- ========================================================================

SET @lbl_tw = (SELECT category_id FROM categories WHERE label_key = 'tourism-wonders' LIMIT 1);

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 3, 'Holy Cross of Wawa Shrine',
 'Bocaue''s most sacred landmark, a centuries-old cross enshrined at the riverbank that serves as the centerpiece of the annual Pagoda Festival.',
 'published', 'place'),
(1, 3, 'Bocaue Fireworks Heritage',
 'Over 200 registered manufacturers call Bocaue home, making it the undisputed fireworks capital of the Philippines.',
 'published', 'place');

SET @tw1 = (SELECT content_id FROM content WHERE title = 'Holy Cross of Wawa Shrine' LIMIT 1);
SET @tw2 = (SELECT content_id FROM content WHERE title = 'Bocaue Fireworks Heritage' LIMIT 1);

INSERT IGNORE INTO content_fields (content_id, meta_key, meta_value) VALUES
(@tw1, 'label_key',   'tourism-wonders'),
(@tw1, 'label_id',    CAST(@lbl_tw AS CHAR)),
(@tw1, 'is_featured', '1'),
(@tw1, 'location',    'Wawa, Bocaue, Bulacan'),

(@tw2, 'label_key',   'tourism-wonders'),
(@tw2, 'label_id',    CAST(@lbl_tw AS CHAR)),
(@tw2, 'is_featured', '1'),
(@tw2, 'location',    'Fireworks District, Bocaue, Bulacan'),
(@tw2, 'hours',       'Mon–Sat 8:00 AM – 6:00 PM');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@tw1, '/images/defaults/no-image.svg', 1, 0),
(@tw2, '/images/defaults/no-image.svg', 1, 0);


-- ========================================================================
-- FEATURED CONTENT (homepage spotlight + landmarks carousel)
-- ========================================================================

-- Spotlight: Pagoda Festival event
INSERT INTO featured_content (content_id, section, sort_order, is_active) VALUES
(@event1, 'spotlight', 1, 1);

-- Landmarks carousel: top places
INSERT INTO featured_content (content_id, section, sort_order, is_active) VALUES
(@place1, 'landmark', 1, 1),
(@place2, 'landmark', 2, 1),
(@place3, 'landmark', 3, 1),
(@place6, 'landmark', 4, 1);


-- ========================================================================
-- MILESTONES (heritage timeline entries)
-- ========================================================================

INSERT INTO milestones (year, title, description, detail, side, sort_order, is_active) VALUES
(1580, 'Founding of Bocaue',
 'Bocaue was established as a visita (mission village) under the Augustinian missionaries, marking the beginning of organized settlement along the Bocaue River.',
 'The town''s name is derived from the word "bukaw," referring to the nocturnal owl that once populated the dense forests along the riverbanks.',
 'left', 1, 1),

(1707, 'San Martin de Tours Church Built',
 'The construction of the San Martin de Tours Parish Church was completed, establishing Bocaue as a significant religious center in Bulacan province.',
 'Built in the Baroque style, the church survived multiple earthquakes, typhoons, and the destructions of World War II.',
 'right', 2, 1),

(1860, 'Birth of the Fireworks Industry',
 'Local artisans began crafting fireworks using traditional methods passed down from Chinese merchants, launching an industry that would define Bocaue for generations.',
 'What started as small household operations has grown into a multi-million-peso industry with over 200 registered manufacturers.',
 'left', 3, 1),

(1896, 'Philippine Revolution in Bocaue',
 'Bocauenos joined the Katipunan and participated in the Philippine Revolution against Spanish colonial rule.',
 'The town served as a strategic staging ground for revolutionary forces due to its riverside location.',
 'right', 4, 1),

(1946, 'Post-War Reconstruction',
 'Following the devastation of World War II, the people of Bocaue rebuilt their town from the ruins.',
 'The rebuilding period saw the emergence of new industries, including shoe and slipper manufacturing.',
 'left', 5, 1),

(2010, 'Cultural Heritage Recognition',
 'The National Historical Commission recognized several Bocaue landmarks as Important Cultural Properties.',
 'This recognition led to the creation of MHACTO to oversee cultural heritage protection.',
 'right', 6, 1),

(2026, 'MHACTO Digital Platform Launch',
 'MHACTO launched its comprehensive digital platform to showcase Bocaue''s heritage, promote tourism, and serve visitors.',
 'The platform features interactive timelines, virtual destination tours, a CMS-powered news hub, and a tourist inquiry system.',
 'left', 7, 1);


-- ========================================================================
-- INQUIRIES (sample visitor inquiries for admin panel testing)
-- Types: tour_booking | general_contact | partnership | walk_in
-- ========================================================================

INSERT INTO inquiries
  (inquiry_type, full_name, email_address, contact_number, date_of_visit, number_of_pax, message, additional_details, status)
VALUES
('tour_booking',   'Maria Clara Santos',  'maria.santos@gmail.com',     '+639171234567', '2026-04-15', 8,
 'We would like to book a guided tour of Bocaue for our family reunion.',
 '{"visitorType":"tourist","purposeOfVisit":"Guided Tour / Sightseeing"}', 'unread'),

('tour_booking',   'Prof. Jose Reyes',    'jreyes@university.ph',        '+639281234567', '2026-05-10', 35,
 'Our History department would like to arrange an educational field trip for our college students.',
 '{"visitorType":"student","schoolName":"Bulacan State University","purposeOfVisit":"Educational / Field Trip"}', 'read'),

('general_contact','Kim Park',            'kimpark@travel.kr',           '+821012345678', '2026-06-20', 4,
 'We are visiting from South Korea and heard about the Pagoda Festival. Is it still happening in July?',
 '{"visitorType":"tourist","purposeOfVisit":"Attend Festival / Event"}', 'read'),

('partnership',    'Elena Fernandez',     'elena@bulacan-tourism.gov.ph','+639351234567', NULL, NULL,
 'We would like to discuss a potential collaboration for the Bulacan Heritage Trail project.',
 '{"visitorType":"tourist","purposeOfVisit":"Business / Partnership"}', 'assigned'),

('tour_booking',   'Andrei Villanueva',   'andrei.v@gmail.com',          '+639451234567', '2026-03-20', 2,
 'Is the river cruise available on weekdays? Planning a surprise anniversary trip.',
 '{"visitorType":"tourist","purposeOfVisit":"Guided Tour / Sightseeing"}', 'archived'),

('walk_in',        'Ana Reyes',           'ana.reyes@gmail.com',         '+639181234567', '2026-03-15', 3,
 'Walk-in visitor – interested in a quick heritage tour.',
 '{"visitorType":"tourist","purposeOfVisit":"Walk-in Visit"}', 'read');

-- Assign guide to partnership inquiry
UPDATE inquiries SET assigned_to = 'Guide: Juan dela Cruz' WHERE full_name = 'Elena Fernandez';

-- Add reply to in_progress inquiry
UPDATE inquiries SET
  reply_text = 'Hi Kim! Yes, the Pagoda Festival is scheduled for the first week of July 2026. We can arrange a guide for your visit — just let us know your exact dates!',
  replied_at = '2026-03-03 14:30:00',
  replied_by = 'Admin'
WHERE full_name = 'Kim Park';


-- ========================================================================
-- ACTIVITY LOGS (sample admin action history)
-- ========================================================================

INSERT INTO activity_logs (user_id, content_id, action, details, page_path, ip_address) VALUES
(1,    NULL,    'login',       '{"username":"admin","method":"email"}',                              '/admin',       '127.0.0.1'),
(1,    @place1, 'create_post', '{"title":"Bocaue River Cruise","post_type":"place"}',                '/admin/posts', '127.0.0.1'),
(1,    @place2, 'create_post', '{"title":"San Martin de Tours Parish Church","post_type":"place"}',  '/admin/posts', '127.0.0.1'),
(1,    @news1,  'create_post', '{"title":"Bocaue Launches New Tourism Website","post_type":"news"}', '/admin/posts', '127.0.0.1'),
(1,    @event1, 'create_post', '{"title":"Pagoda Festival 2026","post_type":"event"}',               '/admin/posts', '127.0.0.1'),
(NULL, @place1, 'page_view',   NULL,                                                                 '/destinations/bocaue-river-cruise',    '192.168.1.50'),
(NULL, @place2, 'page_view',   NULL,                                                                 '/destinations/san-martin-de-tours',    '192.168.1.51'),
(NULL, @place3, 'page_view',   NULL,                                                                 '/destinations/fireworks-district',     '10.0.0.25');


-- ========================================================================
-- PAGE VIEWS (destination click analytics)
-- ========================================================================

INSERT INTO page_views (content_id, visitor_session_id) VALUES
(@place1, 'sess_abc123'), (@place1, 'sess_def456'), (@place1, 'sess_ghi789'),
(@place1, 'sess_jkl012'), (@place1, 'sess_mno345'),
(@place2, 'sess_abc123'), (@place2, 'sess_pqr678'), (@place2, 'sess_stu901'),
(@place3, 'sess_def456'), (@place3, 'sess_vwx234'), (@place3, 'sess_yza567'),
(@place3, 'sess_bcd890'), (@place3, 'sess_efg123'), (@place3, 'sess_hij456'),
(@place3, 'sess_klm789'),
(@place4, 'sess_nop012'), (@place4, 'sess_qrs345'),
(@place5, 'sess_tuv678'),
(@place6, 'sess_wxy901'), (@place6, 'sess_zab234'), (@place6, 'sess_cde567');


-- ========================================================================
-- DONE — All sample data imported successfully.
-- ========================================================================
SELECT 'MHACTO seed data imported successfully!' AS result;
