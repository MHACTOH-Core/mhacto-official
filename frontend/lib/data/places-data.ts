import { asset } from "@/lib/utils"

export type PlaceCategory =
  | "heritage"
  | "nature"
  | "festival"
  | "arts"
  | "cuisine"
  | "landmark"

export interface Place {
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
}

export const categoryLabels: Record<PlaceCategory, string> = {
  heritage: "Temple & Heritage",
  nature: "Nature",
  festival: "Festival",
  arts: "Arts & Culture",
  cuisine: "Cuisine",
  landmark: "Landmark",
}

export const attractions: Place[] = [
  {
    id: "philippine-arena",
    title: "Philippine Arena",
    description:
      "The world's largest indoor arena, a marvel of modern architecture located right in Bocaue.",
    image: asset("/images/places/philippine-arena.jpg"),
    fullDescription:
      "The Philippine Arena is the world's largest indoor arena, capable of seating up to 55,000 people. This architectural marvel stands as a testament to modern engineering and Filipino excellence. Located in Bocaue, Bulacan, it hosts major concerts, sports events, and cultural celebrations.",
    story:
      "The idea for the Philippine Arena was born out of a vision to build the world's largest domed arena as a centerpiece for the centennial celebration of the Iglesia ni Cristo in 2014. Construction began in 2011 under the design of the Brazilian architectural firm Populous, in collaboration with Filipino engineers. Spanning over 74,000 square meters of floor area, the arena rose from the flatlands of Ciudad de Victoria in Bocaue. Thousands of workers labored for three years, and on July 21, 2014, the Philippine Arena was inaugurated before a crowd of over 50,000. Guinness World Records officially recognized it as the largest mixed-use indoor theater, a title it still holds today. Since then, it has hosted historic concerts, international boxing matches, and national celebrations, becoming an enduring symbol of Filipino ambition and world-class craftsmanship.",
    location: "Ciudad de Victoria, Bocaue, Bulacan",
    hours: "Open during events — Check schedule",
    contact: "Contact venue for event schedules",
    category: "landmark",
    established: "July 21, 2014",
    highlights: [
      "Guinness World Record holder — largest indoor arena",
      "55,000 seating capacity",
      "Hosts international concerts, sports, and national events",
      "Designed by Populous (Brazil) with Filipino engineers",
    ],
  },
  {
    id: "st-martin-church",
    title: "St. Martin of Tours Church",
    description:
      "A historic Spanish-era church reflecting centuries of faith and Filipino heritage.",
    image: asset("/images/places/church-bocaue.jpg"),
    fullDescription:
      "St. Martin of Tours Church is a historic Spanish-era church that has stood for centuries as a symbol of faith and Filipino heritage. Built during the colonial period, this beautiful church features classic Spanish architecture with intricate details.",
    story:
      "The parish of Bocaue was established by the Augustinian friars in the early 1600s, and the first humble chapel made of bamboo and nipa was raised beside the Bocaue River. As the town grew, so did the need for a sturdier house of worship. By the mid-1700s, a stone church was erected under the patronage of St. Martin of Tours, the beloved 4th-century bishop known for sharing his cloak with a beggar. The church survived earthquakes, typhoons, and the devastation of World War II. Its Baroque façade, hand-carved retablos, and centuries-old wooden santos narrate a living history of devotion. Every November 11, the town celebrates its patron saint with a grand fiesta. The church also serves as the spiritual anchor of the Bocaue River Festival — the pagoda procession on the river traces its origins to a miraculous story of a cross found floating on the water in the 18th century, drawing pilgrims from far and wide.",
    location: "Bocaue Town Center, Bulacan",
    hours: "Daily: 6:00 AM – 8:00 PM",
    contact: "(044) 123-4567",
    category: "heritage",
    established: "circa 1609",
    highlights: [
      "One of the oldest parishes in Bulacan",
      "Baroque-style stone church with hand-carved retablos",
      "Patron saint: St. Martin of Tours (feast day: November 11)",
      "Spiritual center of the Bocaue River Festival",
    ],
  },
  {
    id: "bocaue-river-festival",
    title: "Bocaue River Festival",
    description:
      "A vibrant annual celebration featuring the iconic fluvial parade along the river.",
    image: asset("/images/places/river-festival.jpg"),
    fullDescription:
      "The Bocaue River Festival is an annual religious and cultural celebration held every July. The highlight is the spectacular fluvial parade where beautifully decorated boats carry the image of the Holy Cross along the Bocaue River.",
    story:
      "The Bocaue River Festival — also called the Pagoda sa Wawa — traces its origins to the year 1787. Legend tells that a fisherman discovered a small wooden cross floating in the Bocaue River. Believing it to be miraculous, the townspeople enshrined it and began an annual fluvial procession in its honor. Over the centuries, devotees would build an ornate pagoda — a towering bamboo-and-cloth float — and place the Holy Cross atop it, then row it along the river accompanied by hundreds of boats, music, and prayers. The festival was not without tragedy: in 1993, a pagoda collapsed mid-river, claiming many lives. Rather than abandon the tradition, Bocaueños rebuilt with greater resolve, implementing safety reforms while preserving the spiritual heart of the celebration. Today, the River Festival is a week-long affair featuring a solemn novena, cultural shows, street dancing, beauty pageants, cook-offs, and the breathtaking fluvial parade itself — drawing thousands of visitors and media attention every July.",
    location: "Bocaue River, Bulacan",
    hours: "Annual event — First week of July",
    contact: "Municipal Tourism Office",
    category: "festival",
    established: "1787",
    highlights: [
      "Over 235 years of tradition",
      "Iconic pagoda fluvial procession along the river",
      "Week-long festivities with street dancing and cultural shows",
      "One of the most significant religious festivals in Bulacan",
    ],
  },
  {
    id: "local-delicacies",
    title: "Bocaue Chicharon & Kakanin",
    description:
      "Taste authentic Bulacan cuisine from traditional kakanin to the legendary crispy chicharon.",
    image: asset("/images/places/local-delicacies.jpg"),
    fullDescription:
      "Bocaue is famous for its authentic Bulacan cuisine, particularly its traditional kakanin (rice cakes) and crispy chicharon. Local delicacies include suman, bibingka, puto, and the renowned Bocaue chicharon.",
    story:
      "Long before Bocaue became known for its arena or its pagoda, it was already famous for one thing: food. The town's culinary legacy stretches back to the pre-colonial era, when indigenous communities along the river prepared rice cakes (kakanin) as offerings during harvest festivals. Suman wrapped in banana leaves, bibingka baked over charcoal, and colorful puto became staples of every celebration. But it was the chicharon — deep-fried pork rind — that would put Bocaue on the national food map. In the mid-1900s, home-based chicharon makers along the main highway began selling to passing travelers. Word spread, and by the 1970s and '80s, an entire chicharon industry flourished, with families perfecting recipes handed down across generations. The secret lies in a slow double-fry process and careful seasoning that gives Bocaue chicharon its trademark airy crunch and rich flavor. Today, dozens of producers line the road, and Bocaue's kakanin and chicharon are sought after across the Philippines — a delicious piece of heritage you can taste.",
    location: "Various locations along MacArthur Highway, Bocaue",
    hours: "Varies by establishment — typically 7:00 AM – 7:00 PM",
    contact: "Local vendors and markets",
    category: "cuisine",
    established: "Pre-colonial origins, commercialized mid-1900s",
    highlights: [
      "Bocaue chicharon — famous nationwide for its crunch",
      "Traditional kakanin: suman, bibingka, puto, and more",
      "Family recipes passed down for generations",
      "Lined along MacArthur Highway for easy access",
    ],
  },
  {
    id: "bocaue-river-walk",
    title: "Bocaue Riverbank & Nature Walk",
    description:
      "A scenic walk along the historic Bocaue River, where nature meets centuries of town history.",
    image: asset("/images/heroes/hero-bocaue.jpg"),
    fullDescription:
      "The Bocaue Riverbank offers a tranquil escape from city life. Walk along the shaded pathways beside the river that has shaped the town's identity for centuries, from fishing and trade to religious processions.",
    story:
      "The Bocaue River (Wawa ng Bocaue) has been the lifeblood of the town since its earliest days. Centuries ago, it served as the main artery for trade between the inland communities of Bulacan and Manila Bay. Fishermen cast their nets at dawn, and bancas carried goods to market. The river also attracted Spanish missionaries, who established the parish along its banks. Over time, the riverbanks became the natural gathering place for the community — children played by the water, women washed clothes on the stones, and the annual pagoda procession turned the river into a floating cathedral. In recent years, local government initiatives have beautified sections of the riverbank with walking paths, benches, and native plantings, making it an accessible nature walk where visitors can enjoy birdwatching, photography, and the peaceful sound of flowing water. Early mornings reward walkers with mist rising off the river and the sight of herons fishing in the shallows — a reminder that even in a rapidly modernizing town, nature endures.",
    location: "Along Bocaue River, accessible from Town Center",
    hours: "Open daily — best visited at sunrise or late afternoon",
    contact: "Municipal Tourism Office",
    category: "nature",
    established: "Ongoing — river walkway improvements since 2018",
    highlights: [
      "Scenic shaded paths along the historic river",
      "Birdwatching opportunities (herons, kingfishers)",
      "Photography-friendly sunrise and sunset views",
      "Connected to the town's cultural and religious history",
    ],
  },
  {
    id: "bocaue-artisan-crafts",
    title: "Bocaue Artisan Crafts & Fireworks",
    description:
      "Discover the art of handmade fireworks and traditional crafts that have defined Bocaue for generations.",
    image: asset("/images/places/fireworks.jpg"),
    fullDescription:
      "Bocaue has a long tradition of artisan craftsmanship, most notably in pyrotechnics (fireworks making) and handmade crafts. The town's skilled artisans have been creating fireworks for festivals and celebrations for centuries.",
    story:
      "Bocaue's reputation as the fireworks capital of the Philippines dates back to the Spanish colonial era, when Chinese-Filipino craftsmen introduced gunpowder-based pyrotechnics to Bulacan. By the late 1800s, Bocaue families had mastered the art of creating elaborate fireworks — from simple sparklers to towering cascadas and thundering aerial shells. The craft was passed from parent to child in backyard workshops, where raw materials like potassium nitrate, sulfur, and charcoal were carefully measured and packed by hand. Fireworks from Bocaue became the go-to choice for town fiestas, New Year celebrations, and national holidays across the country. Alongside pyrotechnics, local artisans also produced intricate parol (Christmas lanterns), woven bamboo goods, and hand-painted signage. While modern safety regulations have shaped the industry, the artisan spirit remains alive. Today, visitors can tour licensed workshops to witness the meticulous process of creating fireworks and learn about the cultural significance of light and celebration in Filipino life.",
    location: "Barangay Lolomboy and surrounding areas, Bocaue",
    hours: "Workshop tours by appointment — peak season: November to January",
    contact: "Municipal Tourism Office / Licensed manufacturers",
    category: "arts",
    established: "Late 1800s (Spanish colonial era)",
    highlights: [
      "Known as the Fireworks Capital of the Philippines",
      "Centuries-old family pyrotechnic traditions",
      "Licensed workshop tours available",
      "Parol (lantern) and bamboo craft traditions",
    ],
  },
  {
    id: "old-town-plaza",
    title: "Bocaue Old Town Plaza",
    description:
      "The historic heart of the town — a tree-lined plaza that has witnessed centuries of community life.",
    image: asset("/images/places/oldtownbocaue.jpg"),
    fullDescription:
      "The Bocaue Old Town Plaza sits at the center of the town, adjacent to St. Martin of Tours Church. This public square has served as a gathering place for rest, celebrations, and civic life since the Spanish colonial period.",
    story:
      "Like every Spanish-colonial town in the Philippines, Bocaue was organized around a central plaza — a public square where church, government, and community life converged. The Bocaue Old Town Plaza was laid out in the 1700s following the Leyes de Indias (Laws of the Indies), which mandated that town centers feature a rectangular open space flanked by the church, the municipal hall, and prominent residences. For over two centuries, the plaza has been the stage for everything: religious processions, political rallies, market days, band concerts, and children's games. Ancient acacia and mango trees provide shade, and a central gazebo (kiosko) has hosted countless community events. During the Philippine Revolution of 1896, the plaza saw gatherings of Katipuneros who would go on to fight for independence. During the American and Japanese occupations, it served as both a refuge and a battleground. Today, the restored plaza is a quiet oasis in the town center — perfect for an afternoon stroll, people-watching, or simply sitting beneath the trees and imagining the centuries of stories these grounds have witnessed.",
    location: "Adjacent to St. Martin of Tours Church, Town Center",
    hours: "Open 24 hours — best visited mornings and late afternoons",
    contact: "Municipal Tourism Office",
    category: "heritage",
    established: "circa 1700s",
    highlights: [
      "Historic Spanish-colonial town square",
      "Century-old acacia and mango trees",
      "Site of Philippine Revolution gatherings",
      "Adjacent to St. Martin of Tours Church",
    ],
  },
  {
    id: "ciudad-de-victoria",
    title: "Ciudad de Victoria",
    description:
      "A sprawling mixed-use development that is home to the Philippine Arena, Sports Stadium, and cultural venues.",
    image: asset("/images/places/philippine-arena.jpg"),
    fullDescription:
      "Ciudad de Victoria is a 140-hectare master-planned development straddling the border of Bocaue and Santa Maria. It houses the Philippine Arena, the Philippine Sports Stadium, an aquatic center, and various commercial and residential facilities.",
    story:
      "Ciudad de Victoria — the City of Victory — began as a grand vision of the Iglesia ni Cristo to build a world-class complex in time for their centennial celebration in 2014. What was once idle farmland and fishponds on the outskirts of Bocaue was transformed into one of the most ambitious development projects in the Philippines. Construction started in 2011 with the Philippine Arena as its crown jewel, but the masterplan extended far beyond a single structure. The Philippine Sports Stadium (the world's largest far-field outdoor stadium with a 25,000 capacity) rose alongside it, followed by an Olympic-grade aquatic center, a landscaped memorial garden, and commercial districts. The development has become a major economic driver for Bocaue and neighboring towns, creating thousands of jobs and drawing national and international visitors. For tourists, Ciudad de Victoria offers a unique experience — from attending world-class events at the arena to strolling through the manicured grounds and appreciating the sheer scale of a development that put Bocaue on the global map.",
    location: "Bocaue–Santa Maria boundary, Bulacan",
    hours: "Open daily — event schedules vary",
    contact: "Ciudad de Victoria Administration",
    category: "landmark",
    established: "2014",
    highlights: [
      "140-hectare master-planned complex",
      "Home to the Philippine Arena and Sports Stadium",
      "Olympic-grade aquatic center",
      "Major economic and tourism driver for the region",
    ],
  },
]

