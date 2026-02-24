import { asset } from "@/lib/utils"

export interface NewsArticle {
  id: string
  title: string
  summary: string
  description: string
  content: string
  image: string
  date: string
  category: "competition" | "project" | "community" | "festival"
  author: string
  places: string[]
}

export const categoryLabels: Record<NewsArticle["category"], string> = {
  competition: "Competition",
  project: "Development",
  community: "Community",
  festival: "Festival",
}

export const newsArticles: NewsArticle[] = [
  {
    id: "bocaue-youth-wins-regional-quiz-bee",
    title: "Bocaue Youth Wins Regional Quiz Bee Championship",
    summary:
      "Students from Bocaue National High School brought home the gold after clinching first place at the 2026 Regional Quiz Bee held in the City of San Fernando, Pampanga.",
    description: "A historic victory for Bocaue's brightest students at the Regional Quiz Bee Championship",
    places: ["Bocaue National High School", "City of San Fernando", "Municipal Hall"],
    content: `The Municipality of Bocaue is bursting with pride as a team of talented students from Bocaue National High School emerged as champions at the 2026 Central Luzon Regional Quiz Bee held on February 10, 2026 in the City of San Fernando, Pampanga.

The winning team — composed of Angela Santos, Marco Reyes, and Jessa Dela Cruz — competed against 14 other provincial finalists in a grueling multi-round competition that covered Science, Mathematics, Filipino, and Social Studies.

"We trained every day after school for three months," shared Angela Santos, the team captain. "Our teachers and families supported us the entire way, and we're proud to represent Bocaue."

Mayor Jonathan Flores personally congratulated the students during a short ceremony at the Municipal Hall, calling them "shining examples of Bocaueño excellence."

The Municipal History, Arts, Culture and Tourism Office (MHACTO) also recognized the team, noting that the win reflects the community's deep commitment to education and youth development.

The students are now set to represent Central Luzon in the National Quiz Bee Finals scheduled for April 2026 in Manila. Bocaue LGU has pledged full support, including travel allowances and additional coaching sessions, to help the team prepare for the national stage.

Congratulations to our champions — Bocaue is behind you!`,
    image: asset("/images/places/philippine-arena.jpg"),
    date: "2026-02-12",
    category: "competition",
    author: "MHACTO Bocaue",
  },
  {
    id: "bocaue-river-esplanade-project",
    title: "New Bocaue River Esplanade Project Breaks Ground",
    summary:
      "The Municipality of Bocaue kicks off construction of the Bocaue River Esplanade, a transformative waterfront project aimed at boosting tourism and public recreation.",
    description: "A ₱85 million waterfront transformation project featuring cultural pavilions and heritage trails",
    places: ["Bocaue River", "Philippine Arena", "St. Martin of Tours Church"],
    content: `The Municipality of Bocaue officially broke ground on the highly anticipated Bocaue River Esplanade Project on February 5, 2026, marking a major milestone in the town's push toward sustainable tourism and urban development.

The project, estimated at ₱85 million in funding from a combination of local government budget and national grants, will transform a 1.2-kilometer stretch along the Bocaue River into a modern waterfront promenade featuring:

• A landscaped walking and jogging path
• Open-air cultural pavilions for local performances and exhibits
• Heritage markers highlighting Bocaue's rich history along the river
• A river-view deck and seating areas for residents and tourists
• Night lighting and safety features for evening strolls

"This esplanade will not only beautify our riverbanks but also give our residents a world-class public space where they can relax, exercise, and celebrate our culture," said Mayor Jonathan Flores during the groundbreaking ceremony.

The project is part of Bocaue's broader Tourism Master Plan 2025–2030, which aims to position the municipality as a top cultural and heritage destination in Bulacan. The MHACTO office has been instrumental in integrating cultural elements into the design, including murals depicting the town's famous Pagoda Festival and the history of firecracker-making.

Construction is expected to take 18 months, with the first phase — covering the main promenade and cultural pavilions — targeted for completion by mid-2027. Local businesses along the riverfront are already expressing excitement about the expected increase in foot traffic.

The Bocaue River Esplanade is set to become a landmark destination, joining the Philippine Arena and St. Martin of Tours Church as must-visit spots in the municipality.`,
    image: asset("/images/places/church-bocaue.jpg"),
    date: "2026-02-06",
    category: "project",
    author: "MHACTO Bocaue",
  },
  {
    id: "pagoda-festival-2026-preparations",
    title: "Bocaue Gears Up for the Grand Pagoda Festival 2026",
    summary:
      "The iconic Cross River Pagoda Festival returns this July with a bigger, more vibrant celebration featuring river processions, cultural performances, and fireworks.",
    description: "Bocaue's centuries-old Pagoda Festival returns bigger and brighter for 2026",
    places: ["Bocaue River", "Municipal Hall", "Historic Barangays"],
    content: `Preparations are well underway for the 2026 edition of Bocaue's world-famous Pagoda Festival, one of the most anticipated religious and cultural events in the Province of Bulacan.

Held every July in honor of the Holy Cross, the Pagoda Festival — locally known as the "Pagoda sa Wawa" — is a centuries-old tradition that draws tens of thousands of devotees and tourists from across the Philippines and abroad. The centerpiece of the celebration is a massive, elaborately decorated pagoda that is floated along the Bocaue River in a spectacular procession.

This year, the Municipal Government and MHACTO have announced an expanded program that includes:

• The grand river procession of the Holy Cross Pagoda on July 4, 2026
• A three-day cultural fair featuring local artisans, food vendors, and live entertainment
• Nightly fireworks displays along the riverbank
• A photography contest open to amateur and professional photographers nationwide
• Heritage walking tours led by MHACTO guides through Bocaue's historic barangays
• A special exhibit on the history of the Pagoda Festival at the Municipal Hall

"The Pagoda Festival is the heart and soul of Bocaue," said MHACTO head Maria Luisa Tan. "Every year, we work to preserve its traditions while making it accessible and exciting for new generations of Filipinos."

The festival is deeply rooted in Bocaue's identity. According to local lore, the tradition began in the 19th century when fishermen found a wooden cross in the Bocaue River and built a floating pagoda to venerate it. Over the decades, the celebration has grown into one of Bulacan's most iconic festivals.

Safety measures, including maritime coordination with the Philippine Coast Guard and crowd management protocols, are already being finalized. The LGU is also coordinating with the Department of Tourism for national and international promotion of the event.

Visitors planning to attend are encouraged to book accommodations early, as hotels and homestays in Bocaue and neighboring towns often sell out during festival week.`,
    image: asset("/images/places/philippine-arena.jpg"),
    date: "2026-01-28",
    category: "festival",
    author: "MHACTO Bocaue",
  },
  {
    id: "barangay-cleanup-drive-2026",
    title: "Bocaue Launches Community-Wide Cleanup and Greening Drive",
    summary:
      "Over 2,000 volunteers join the municipality's largest environmental cleanup initiative, targeting riverbanks, public parks, and schoolyards across 49 barangays.",
    description: "Community-wide environmental initiative mobilizes 2,000 volunteers across all 49 barangays",
    places: ["Bocaue Riverbanks", "Public Parks", "Schoolyards", "All 49 Barangays"],
    content: `In a remarkable show of community spirit, more than 2,000 residents and volunteers participated in Bocaue's biggest-ever cleanup and greening drive on January 20, 2026, covering all 49 barangays simultaneously.

The event, organized by the Municipal Environment and Natural Resources Office (MENRO) in partnership with MHACTO and local barangay councils, aimed to clear waste from public spaces, plant native trees and shrubs, and raise awareness about proper waste management.

Key highlights of the day included:

• 3.5 tons of solid waste collected from riverbanks, drainage canals, and vacant lots
• 500 native tree seedlings planted in parks, schoolyards, and along the Bocaue River
• Free eco-bags distributed to 1,200 households as part of the "Plastic-Free Bocaue" campaign
• Educational booths on composting, recycling, and sustainable living manned by student volunteers

"This is not just about cleaning up — it's about changing mindsets," said MENRO head Engr. Roberto Guevarra. "When people see their neighbors and leaders picking up trash and planting trees, it inspires them to take responsibility for their own environment."

The initiative is part of the municipality's five-year environmental sustainability plan, which targets a 40% reduction in single-use plastic waste by 2030 and aims to increase green cover within the town by 25%.

Several local businesses also contributed by sponsoring cleanup kits, snacks for volunteers, and seedlings. The Bocaue Chamber of Commerce called the event "a model of public-private partnership in environmental stewardship."

MHACTO has announced plans to create a "Green Heritage Trail" connecting the newly planted areas with Bocaue's existing parks and historical sites, further integrating environmental conservation with cultural tourism.

The next community cleanup is scheduled for Earth Day, April 22, 2026, and the LGU is encouraging even more residents to join.`,
    image: asset("/images/places/church-bocaue.jpg"),
    date: "2026-01-22",
    category: "community",
    author: "MHACTO Bocaue",
  },
  {
    id: "bocaue-heritage-mapping-project",
    title: "MHACTO Completes Digital Heritage Mapping of Historic Bocaue",
    summary:
      "A pioneering digital heritage map now catalogs over 120 historical landmarks, ancestral homes, and cultural sites across the municipality for preservation and tourism.",
    description: "Comprehensive digital heritage map documents 120+ historical landmarks and cultural sites",
    places: ["St. Martin of Tours Church", "Historic Ancestral Houses", "Bocaue River Heritage Sites"],
    content: `The Municipal History, Arts, Culture and Tourism Office (MHACTO) has completed a two-year digital heritage mapping project that documents more than 120 historical landmarks, ancestral homes, and cultural sites across Bocaue.

The project, launched in January 2024, involved extensive fieldwork by MHACTO researchers, local historians, and volunteers from Bulacan State University's Department of History. Using GPS mapping, drone photography, and archival research, the team created a comprehensive digital database that is now accessible to the public through the municipality's official website.

The heritage map includes:

• 28 pre-war and colonial-era ancestral houses, many still owned by founding families
• 15 heritage churches and chapels, including the iconic St. Martin of Tours Church
• 32 historical markers and monuments tracing Bocaue's role in the Philippine Revolution
• 18 cultural sites linked to traditional crafts such as firecracker-making and pyrotechnics
• 12 natural heritage sites along the Bocaue River and surrounding wetlands
• Interactive timelines showing how key sites evolved over the centuries

"We realized that many of Bocaue's most important heritage sites were undocumented and at risk of being lost to modernization," explained MHACTO head Maria Luisa Tan. "This map is both a preservation tool and a tourism resource."

The digital map allows users to explore sites by category, era, or location, and features historical photographs, oral histories from long-time residents, and architectural notes. QR codes have been installed at 40 priority sites, allowing visitors to access information on their smartphones during walking tours.

The project has already attracted attention from the National Historical Commission of the Philippines (NHCP), which has expressed interest in using Bocaue's model as a template for other municipalities. The Department of Tourism's Region III office also praised the initiative as "a benchmark for cultural tourism planning in Central Luzon."

MHACTO plans to expand the map with augmented reality features by 2027, allowing visitors to see historical overlays of how sites looked in different eras using their mobile devices.`,
    image: asset("/images/places/philippine-arena.jpg"),
    date: "2026-01-15",
    category: "project",
    author: "MHACTO Bocaue",
  },
  {
    id: "bocaue-fiesta-ng-kabataan-2026",
    title: "Fiesta ng Kabataan 2026: Youth Talents Take Center Stage in Bocaue",
    summary:
      "Hundreds of young Bocaueños showcase their talents in music, dance, visual arts, and spoken word at the annual Fiesta ng Kabataan youth festival.",
    description: "A vibrant celebration of youth creativity and talent across music, dance, and visual arts",
    places: ["Municipal Covered Court", "Town Plaza", "Bocaue Public Library"],
    content: `The streets and plazas of Bocaue came alive with youthful energy as the municipality hosted the 5th annual Fiesta ng Kabataan on January 10–12, 2026, a three-day celebration of the arts, creativity, and the talents of Bocaue's young generation.

Organized by the Sangguniang Kabataan (SK) Federation in partnership with MHACTO, the festival featured competitions and performances in music, dance, visual arts, spoken word poetry, and short film. Over 350 participants aged 15 to 24 from all 49 barangays took part.

Highlights of the festival included:

• A Battle of the Bands competition at the Municipal Covered Court, won by local indie act "Tala Express"
• A contemporary dance showcase featuring fusion of traditional Filipino folk dance with modern choreography
• A mural-painting contest where teams transformed a 50-meter wall along the river promenade
• A spoken-word poetry slam in Filipino and English, addressing themes of identity, community, and hope
• Short film screenings at the Bocaue Public Library, with an audience choice award

"Fiesta ng Kabataan proves that our young people are not just the future — they are shaping our community right now," said SK Federation President Alyssa Manalo. "This festival gives them a platform to express themselves and connect with each other."

The mural-painting contest was a particular crowd favorite, with the winning team creating a vibrant piece depicting Bocaue's history from the Spanish colonial period to the present day. The mural will be preserved as a permanent public art installation.

MHACTO also used the festival to launch its Youth Cultural Ambassador Program, which will train 30 young Bocaueños to serve as heritage tour guides and cultural advocates throughout the year. Selected ambassadors will undergo workshops on local history, public speaking, and community engagement.

The event closed with a free open-air concert at the town plaza, featuring performances by festival winners and guest artists. Plans for Fiesta ng Kabataan 2027 are already in the works, with organizers hoping to expand the program to include digital arts and game design competitions.`,
    image: asset("/images/places/church-bocaue.jpg"),
    date: "2026-01-12",
    category: "festival",
    author: "MHACTO Bocaue",
  },
  {
    id: "bocaue-livelihood-training-program",
    title: "Free Livelihood Training Opens Doors for 500 Bocaue Residents",
    summary:
      "The LGU partners with TESDA and local businesses to offer free skills training in culinary arts, digital marketing, welding, and crafts to help residents boost their income.",
    description: "Free TESDA-certified skills training in culinary arts, digital marketing, welding, and handicrafts",
    places: ["Municipal Hall", "Barangay Offices"],
    content: `Five hundred residents of Bocaue are set to benefit from a comprehensive livelihood training program launched on January 5, 2026, through a partnership between the Municipal Government, the Technical Education and Skills Development Authority (TESDA), and several local businesses.

The program offers free certification courses in four high-demand skills tracks:

• Culinary Arts and Food Processing — covering traditional Bulacan delicacies, modern baking, and food safety standards
• Digital Marketing and E-Commerce — teaching social media management, product photography, and online selling platforms
• Welding and Metal Fabrication — providing TESDA NC II certification for employment in construction and manufacturing
• Handicrafts and Artisan Products — focusing on parol-making, paper crafts, and decorative pyrotechnics (non-explosive)

Each track runs for 8 to 12 weeks with both classroom instruction and hands-on apprenticeships. Graduates receive TESDA National Certificates and job placement assistance through the Public Employment Service Office (PESO).

"We want to make sure that every Bocaueño has access to skills that can improve their livelihood," said Municipal Livelihood Officer Elena Pascual. "These courses are designed based on actual market demand, so graduates have real opportunities waiting for them."

The culinary arts track has been particularly popular, with many enrollees eager to learn how to produce and market Bocaue's traditional pastillas, ensaymada, and other Bulacan delicacies for online selling. Several local food businesses have volunteered as apprenticeship hosts.

MHACTO is collaborating on the handicrafts track, integrating cultural heritage education so that participants learn not only the craft skills but also the history and significance of Bocaue's artisan traditions. The parol-making module, for instance, includes sessions on the evolution of the Christmas lantern in Bulacan and its cultural importance.

Enrollment is ongoing at the Municipal Hall and barangay offices. Priority is given to out-of-school youth, solo parents, senior citizens, and persons with disabilities. The LGU has allocated ₱4.2 million in funding for the program and plans to offer additional batches later in the year based on demand.`,
    image: asset("/images/places/philippine-arena.jpg"),
    date: "2026-01-07",
    category: "community",
    author: "MHACTO Bocaue",
  },
]
