-- ========================================================================
-- MHACTO Test Data Seed — Bocaue, Bulacan
-- Run: mysql -u root -p mhacto_db < seed-test-data.sql
--   or: php database/run-seed.php
-- Safe to run on an empty DB (after schema + categories are in place).
-- ========================================================================

-- ────────────────────────────────────────────────────────────────
-- PLACES (post_type = 'place')
-- category_id 3 = Tourist Destinations, label 10 = destinations
-- ────────────────────────────────────────────────────────────────

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 3, 'Bocaue River Cruise', 'Experience the serene beauty of the Bocaue River on a traditional bangka ride. Glide past historic landmarks, lush mangroves, and riverside communities while learning about the town''s deep connection to the waterways that shaped its identity.', 'published', 'place'),
(1, 3, 'San Martin de Tours Parish Church', 'One of the oldest churches in Bulacan, the San Martin de Tours Parish Church has stood as a beacon of faith since the Spanish colonial era. Its Baroque-influenced architecture and centuries-old interior make it a must-visit heritage landmark.', 'published', 'place'),
(1, 3, 'Bocaue Fireworks District', 'Bocaue is the fireworks capital of the Philippines. Visit the Fireworks District to see master pyrotechnicians at work, browse dazzling displays, and learn about the centuries-old craft that has made the town world-famous.', 'published', 'place'),
(1, 3, 'Barangay Lolomboy Heritage Walk', 'Take a leisurely stroll through one of Bocaue''s oldest barangays, where ancestral homes, cobblestone paths, and a vibrant local community reveal the town''s rich colonial past and enduring resilience.', 'published', 'place'),
(1, 3, 'Taal–Bocaue Footbridge', 'A charming pedestrian footbridge connecting Bocaue to neighboring Taal, offering panoramic views of the river delta. Best visited at golden hour when the sunset paints the water in hues of amber and rose.', 'published', 'place'),
(1, 3, 'Bocaue Municipal Plaza', 'The heart of civic life, the Municipal Plaza hosts weekend markets, cultural performances, and community events. Surrounded by heritage buildings and shaded by centuries-old acacia trees, it is the perfect starting point for exploring the town.', 'published', 'place');

-- Get the content IDs just inserted (places: IDs 1–6)
SET @place1 = (SELECT content_id FROM content WHERE title = 'Bocaue River Cruise' LIMIT 1);
SET @place2 = (SELECT content_id FROM content WHERE title = 'San Martin de Tours Parish Church' LIMIT 1);
SET @place3 = (SELECT content_id FROM content WHERE title = 'Bocaue Fireworks District' LIMIT 1);
SET @place4 = (SELECT content_id FROM content WHERE title = 'Barangay Lolomboy Heritage Walk' LIMIT 1);
SET @place5 = (SELECT content_id FROM content WHERE title = 'Taal–Bocaue Footbridge' LIMIT 1);
SET @place6 = (SELECT content_id FROM content WHERE title = 'Bocaue Municipal Plaza' LIMIT 1);

-- Place meta fields
INSERT INTO content_fields (content_id, meta_key, meta_value) VALUES
(@place1, 'label_key', 'destinations'), (@place1, 'label_id', '10'), (@place1, 'is_featured', '1'),
(@place1, 'location', 'Bocaue River, Bocaue, Bulacan'), (@place1, 'hours', 'Daily 6:00 AM – 5:00 PM'),
(@place1, 'established', '1920'),

(@place2, 'label_key', 'destinations'), (@place2, 'label_id', '10'), (@place2, 'is_featured', '1'),
(@place2, 'location', 'Poblacion, Bocaue, Bulacan'), (@place2, 'hours', 'Daily 5:00 AM – 8:00 PM'),
(@place2, 'established', '1707'),

(@place3, 'label_key', 'destinations'), (@place3, 'label_id', '10'), (@place3, 'is_featured', '1'),
(@place3, 'location', 'Fireworks District, Bocaue, Bulacan'), (@place3, 'hours', 'Mon–Sat 8:00 AM – 6:00 PM'),
(@place3, 'established', '1860'),