export interface EventItem {
  id: string
  title: string
  description: string
  date: Date
  location?: string
  image?: string
  isSpotlight?: boolean
}

// Featured events (for announcements) + sample calendar events (past & future)
function createDate(year: number, month: number, day: number) {
  return new Date(year, month - 1, day)
}

export const featuredEvents: EventItem[] = [
  {
    id: "river-festival-2026",
    title: "The Iconic Pagoda Festival 2026",
    description:
      "Witness the grandeur of Bocaue's most beloved tradition! The legendary Pagoda sa Wawa fluvial parade returns this July with centuries-old spiritual ceremonies, the iconic towering bamboo-and-cloth pagoda, spectacular boat processions, cultural performances, and fireworks lighting up the historic Bocaue River. Join thousands of devotees and visitors as we celebrate faith, tradition, and community resilience.",
    date: createDate(2026, 7, 3),
    location: "Bocaue River & Town Center",
    image: asset("/images/places/river-festival.jpg"),
    isSpotlight: true,
  },
  {
    id: "river-festival-2025",
    title: "Bocaue River Festival 2025",
    description:
      "Join the iconic fluvial parade and cultural festivities along the Bocaue River. A week-long celebration of faith and tradition.",
    date: createDate(2025, 7, 4),
    location: "Bocaue River",
    image: asset("/images/places/river-festival.jpg"),
  },
  {
    id: "arena-concert",
    title: "Philippine Arena Grand Concert",
    description:
      "Experience world-class entertainment at the largest indoor arena. Special performances and cultural shows.",
    date: createDate(2025, 3, 15),
    location: "Philippine Arena",
    image: asset("/images/places/philippine-arena.jpg"),
  },
  {
    id: "heritage-walk",
    title: "Bocaue Heritage Walk",
    description:
      "Guided tour of historic sites including St. Martin of Tours Church and old town plazas.",
    date: createDate(2025, 4, 20),
    location: "Town Center",
  },
]

