-- MHACTO Missing Label Seed Data
-- Adds published content for every label_key that currently returns 404.
-- post_type ENUM only allows: 'place', 'news', 'event'

-- ----------------------------------------------------------------
-- STEP 1: Add missing categories (restaurants, tourism-wonders)
-- ----------------------------------------------------------------

INSERT IGNORE INTO category (parent_id, category_type, label_key, label_name, color_code, is_active) VALUES
(2, 'label', 'restaurants',     'Restaurants',     NULL, 1),
(3, 'label', 'tourism-wonders', 'Tourism Wonders', NULL, 1);

SET @cat_restaurants    = (SELECT category_id FROM category WHERE label_key = 'restaurants'     LIMIT 1);
SET @cat_tourism_wonders = (SELECT category_id FROM category WHERE label_key = 'tourism-wonders' LIMIT 1);

-- ----------------------------------------------------------------
-- STEP 2: TIMELINE OF EVENTS
-- category_id 1 = History, label_id 5
-- ----------------------------------------------------------------

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 1, 'Founding of Bocaue - 1580',
 'Bocaue was established as a visita (mission village) under the Augustinian missionaries, marking the beginning of organized settlement along the Bocaue River. The town name derives from bukaw, the nocturnal owl that once populated the dense riverside forests.',
 'published', 'news'),
(1, 1, 'Birth of the Fireworks Industry - 1860',
 'Local artisans began crafting fireworks using techniques passed down from Chinese merchants, launching an industry that would define Bocaue for generations. Today more than 200 registered manufacturers operate in the municipality.',
 'published', 'news'),
(1, 1, 'Philippine Revolution in Bocaue - 1896',
 'Bocauenos joined the Katipunan and participated in the Philippine Revolution against Spanish colonial rule. The riverside location made Bocaue a strategic staging ground for revolutionary forces, and many local heroes led the charge for independence.',
 'published', 'news');

SET @tl1 = (SELECT content_id FROM content WHERE title = 'Founding of Bocaue - 1580' LIMIT 1);
SET @tl2 = (SELECT content_id FROM content WHERE title = 'Birth of the Fireworks Industry - 1860' LIMIT 1);
SET @tl3 = (SELECT content_id FROM content WHERE title = 'Philippine Revolution in Bocaue - 1896' LIMIT 1);

INSERT INTO content_fields (content_id, meta_key, meta_value) VALUES
(@tl1, 'label_key', 'timeline-of-events'), (@tl1, 'label_id', '5'), (@tl1, 'is_featured', '1'), (@tl1, 'year', '1580'),
(@tl2, 'label_key', 'timeline-of-events'), (@tl2, 'label_id', '5'), (@tl2, 'is_featured', '1'), (@tl2, 'year', '1860'),
(@tl3, 'label_key', 'timeline-of-events'), (@tl3, 'label_id', '5'), (@tl3, 'is_featured', '1'), (@tl3, 'year', '1896');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@tl1, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@tl2, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@tl3, '/images/heroes/hero-bocaue.jpg', 1, 0);

-- ----------------------------------------------------------------
-- STEP 3: NOTABLE FIGURES
-- category_id 1 = History, label_id 6
-- ----------------------------------------------------------------

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 1, 'Gen. Emilio Jacinto',
 'Known as the Brains of the Katipunan, Emilio Jacinto was a revolutionary leader and close aide to Andres Bonifacio. His writings and battlefield leadership inspired countless Filipinos during the struggle for independence from Spanish colonial rule.',
 'published', 'news'),
(1, 1, 'Marcelo H. del Pilar',
 'A pioneering propagandist, journalist, and one of the foremost intellectuals of the Philippine reform movement. Born in Bulacan, del Pilar founded La Solidaridad, a newspaper that challenged Spanish colonial rule and inspired a generation of Filipino nationalists.',
 'published', 'news'),