(@place4, 'label_key', 'destinations'), (@place4, 'label_id', '10'), (@place4, 'is_featured', '0'),
(@place4, 'location', 'Lolomboy, Bocaue, Bulacan'), (@place4, 'hours', 'Open 24/7'),

(@place5, 'label_key', 'destinations'), (@place5, 'label_id', '10'), (@place5, 'is_featured', '0'),
(@place5, 'location', 'Bocaue-Taal Border, Bulacan'), (@place5, 'hours', 'Open 24/7'),

(@place6, 'label_key', 'destinations'), (@place6, 'label_id', '10'), (@place6, 'is_featured', '0'),
(@place6, 'location', 'Poblacion, Bocaue, Bulacan'), (@place6, 'hours', 'Open 24/7');

-- Place images (using placeholder paths — replace with real uploads later)
INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@place1, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@place2, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@place3, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@place4, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@place5, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@place6, '/images/heroes/hero-bocaue.jpg', 1, 0);


-- ────────────────────────────────────────────────────────────────
-- NEWS ARTICLES (post_type = 'news')
-- category_id 4 = News & Events, label 13 = news
-- ────────────────────────────────────────────────────────────────

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 4, 'Bocaue Launches New Tourism Website', 'The Municipal History, Arts, Culture & Tourism Office (MHACTO) officially launched its revamped digital platform to promote Bocaue''s heritage and tourism offerings to a wider audience.', 'published', 'news'),
(1, 4, 'River Clean-Up Drive a Success', 'Over 500 volunteers participated in the annual Bocaue River clean-up, collecting 3 tons of waste and planting 200 mangrove seedlings along the riverbanks. The initiative is part of the municipality''s broader environmental conservation program.', 'published', 'news'),
(1, 4, 'Heritage Preservation Ordinance Approved', 'The Sangguniang Bayan of Bocaue approved a landmark ordinance protecting historical structures within the municipality. The law designates 15 buildings and sites as protected heritage properties.', 'published', 'news');

SET @news1 = (SELECT content_id FROM content WHERE title = 'Bocaue Launches New Tourism Website' LIMIT 1);
SET @news2 = (SELECT content_id FROM content WHERE title = 'River Clean-Up Drive a Success' LIMIT 1);
SET @news3 = (SELECT content_id FROM content WHERE title = 'Heritage Preservation Ordinance Approved' LIMIT 1);

INSERT INTO content_fields (content_id, meta_key, meta_value) VALUES
(@news1, 'label_key', 'news'), (@news1, 'label_id', '13'), (@news1, 'is_featured', '1'), (@news1, 'news_date', '2026-03-01'),
(@news2, 'label_key', 'news'), (@news2, 'label_id', '13'), (@news2, 'is_featured', '0'), (@news2, 'news_date', '2026-02-20'),
(@news3, 'label_key', 'news'), (@news3, 'label_id', '13'), (@news3, 'is_featured', '0'), (@news3, 'news_date', '2026-02-15');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@news1, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@news2, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@news3, '/images/heroes/hero-bocaue.jpg', 1, 0);


-- ────────────────────────────────────────────────────────────────
-- EVENTS (post_type = 'event')
-- category_id 4 = News & Events, label 12 = events
-- ────────────────────────────────────────────────────────────────

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 4, 'Pagoda Festival 2026', 'The famous Pagoda Festival returns with a grand river procession honoring the Holy Cross of Wawa. Thousands of devotees gather to witness the floating pagodas, fireworks displays, and cultural performances that make this one of the most spectacular fiestas in Bulacan.', 'published', 'event'),
(1, 4, 'Bocaue Heritage Week', 'A week-long celebration of Bocaue''s history and culture featuring museum tours, traditional cooking demos, folk dance presentations, and a heritage photo exhibition. Open to all residents and visitors.', 'published', 'event'),
(1, 4, 'Pyrotechnics International Competition', 'Bocaue hosts fireworks teams from around the world in a dazzling competition of pyrotechnic artistry. Held annually at the Municipal Grounds, the event draws over 50,000 spectators each year.', 'published', 'event');

