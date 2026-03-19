-- ========================================================================
-- MHACTO Supplemental Seed — Museums, Religious Sites & place_category fix
-- Run AFTER seed-test-data.sql:
--   mysql -u root -p mhacto_db < seed-museums-religious.sql
--
-- This file:
--   1. Adds place_category + story meta to the 6 existing places
--   2. Seeds 3 museums
--   3. Seeds 3 religious sites
-- ========================================================================

-- ────────────────────────────────────────────────────────────────
-- 1) Patch existing places: add place_category = 'heritage' & story
-- ────────────────────────────────────────────────────────────────

SET @place1 = (SELECT content_id FROM content WHERE title = 'Bocaue River Cruise' LIMIT 1);
SET @place2 = (SELECT content_id FROM content WHERE title = 'San Martin de Tours Parish Church' LIMIT 1);
SET @place3 = (SELECT content_id FROM content WHERE title = 'Bocaue Fireworks District' LIMIT 1);
SET @place4 = (SELECT content_id FROM content WHERE title = 'Barangay Lolomboy Heritage Walk' LIMIT 1);
SET @place5 = (SELECT content_id FROM content WHERE title = 'Taal–Bocaue Footbridge' LIMIT 1);
SET @place6 = (SELECT content_id FROM content WHERE title = 'Bocaue Municipal Plaza' LIMIT 1);

INSERT INTO content_fields (content_id, meta_key, meta_value) VALUES
(@place1, 'place_category', 'heritage'),
(@place2, 'place_category', 'heritage'),
(@place3, 'place_category', 'heritage'),
(@place4, 'place_category', 'heritage'),
(@place5, 'place_category', 'heritage'),
(@place6, 'place_category', 'heritage'),

(@place1, 'story', 'The Bocaue River has been the lifeblood of the town since the Spanish colonial era, serving as the primary route for trade, transport, and the iconic Pagoda Festival river procession.'),
(@place2, 'story', 'The parish was established by Augustinian friars in the early 1700s and has survived earthquakes, typhoons, and World War II. It remains the spiritual center of Bocaue.'),
(@place3, 'story', 'Bocaue''s fireworks tradition dates back to the 1860s when Chinese merchants introduced pyrotechnic techniques to local artisans. The craft has been passed down through generations, making Bocaue the fireworks capital of the Philippines.'),
(@place4, 'story', 'Lolomboy is one of the oldest barangays in Bocaue, where ancestral homes and cobblestone paths bear witness to centuries of colonial history and community resilience.'),
(@place5, 'story', 'This charming pedestrian footbridge has connected the communities of Bocaue and Taal for decades, offering panoramic views of the river delta at sunset.'),
(@place6, 'story', 'The Municipal Plaza has been the center of civic life and public gatherings since the Spanish era, surrounded by heritage-era buildings and centuries-old acacia trees.');


-- ────────────────────────────────────────────────────────────────
-- 2) MUSEUMS (post_type = 'place', label = destinations)
--    place_category = 'museum'
-- ────────────────────────────────────────────────────────────────

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

INSERT INTO content_fields (content_id, meta_key, meta_value) VALUES
(@mus1, 'label_key', 'destinations'), (@mus1, 'label_id', '10'), (@mus1, 'is_featured', '1'),
(@mus1, 'place_category', 'museum'),
(@mus1, 'location', 'Municipal Hall, Poblacion, Bocaue, Bulacan'),
(@mus1, 'hours', 'Mon–Fri 8:00 AM – 5:00 PM'),
(@mus1, 'established', '2018'),
(@mus1, 'story', 'Founded as part of the MHACTO office, this gallery preserves local historical documents, artifacts, and oral histories collected from Bocaue elders over the past decade.'),

(@mus2, 'label_key', 'destinations'), (@mus2, 'label_id', '10'), (@mus2, 'is_featured', '1'),
(@mus2, 'place_category', 'museum'),
(@mus2, 'location', 'San Martin de Tours Parish Compound, Bocaue, Bulacan'),
(@mus2, 'hours', 'Tue–Sun 9:00 AM – 4:00 PM'),
(@mus2, 'established', '2015'),
(@mus2, 'story', 'Established to preserve the Pagoda Festival''s rich legacy, the museum contains artifacts spanning over 300 years and serves as the official archive for festival documentation.'),