(1, 1, 'Lola Basyang of Bocaue',
 'A revered community elder and oral historian who dedicated her life to preserving Bocaue stories, folk songs, and traditions. Her accounts of pre-war Bocaue life were documented by MHACTO and form one of the municipality most treasured cultural archives.',
 'published', 'news');

SET @fig1 = (SELECT content_id FROM content WHERE title = 'Gen. Emilio Jacinto' LIMIT 1);
SET @fig2 = (SELECT content_id FROM content WHERE title = 'Marcelo H. del Pilar' LIMIT 1);
SET @fig3 = (SELECT content_id FROM content WHERE title = 'Lola Basyang of Bocaue' LIMIT 1);

INSERT INTO content_fields (content_id, meta_key, meta_value) VALUES
(@fig1, 'label_key', 'notable-figures'), (@fig1, 'label_id', '6'), (@fig1, 'is_featured', '1'),
(@fig2, 'label_key', 'notable-figures'), (@fig2, 'label_id', '6'), (@fig2, 'is_featured', '1'),
(@fig3, 'label_key', 'notable-figures'), (@fig3, 'label_id', '6'), (@fig3, 'is_featured', '0');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@fig1, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@fig2, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@fig3, '/images/heroes/hero-bocaue.jpg', 1, 0);

-- ----------------------------------------------------------------
-- STEP 4: CULTURAL PRACTICES & TRADITIONS
-- category_id 2 = Arts & Culture, label_id 9
-- ----------------------------------------------------------------

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 2, 'Pagoda River Procession',
 'Every year on the first Sunday of July, Bocaue holds its famous Pagoda Festival - a grand river procession honoring the Holy Cross of Wawa. Elaborate floating pagodas carry the sacred image along the Bocaue River as thousands of devotees join in prayer, song, and celebration.',
 'published', 'news'),
(1, 2, 'Pamamanhikan Tradition',
 'Pamamanhikan is the Filipino tradition of a couple formally visiting the partner family to seek blessings before marriage. In Bocaue, this deeply respected custom is carried out with great ceremony: the groom family brings food and gifts, elders offer prayers, and the gathering strengthens bonds between families.',
 'published', 'news'),
(1, 2, 'Pasko ng Nayon - Village Christmas',
 'Bocaue village Christmas celebrations feature caroling with bamboo instruments, the Misa de Gallo (nine-dawn Masses), and communal feasts where neighbors share arroz caldo and bibingka. The tradition reflects the deep Catholic faith and communal warmth that defines the Bocaueno spirit.',
 'published', 'news');

SET @cp1 = (SELECT content_id FROM content WHERE title = 'Pagoda River Procession' LIMIT 1);
SET @cp2 = (SELECT content_id FROM content WHERE title = 'Pamamanhikan Tradition' LIMIT 1);
SET @cp3 = (SELECT content_id FROM content WHERE title = 'Pasko ng Nayon - Village Christmas' LIMIT 1);

INSERT INTO content_fields (content_id, meta_key, meta_value) VALUES
(@cp1, 'label_key', 'cultural-practices'), (@cp1, 'label_id', '9'), (@cp1, 'is_featured', '1'),
(@cp2, 'label_key', 'cultural-practices'), (@cp2, 'label_id', '9'), (@cp2, 'is_featured', '1'),
(@cp3, 'label_key', 'cultural-practices'), (@cp3, 'label_id', '9'), (@cp3, 'is_featured', '0');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@cp1, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@cp2, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@cp3, '/images/heroes/hero-bocaue.jpg', 1, 0);

-- ----------------------------------------------------------------
-- STEP 5: CRAFTS & ARTISAN
-- category_id 2 = Arts & Culture, label_id 19
-- ----------------------------------------------------------------

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 2, 'Pyrotechnic Artistry',
 'Bocaue is the fireworks capital of the Philippines, home to generations of master pyrotechnicians. Each family-run workshop passes down secret formulas and techniques, producing fireworks that light up celebrations nationwide. From colorful spinners to thunderous grand finale shells, the craft is a living tradition.',
 'published', 'news'),