SET @event1 = (SELECT content_id FROM content WHERE title = 'Pagoda Festival 2026' LIMIT 1);
SET @event2 = (SELECT content_id FROM content WHERE title = 'Bocaue Heritage Week' LIMIT 1);
SET @event3 = (SELECT content_id FROM content WHERE title = 'Pyrotechnics International Competition' LIMIT 1);

INSERT INTO content_fields (content_id, meta_key, meta_value) VALUES
(@event1, 'label_key', 'events'), (@event1, 'label_id', '12'), (@event1, 'is_featured', '1'), (@event1, 'news_date', '2026-07-01'),
(@event1, 'location', 'Bocaue River, Bocaue, Bulacan'),
(@event2, 'label_key', 'events'), (@event2, 'label_id', '12'), (@event2, 'is_featured', '1'), (@event2, 'news_date', '2026-05-15'),
(@event2, 'location', 'Municipal Hall, Bocaue, Bulacan'),
(@event3, 'label_key', 'festivals'), (@event3, 'label_id', '8'), (@event3, 'is_featured', '0'), (@event3, 'news_date', '2026-12-28'),
(@event3, 'location', 'Municipal Grounds, Bocaue, Bulacan');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@event1, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@event2, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@event3, '/images/heroes/hero-bocaue.jpg', 1, 0);


-- ────────────────────────────────────────────────────────────────
-- LOCAL CUISINE (post_type = 'place', label = local-cuisine)
-- category_id 2 = Arts & Culture, label 7 = local-cuisine
-- ────────────────────────────────────────────────────────────────

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 2, 'Chicharon ni Mang Tomas', 'The crispiest, most flavorful chicharon in Bulacan. Made from premium pork rind fried to golden perfection, this local favorite has been a staple of Bocaue for over four decades. Best paired with spiced vinegar.', 'published', 'place'),
(1, 2, 'Kakanin sa Palengke', 'A colorful array of traditional Filipino rice cakes — puto, kutsinta, sapin-sapin, and biko — freshly made every morning by local mananahi. Visit the Bocaue Public Market early for the best selection.', 'published', 'place'),
(1, 2, 'Pancit Bocaue', 'A unique local noodle dish featuring thick egg noodles stir-fried with fresh vegetables, shrimp, and pork, seasoned with calamansi and soy sauce. A must-try dish that you won''t find anywhere else.', 'published', 'place');

SET @food1 = (SELECT content_id FROM content WHERE title = 'Chicharon ni Mang Tomas' LIMIT 1);
SET @food2 = (SELECT content_id FROM content WHERE title = 'Kakanin sa Palengke' LIMIT 1);
SET @food3 = (SELECT content_id FROM content WHERE title = 'Pancit Bocaue' LIMIT 1);

INSERT INTO content_fields (content_id, meta_key, meta_value) VALUES
(@food1, 'label_key', 'local-cuisine'), (@food1, 'label_id', '7'), (@food1, 'is_featured', '1'),
(@food1, 'location', 'National Highway, Bocaue, Bulacan'),
(@food2, 'label_key', 'local-cuisine'), (@food2, 'label_id', '7'), (@food2, 'is_featured', '1'),
(@food2, 'location', 'Bocaue Public Market, Bulacan'),
(@food3, 'label_key', 'local-cuisine'), (@food3, 'label_id', '7'), (@food3, 'is_featured', '0'),
(@food3, 'location', 'Various eateries, Bocaue, Bulacan');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@food1, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@food2, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@food3, '/images/heroes/hero-bocaue.jpg', 1, 0);


-- ────────────────────────────────────────────────────────────────
-- FEATURED CONTENT (spotlight + landmarks carousel)
-- ────────────────────────────────────────────────────────────────

-- Spotlight: feature the Pagoda Festival event
INSERT INTO featured_content (content_id, section, sort_order, is_active) VALUES
(@event1, 'spotlight', 1, 1);

-- Landmarks carousel: top 4 places
INSERT INTO featured_content (content_id, section, sort_order, is_active) VALUES
(@place1, 'landmark', 1, 1),
(@place2, 'landmark', 2, 1),
(@place3, 'landmark', 3, 1),
(@place6, 'landmark', 4, 1);