(@mus3, 'label_key', 'destinations'), (@mus3, 'label_id', '10'), (@mus3, 'is_featured', '0'),
(@mus3, 'place_category', 'museum'),
(@mus3, 'location', 'Ciudad de Victoria, Bocaue–Santa Maria, Bulacan'),
(@mus3, 'hours', 'Daily 10:00 AM – 6:00 PM (except event days)'),
(@mus3, 'established', '2014'),
(@mus3, 'story', 'The Philippine Arena holds a Guinness World Record as the largest indoor arena, seating over 55,000. Its visitor center tells the story of its construction and the events that have graced its stage.');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@mus1, '/images/defaults/no-image.svg', 1, 0),
(@mus2, '/images/defaults/no-image.svg', 1, 0),
(@mus3, '/images/defaults/no-image.svg', 1, 0);


-- ────────────────────────────────────────────────────────────────
-- 3) RELIGIOUS SITES (post_type = 'place', label = destinations)
--    place_category = 'religious'
-- ────────────────────────────────────────────────────────────────

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 3, 'St. Martin of Tours Parish Church',
 'The spiritual heart of Bocaue, St. Martin of Tours Parish Church has served the community since 1707. Its Baroque-influenced facade, hand-carved retablos, and bell tower are recognized as Important Cultural Property by the NHCP.',
 'published', 'place'),
(1, 3, 'Iglesia Ni Cristo Central Temple – Bocaue',
 'A striking modernist worship hall of the Iglesia Ni Cristo, this temple features soaring spires and geometric stained glass. It serves as the central congregation for INC members in Bocaue and nearby towns.',
 'published', 'place'),
(1, 3, 'Shrine of the Holy Cross of Wawa',
 'A riverside chapel marking the legendary site where a miraculous crucifix was found floating in the waters of the Bocaue River. This shrine is the starting point of the annual Pagoda Festival river procession.',
 'published', 'place');

SET @rel1 = (SELECT content_id FROM content WHERE title = 'St. Martin of Tours Parish Church' LIMIT 1);
SET @rel2 = (SELECT content_id FROM content WHERE title = 'Iglesia Ni Cristo Central Temple – Bocaue' LIMIT 1);
SET @rel3 = (SELECT content_id FROM content WHERE title = 'Shrine of the Holy Cross of Wawa' LIMIT 1);

INSERT INTO content_fields (content_id, meta_key, meta_value) VALUES
(@rel1, 'label_key', 'destinations'), (@rel1, 'label_id', '10'), (@rel1, 'is_featured', '1'),
(@rel1, 'place_category', 'religious'),
(@rel1, 'location', 'Poblacion, Bocaue, Bulacan'),
(@rel1, 'hours', 'Daily 5:00 AM – 8:00 PM'),
(@rel1, 'established', '1707'),
(@rel1, 'story', 'Established by Augustinian friars in the early 1700s, this church has withstood earthquakes, typhoons, and the devastation of World War II. Its icons, wooden santos, and centuries-old bells are treasures of Philippine colonial heritage.'),

(@rel2, 'label_key', 'destinations'), (@rel2, 'label_id', '10'), (@rel2, 'is_featured', '0'),
(@rel2, 'place_category', 'religious'),
(@rel2, 'location', 'Wakas, Bocaue, Bulacan'),
(@rel2, 'hours', 'Worship schedules only — contact local congregation'),
(@rel2, 'established', '1990'),
(@rel2, 'story', 'The Iglesia Ni Cristo Central Temple in Bocaue was built as the worship center for the growing INC community in the municipality. Its modern design stands in contrast to the town''s colonial-era churches.'),

(@rel3, 'label_key', 'destinations'), (@rel3, 'label_id', '10'), (@rel3, 'is_featured', '1'),
(@rel3, 'place_category', 'religious'),
(@rel3, 'location', 'Wawa, Bocaue, Bulacan'),
(@rel3, 'hours', 'Daily 6:00 AM – 6:00 PM'),
(@rel3, 'established', 'circa 1787'),
(@rel3, 'story', 'Legend holds that a wooden crucifix was discovered floating in the Bocaue River at this very spot in the late 18th century. The miraculous finding gave rise to the Pagoda Festival, one of the Philippines'' most dramatic river processions.');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@rel1, '/images/defaults/no-image.svg', 1, 0),
(@rel2, '/images/defaults/no-image.svg', 1, 0),
(@rel3, '/images/defaults/no-image.svg', 1, 0);