(1, 2, 'Bamboo Weaving - Kawayan Craft',
 'Local artisans in Bocaue transform bamboo into beautifully crafted baskets, furniture, and decorative items using techniques handed down through generations. The kawayan craft showcases the resourcefulness and artistry of Bocaue craftspeople, offering sustainable handmade products beloved by locals and tourists.',
 'published', 'news'),
(1, 2, 'Tsinelas - Handcrafted Slippers',
 'Bocaue has a storied tradition of handcrafted tsinelas (slippers) and footwear. Local cobblers stitch durable, colorful pairs using locally sourced materials, keeping a cottage industry alive that once supplied footwear to much of Bulacan province. Visitors can watch artisans at work and purchase unique pieces.',
 'published', 'news');

SET @ca1 = (SELECT content_id FROM content WHERE title = 'Pyrotechnic Artistry' LIMIT 1);
SET @ca2 = (SELECT content_id FROM content WHERE title = 'Bamboo Weaving - Kawayan Craft' LIMIT 1);
SET @ca3 = (SELECT content_id FROM content WHERE title = 'Tsinelas - Handcrafted Slippers' LIMIT 1);

INSERT INTO content_fields (content_id, meta_key, meta_value) VALUES
(@ca1, 'label_key', 'crafts-artisan'), (@ca1, 'label_id', '19'), (@ca1, 'is_featured', '1'),
(@ca2, 'label_key', 'crafts-artisan'), (@ca2, 'label_id', '19'), (@ca2, 'is_featured', '1'),
(@ca3, 'label_key', 'crafts-artisan'), (@ca3, 'label_id', '19'), (@ca3, 'is_featured', '0');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@ca1, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@ca2, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@ca3, '/images/heroes/hero-bocaue.jpg', 1, 0);

-- ----------------------------------------------------------------
-- STEP 6: PEOPLE & WONDERS
-- category_id 2 = Arts & Culture, label_id 20
-- ----------------------------------------------------------------

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 2, 'Mang Carding - The Fireworks Legend',
 'For over 50 years, Mang Carding has been crafting fireworks in his workshop in Bocaue. His aerial shells have dazzled crowds at national celebrations from independence day parades to New Year festivities. He is among the last master pyrotechnicians who still mixes powders by hand.',
 'published', 'news'),
(1, 2, 'Ate Nena - The Kakanin Queen',
 'Ate Nena has been waking up at 3 AM every day for 30 years to prepare famous kakanin at the Bocaue Public Market. Her sapin-sapin and kutsinta have become local institutions, drawing customers from neighboring towns. She learned the recipes from her grandmother and has trained dozens of young vendors.',
 'published', 'news'),
(1, 2, 'Dok Rudy - Keeper of History',
 'A retired teacher and self-taught historian, Dok Rudy has spent decades documenting Bocaue stories, photographing heritage structures, and interviewing elders. His personal archive of over 2,000 photographs and oral history recordings is an invaluable community treasure.',
 'published', 'news');

SET @pw1 = (SELECT content_id FROM content WHERE title = 'Mang Carding - The Fireworks Legend' LIMIT 1);
SET @pw2 = (SELECT content_id FROM content WHERE title = 'Ate Nena - The Kakanin Queen' LIMIT 1);
SET @pw3 = (SELECT content_id FROM content WHERE title = 'Dok Rudy - Keeper of History' LIMIT 1);

INSERT INTO content_fields (content_id, meta_key, meta_value) VALUES
(@pw1, 'label_key', 'people-wonders'), (@pw1, 'label_id', '20'), (@pw1, 'is_featured', '1'),
(@pw2, 'label_key', 'people-wonders'), (@pw2, 'label_id', '20'), (@pw2, 'is_featured', '1'),
(@pw3, 'label_key', 'people-wonders'), (@pw3, 'label_id', '20'), (@pw3, 'is_featured', '0');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@pw1, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@pw2, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@pw3, '/images/heroes/hero-bocaue.jpg', 1, 0);