-- ────────────────────────────────────────────────────────────────
-- MILESTONES (Heritage Timeline)
-- ────────────────────────────────────────────────────────────────

-- Clear existing test milestone(s)
DELETE FROM milestone WHERE milestone_id > 0;

INSERT INTO milestone (year, title, description, detail, side, sort_order, is_active) VALUES
(1580, 'Founding of Bocaue',
 'Bocaue was established as a visita (mission village) under the Augustinian missionaries, marking the beginning of organized settlement along the Bocaue River.',
 'The town''s name is derived from the word "bukaw," referring to the nocturnal owl that once populated the dense forests along the riverbanks. Early settlers were primarily fishermen and farmers who thrived on the river''s abundant resources.',
 'left', 1, 1),

(1707, 'San Martin de Tours Church Built',
 'The construction of the San Martin de Tours Parish Church was completed, establishing Bocaue as a significant religious center in Bulacan province.',
 'Built in the Baroque style, the church survived multiple earthquakes, typhoons, and the destructions of World War II. It features hand-carved wooden altars, century-old santos, and a bell tower that has called the faithful to prayer for over three centuries.',
 'right', 2, 1),

(1860, 'Birth of the Fireworks Industry',
 'Local artisans began crafting fireworks using traditional methods passed down from Chinese merchants, launching an industry that would define Bocaue for generations to come.',
 'What started as small household operations has grown into a multi-million-peso industry with over 200 registered manufacturers. Bocaue fireworks have been featured in international competitions in Canada, Japan, and the Philippines'' own PyroMusical events.',
 'left', 3, 1),

(1896, 'Philippine Revolution in Bocaue',
 'Bocauenos joined the Katipunan and participated in the Philippine Revolution against Spanish colonial rule, with several local heroes leading the charge.',
 'The town served as a strategic staging ground for revolutionary forces due to its riverside location. After independence, many of the town''s revolutionary sites were preserved and can still be visited today.',
 'right', 4, 1),

(1946, 'Post-War Reconstruction',
 'Following the devastation of World War II, the people of Bocaue rebuilt their town from the ruins, restoring the church, municipal hall, and homes with remarkable determination.',
 'The rebuilding period saw the emergence of new industries, including shoe and slipper manufacturing, which became a secondary economic driver alongside fireworks production. The town''s population nearly doubled in the two decades following the war.',
 'left', 5, 1),

(2010, 'Cultural Heritage Recognition',
 'The National Historical Commission of the Philippines recognized several Bocaue landmarks as Important Cultural Properties, including the San Martin de Tours Church and the Pagoda Festival tradition.',
 'This recognition brought increased tourism revenue and national attention to the town''s preservation efforts. It also led to the creation of MHACTO, the Municipal History, Arts, Culture & Tourism Office, to oversee cultural heritage protection.',
 'right', 6, 1),

(2026, 'MHACTO Digital Platform Launch',
 'The Municipal History, Arts, Culture & Tourism Office launched its comprehensive digital platform to showcase Bocaue''s heritage, promote tourism, and serve visitors with modern inquiry and booking systems.',
 'The platform features interactive timelines, virtual destination tours, a CMS-powered news hub, and a tourist inquiry system with real-time assignment to local guides. Built with Next.js, React, and a PHP backend, it represents the town''s commitment to digital innovation.',
 'left', 7, 1);


-- ────────────────────────────────────────────────────────────────
-- INQUIRIES (sample visitor inquiries to test admin panel)
-- ────────────────────────────────────────────────────────────────

INSERT INTO inquiries (inquiry_type, full_name, email_address, contact_number, date_of_visit, number_of_pax, message, additional_details, status) VALUES
('tour_booking', 'Maria Clara Santos', 'maria.santos@gmail.com', '+639171234567', '2026-04-15', 8,
 'Hello! We would like to book a guided tour of Bocaue for our family reunion. We are interested in visiting the historical church, the fireworks district, and the river cruise. Please advise availability.',
 '{"visitorType":"tourist","purposeOfVisit":"Guided Tour / Sightseeing"}', 'unread'),