// All events for calendar (past and future)
export const allEvents: EventItem[] = [
  ...featuredEvents,
  {
    id: "food-fest-jan",
    title: "Bulacan Food Festival",
    description: "Local kakanin and chicharon showcase.",
    date: createDate(2025, 1, 18),
    location: "Bocaue Town Plaza",
  },
  {
    id: "church-fiesta",
    title: "St. Martin Parish Fiesta",
    description: "Annual parish celebration with processions and bazaar.",
    date: createDate(2025, 11, 11),
    location: "St. Martin of Tours Church",
  },
  {
    id: "past-river-2024",
    title: "Bocaue River Festival 2024",
    description: "Annual fluvial parade (past event).",
    date: createDate(2024, 7, 4),
    location: "Bocaue River",
  },
  {
    id: "past-arena-dec",
    title: "Year-End Arena Event",
    description: "Holiday special at Philippine Arena.",
    date: createDate(2024, 12, 28),
    location: "Philippine Arena",
  },
]

export function getUpcomingEvents(relativeTo: Date = new Date()): EventItem[] {
  return allEvents
    .filter((e) => e.date >= relativeTo)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}

export function getPastEvents(relativeTo: Date = new Date()): EventItem[] {
  return allEvents
    .filter((e) => e.date < relativeTo)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
}

export function getEventDates(): Date[] {
  return allEvents.map((e) => e.date)
}

export function getSpotlightEvent(): EventItem | undefined {
  return featuredEvents.find((e) => e.isSpotlight)
}

export function getCategories(): PlaceCategory[] {
  const cats = new Set(attractions.map((a) => a.category))
  return Array.from(cats)
}

export function getAttractionsByCategory(
  category?: PlaceCategory | "all"
): Place[] {
  if (!category || category === "all") return [...attractions]
  return attractions.filter((a) => a.category === category)
}