-- ----------------------------------------------------------------
-- STEP 7: TRAVEL TOURS
-- category_id 3 = Tourist Destinations, label_id 11
-- ----------------------------------------------------------------

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 3, 'Heritage Walking Tour',
 'Explore the heart of historic Bocaue on foot with our guided heritage walking tour. Visit the San Martin de Tours Parish Church, the ancestral homes of Barangay Lolomboy, and the Municipal Plaza. Your guide will share the stories behind each landmark and bring history to life.',
 'published', 'place'),
(1, 3, 'Bocaue River Cruise and Nature Tour',
 'Board a traditional bangka for a scenic cruise along the Bocaue River. Pass lush mangroves, riverside communities, and historic landmarks as your guide narrates the river role in the town history. Optional add-ons include riverbank birding and sunset photography.',
 'published', 'place'),
(1, 3, 'Fireworks Factory and Craft Tour',
 'Step inside a licensed pyrotechnics workshop and witness the artistry behind Bocaue world-famous fireworks. Watch master craftsmen at work, learn the history of the industry, and browse fireworks souvenirs. A safe, educational experience for the whole family.',
 'published', 'place');

SET @tt1 = (SELECT content_id FROM content WHERE title = 'Heritage Walking Tour' LIMIT 1);
SET @tt2 = (SELECT content_id FROM content WHERE title = 'Bocaue River Cruise and Nature Tour' LIMIT 1);
SET @tt3 = (SELECT content_id FROM content WHERE title = 'Fireworks Factory and Craft Tour' LIMIT 1);

INSERT INTO content_fields (content_id, meta_key, meta_value) VALUES
(@tt1, 'label_key', 'travel-tours'), (@tt1, 'label_id', '11'), (@tt1, 'is_featured', '1'),
(@tt1, 'duration', '2 hours'), (@tt1, 'price', 'Free - Donations welcome'),
(@tt2, 'label_key', 'travel-tours'), (@tt2, 'label_id', '11'), (@tt2, 'is_featured', '1'),
(@tt2, 'duration', '1.5 hours'), (@tt2, 'price', 'PHP 150 per person'),
(@tt3, 'label_key', 'travel-tours'), (@tt3, 'label_id', '11'), (@tt3, 'is_featured', '0'),
(@tt3, 'duration', '1 hour'), (@tt3, 'price', 'PHP 100 per person');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@tt1, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@tt2, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@tt3, '/images/heroes/hero-bocaue.jpg', 1, 0);

-- ----------------------------------------------------------------
-- STEP 8: EVENTS
-- category_id 4 = News & Events, label_id 12
-- ----------------------------------------------------------------

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 4, 'Pagoda Festival 2025',
 'The iconic Pagoda Festival returns with a grand river procession honoring the Holy Cross of Wawa. Thousands of devotees witness floating pagodas, stunning fireworks displays, and cultural performances that make this one of the Philippines most spectacular river festivals. Held annually on the first Sunday of July.',
 'published', 'event'),
(1, 4, 'Bocaue Heritage Week 2025',
 'A week-long celebration of Bocaue rich history and culture featuring museum tours, traditional cooking demonstrations, folk dance presentations, and a heritage photo exhibition. Open to all residents and visitors. Spanning the last week of October.',
 'published', 'event'),
(1, 4, 'Pyrotechnics Competition 2025',
 'Bocaue hosts fireworks teams in a dazzling competition of pyrotechnic artistry at the Municipal Grounds. The event draws thousands of spectators and showcases the world-class skill of Bocaue master fireworks craftsmen. Held annually in December.',
 'published', 'event');

SET @ev1 = (SELECT content_id FROM content WHERE title = 'Pagoda Festival 2025' LIMIT 1);
SET @ev2 = (SELECT content_id FROM content WHERE title = 'Bocaue Heritage Week 2025' LIMIT 1);
SET @ev3 = (SELECT content_id FROM content WHERE title = 'Pyrotechnics Competition 2025' LIMIT 1);