('tour_booking', 'Prof. Jose Reyes', 'jreyes@university.ph', '+639281234567', '2026-05-10', 35,
 'Our History department would like to arrange an educational field trip for our college students. We are particularly interested in the heritage walk and the church history. Can you provide a student-friendly itinerary?',
 '{"visitorType":"student","schoolName":"Bulacan State University","purposeOfVisit":"Educational / Field Trip"}', 'unread'),

('general_contact', 'Kim Park', 'kimpark@travel.kr', '+821012345678', '2026-06-20', 4,
 'Hi, my friends and I are visiting from South Korea and we heard about the Pagoda Festival. Is it still happening in July? We would love to attend and also try the local food. Any recommendations?',
 '{"visitorType":"tourist","purposeOfVisit":"Attend Festival / Event"}', 'in_progress'),

('partnership', 'Elena Fernandez', 'elena@bulacan-tourism.gov.ph', '+639351234567', NULL, NULL,
 'On behalf of the Provincial Tourism Office, we would like to discuss a potential collaboration for the Bulacan Heritage Trail project. Bocaue would be a key stop on the trail. Please get back to us at your earliest convenience.',
 '{"visitorType":"tourist","purposeOfVisit":"Business / Partnership"}', 'assigned'),

('tour_booking', 'Andrei Villanueva', 'andrei.v@gmail.com', '+639451234567', '2026-03-20', 2,
 'Is the river cruise available on weekdays? Planning a surprise anniversary trip for my wife. Would love a private ride if possible!',
 '{"visitorType":"tourist","purposeOfVisit":"Guided Tour / Sightseeing"}', 'archived');

-- Update the assigned inquiry with guide info
UPDATE inquiries SET assigned_to = 'Guide: Juan dela Cruz' WHERE full_name = 'Elena Fernandez';

-- Add a reply to the in-progress inquiry
UPDATE inquiries SET
  reply_text = 'Hi Kim! Yes, the Pagoda Festival is scheduled for the first week of July 2026. It is one of our biggest events! For food, we highly recommend trying the local chicharon and kakanin at the public market. We can arrange a guide for your visit — just let us know your exact dates!',
  replied_at = '2026-03-03 14:30:00',
  replied_by = 'Admin'
WHERE full_name = 'Kim Park';


-- ────────────────────────────────────────────────────────────────
-- ACTIVITY LOGS (sample admin actions)
-- ────────────────────────────────────────────────────────────────

INSERT INTO activity_logs (user_id, content_id, action, details, page_path, ip_address) VALUES
(1, NULL, 'login', '{"username":"admin","method":"email"}', '/admin', '127.0.0.1'),
(1, @place1, 'create', '{"title":"Bocaue River Cruise","post_type":"place"}', '/admin/posts', '127.0.0.1'),
(1, @place2, 'create', '{"title":"San Martin de Tours Parish Church","post_type":"place"}', '/admin/posts', '127.0.0.1'),
(1, @place3, 'create', '{"title":"Bocaue Fireworks District","post_type":"place"}', '/admin/posts', '127.0.0.1'),
(1, @news1, 'create', '{"title":"Bocaue Launches New Tourism Website","post_type":"news"}', '/admin/posts', '127.0.0.1'),
(1, @event1, 'create', '{"title":"Pagoda Festival 2026","post_type":"event"}', '/admin/posts', '127.0.0.1'),
(NULL, @place1, 'page_view', NULL, '/destinations/bocaue-river-cruise', '192.168.1.50'),
(NULL, @place2, 'page_view', NULL, '/destinations/san-martin-de-tours', '192.168.1.51'),
(NULL, @place3, 'page_view', NULL, '/destinations/fireworks-district', '10.0.0.25');


-- ────────────────────────────────────────────────────────────────
-- PAGE VIEWS (destination click analytics)
-- ────────────────────────────────────────────────────────────────

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

-- Done! 🎉
SELECT 'Seed data inserted successfully!' AS result;