INSERT INTO content_fields (content_id, meta_key, meta_value) VALUES
(@ev1, 'label_key', 'events'), (@ev1, 'label_id', '12'), (@ev1, 'is_featured', '1'),
(@ev1, 'news_date', '2025-07-07'), (@ev1, 'location', 'Bocaue River, Bocaue, Bulacan'),
(@ev2, 'label_key', 'events'), (@ev2, 'label_id', '12'), (@ev2, 'is_featured', '1'),
(@ev2, 'news_date', '2025-10-25'), (@ev2, 'location', 'Municipal Hall, Bocaue, Bulacan'),
(@ev3, 'label_key', 'events'), (@ev3, 'label_id', '12'), (@ev3, 'is_featured', '0'),
(@ev3, 'news_date', '2025-12-28'), (@ev3, 'location', 'Municipal Grounds, Bocaue, Bulacan');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@ev1, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@ev2, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@ev3, '/images/heroes/hero-bocaue.jpg', 1, 0);

-- ----------------------------------------------------------------
-- STEP 9: SCHOOLS
-- category_id 14 = Community, label_id 15
-- ----------------------------------------------------------------

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 14, 'Bocaue Central School',
 'One of the oldest and most respected public elementary schools in Bocaue, this institution has been educating generations of Bocauenos since the early 1900s. Known for strong academic programs, dedicated teachers, and an active parent-teacher community.',
 'published', 'news'),
(1, 14, 'Lolomboy Elementary School',
 'Serving the vibrant community of Barangay Lolomboy, this public school provides quality basic education to hundreds of students each year. The school features modern classrooms, a computer laboratory, and an active sports program.',
 'published', 'news'),
(1, 14, 'Bocaue National High School',
 'The flagship public high school of Bocaue, offering complete Junior and Senior High School programs. The school consistently produces outstanding graduates and is home to competitive academic, arts, and sports teams.',
 'published', 'news');

SET @sc1 = (SELECT content_id FROM content WHERE title = 'Bocaue Central School' LIMIT 1);
SET @sc2 = (SELECT content_id FROM content WHERE title = 'Lolomboy Elementary School' LIMIT 1);
SET @sc3 = (SELECT content_id FROM content WHERE title = 'Bocaue National High School' LIMIT 1);

INSERT INTO content_fields (content_id, meta_key, meta_value) VALUES
(@sc1, 'label_key', 'schools'), (@sc1, 'label_id', '15'), (@sc1, 'is_featured', '1'),
(@sc1, 'location', 'Poblacion, Bocaue, Bulacan'),
(@sc2, 'label_key', 'schools'), (@sc2, 'label_id', '15'), (@sc2, 'is_featured', '0'),
(@sc2, 'location', 'Lolomboy, Bocaue, Bulacan'),
(@sc3, 'label_key', 'schools'), (@sc3, 'label_id', '15'), (@sc3, 'is_featured', '1'),
(@sc3, 'location', 'Poblacion, Bocaue, Bulacan');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@sc1, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@sc2, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@sc3, '/images/heroes/hero-bocaue.jpg', 1, 0);

-- ----------------------------------------------------------------
-- STEP 10: HOSPITALS
-- category_id 14 = Community, label_id 17
-- ----------------------------------------------------------------

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 14, 'Bocaue District Hospital',
 'The primary government hospital serving Bocaue and surrounding municipalities. Provides quality healthcare including emergency services, outpatient consultations, maternal care, and surgical facilities. A dedicated team of doctors, nurses, and health workers serves the community 24/7.',
 'published', 'news'),
(1, 14, 'Bocaue Rural Health Unit',
 'The Municipal Rural Health Unit provides accessible primary healthcare and wellness services to all Bocaue residents. Services include prenatal care, immunization, family planning counseling, dental services, and barangay health outreach programs.',
 'published', 'news'),
(1, 14, 'St. Anne Medical Clinic',
 'A trusted private clinic offering general medical consultations, laboratory services, and minor surgical procedures. St. Anne Medical Clinic has been serving Bocaue families for over two decades with affordable and compassionate healthcare.',
 'published', 'news');

SET @hp1 = (SELECT content_id FROM content WHERE title = 'Bocaue District Hospital' LIMIT 1);
SET @hp2 = (SELECT content_id FROM content WHERE title = 'Bocaue Rural Health Unit' LIMIT 1);
SET @hp3 = (SELECT content_id FROM content WHERE title = 'St. Anne Medical Clinic' LIMIT 1);

INSERT INTO content_fields (content_id, meta_key, meta_value) VALUES
(@hp1, 'label_key', 'hospitals'), (@hp1, 'label_id', '17'), (@hp1, 'is_featured', '1'),
(@hp1, 'location', 'Poblacion, Bocaue, Bulacan'), (@hp1, 'hours', 'Open 24/7'),
(@hp2, 'label_key', 'hospitals'), (@hp2, 'label_id', '17'), (@hp2, 'is_featured', '1'),
(@hp2, 'location', 'Municipal Hall Compound, Bocaue, Bulacan'), (@hp2, 'hours', 'Mon-Fri 8AM-5PM'),
(@hp3, 'label_key', 'hospitals'), (@hp3, 'label_id', '17'), (@hp3, 'is_featured', '0'),
(@hp3, 'location', 'Wakas, Bocaue, Bulacan'), (@hp3, 'hours', 'Mon-Sat 8AM-6PM');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@hp1, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@hp2, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@hp3, '/images/heroes/hero-bocaue.jpg', 1, 0);

-- ----------------------------------------------------------------
-- STEP 11: RESTAURANTS
-- category_id = @cat_restaurants (newly added)
-- ----------------------------------------------------------------

SET @lbl_restaurants = (SELECT category_id FROM category WHERE label_key = 'restaurants' LIMIT 1);

INSERT INTO content (user_id, category_id, title, description, status, post_type)
SELECT 1, @lbl_restaurants, 'Ihaw-Ihaw ni Bong',
 'A beloved riverside grill serving freshly caught fish, pork liempo, and chicken inasal over hot charcoal. Ihaw-Ihaw ni Bong has been a fixture of Bocaue food scene for 25 years. Dine on bamboo tables with a view of the river and enjoy the house-made dipping sauces.',
 'published', 'place';

INSERT INTO content (user_id, category_id, title, description, status, post_type)
SELECT 1, @lbl_restaurants, 'Lutong Probinsya Carinderia',
 'No-frills, home-cooked Filipino food at its finest. Lutong Probinsya serves daily rotating specials of sinigang, kare-kare, pinakbet, and fried fish, each dish made from fresh local ingredients. A favorite lunch spot for municipal employees and market vendors.',
 'published', 'place';

INSERT INTO content (user_id, category_id, title, description, status, post_type)
SELECT 1, @lbl_restaurants, 'Merienda Cafe sa Bocaue',
 'A charming cafe offering Filipino merienda classics: bibingka, puto bumbong, arroz caldo, and freshly brewed barako coffee. Located along the main road, it is the perfect stop for a mid-afternoon snack or a leisurely breakfast before exploring the town.',
 'published', 'place';

SET @rs1 = (SELECT content_id FROM content WHERE title = 'Ihaw-Ihaw ni Bong' LIMIT 1);
SET @rs2 = (SELECT content_id FROM content WHERE title = 'Lutong Probinsya Carinderia' LIMIT 1);
SET @rs3 = (SELECT content_id FROM content WHERE title = 'Merienda Cafe sa Bocaue' LIMIT 1);

INSERT INTO content_fields (content_id, meta_key, meta_value) VALUES
(@rs1, 'label_key', 'restaurants'), (@rs1, 'label_id', CAST(@lbl_restaurants AS CHAR)), (@rs1, 'is_featured', '1'),
(@rs1, 'location', 'Riverside, Bocaue, Bulacan'),
(@rs2, 'label_key', 'restaurants'), (@rs2, 'label_id', CAST(@lbl_restaurants AS CHAR)), (@rs2, 'is_featured', '1'),
(@rs2, 'location', 'Public Market Area, Bocaue, Bulacan'),
(@rs3, 'label_key', 'restaurants'), (@rs3, 'label_id', CAST(@lbl_restaurants AS CHAR)), (@rs3, 'is_featured', '0'),
(@rs3, 'location', 'National Highway, Bocaue, Bulacan');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@rs1, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@rs2, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@rs3, '/images/heroes/hero-bocaue.jpg', 1, 0);

-- ----------------------------------------------------------------
-- STEP 12: TOURISM WONDERS
-- category_id = @cat_tourism_wonders (newly added)
-- ----------------------------------------------------------------

SET @lbl_tw = (SELECT category_id FROM category WHERE label_key = 'tourism-wonders' LIMIT 1);

INSERT INTO content (user_id, category_id, title, description, status, post_type)
SELECT 1, @lbl_tw, 'Holy Cross of Wawa Shrine',
 'The Holy Cross of Wawa is Bocaue most sacred landmark, a centuries-old cross enshrined at the riverbank that serves as the centerpiece of the annual Pagoda Festival. Pilgrims and tourists visit year-round to offer prayers and witness the deep faith of the Bocaueno people.',
 'published', 'place';

INSERT INTO content (user_id, category_id, title, description, status, post_type)
SELECT 1, @lbl_tw, 'San Martin de Tours Parish Church',
 'One of the oldest churches in Bulacan, this magnificent Baroque church has stood for over 300 years. Its ornate facade, hand-carved altars, and century-old santos attract historians, devotees, and architecture enthusiasts. Designated a National Cultural Treasure.',
 'published', 'place';

INSERT INTO content (user_id, category_id, title, description, status, post_type)
SELECT 1, @lbl_tw, 'Bocaue Fireworks District',
 'Bocaue is the undisputed fireworks capital of the Philippines. The Fireworks District is home to over 200 registered manufacturers where visitors can witness master pyrotechnicians at work and learn the centuries-old craft that has made Bocaue famous worldwide.',
 'published', 'place';

SET @tw1 = (SELECT content_id FROM content WHERE title = 'Holy Cross of Wawa Shrine' LIMIT 1);
SET @tw2 = (SELECT content_id FROM content WHERE title = 'San Martin de Tours Parish Church' LIMIT 1);
SET @tw3 = (SELECT content_id FROM content WHERE title = 'Bocaue Fireworks District' LIMIT 1);

INSERT INTO content_fields (content_id, meta_key, meta_value) VALUES
(@tw1, 'label_key', 'tourism-wonders'), (@tw1, 'label_id', CAST(@lbl_tw AS CHAR)), (@tw1, 'is_featured', '1'),
(@tw1, 'location', 'Wawa, Bocaue, Bulacan'),
(@tw2, 'label_key', 'tourism-wonders'), (@tw2, 'label_id', CAST(@lbl_tw AS CHAR)), (@tw2, 'is_featured', '1'),
(@tw2, 'location', 'Poblacion, Bocaue, Bulacan'), (@tw2, 'hours', 'Daily 5:00 AM - 8:00 PM'),
(@tw3, 'label_key', 'tourism-wonders'), (@tw3, 'label_id', CAST(@lbl_tw AS CHAR)), (@tw3, 'is_featured', '1'),
(@tw3, 'location', 'Fireworks District, Bocaue, Bulacan'), (@tw3, 'hours', 'Mon-Sat 8:00 AM - 6:00 PM');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@tw1, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@tw2, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@tw3, '/images/heroes/hero-bocaue.jpg', 1, 0);

-- ----------------------------------------------------------------
-- Verify: SELECT meta_value AS label_key, COUNT(*) AS count
--         FROM content_fields WHERE meta_key = 'label_key'
--         GROUP BY meta_value ORDER BY meta_value;
-- ----------------------------------------------------------------
