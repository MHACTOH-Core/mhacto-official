import { asset } from "@/lib/utils"

// ── Heritage Sites ───────────────────────────────────────────────────
export interface HeritageSite {
  id: string
  name: string
  established: string
  category: "church" | "monument" | "building" | "streetscape" | "bridge"
  description: string
  story: string
  location: string
  hours: string
  highlights: string[]
  image: string
  isProtected: boolean
  protectionLevel?: string
}

export const heritageSites: HeritageSite[] = [
  {
    id: "st-martin-church",
    name: "St. Martin of Tours Parish Church",
    established: "1609",
    category: "church",
    description:
      "One of the oldest Augustinian parishes in Bulacan, featuring a Spanish Baroque stone facade, centuries-old retablos, and priceless colonial-era religious artifacts.",
    story:
      "The parish of Bocaue was established by Augustinian missionaries around 1609, making it one of the oldest in Bulacan province. The current stone church, rebuilt after multiple earthquake damages in the 18th and 19th centuries, stands as a testament to the enduring faith of Bocaueños. Its Baroque façade features twin bell towers, ornate carved stonework, and original wooden retablos painted in gold leaf. The church houses several colonial-era santos and sacred vessels that have survived centuries of upheaval. It remains an active parish today, with Sunday masses attended by thousands.",
    location: "Bocaue Town Center, beside the Public Plaza",
    hours: "Monday–Sunday: 5:30 AM – 8:00 PM (open during mass schedules)",
    highlights: [
      "Spanish Baroque stone facade circa 1850",
      "Hand-carved golden retablo in the main altar",
      "Colonial-era santos and religious artifacts",
      "Twin bell towers with original 19th-century bells",
      "Site of the annual Pagoda Festival mass",
    ],
    image: asset("/images/places/Church.jpg"),
    isProtected: true,
    protectionLevel: "National Cultural Treasure (proposed)",
  },
  {
    id: "bocaue-town-plaza",
    name: "Bocaue Plaza & Jose Corazon de Jesus Monument",
    established: "c. 1850",
    category: "monument",
    description:
      "The historic town plaza at the heart of Bocaue, anchored by the monument to national poet Jose Corazon de Jesus ('Huseng Batute'), a native son of Bocaue.",
    story:
      "The Bocaue town plaza has served as the civic and social heart of the municipality for over 150 years. Surrounding the kiosk and open green, it has witnessed colonial-era fiestas, revolutionary assemblies, American-period civic programs, and modern celebrations. The monument to Jose Corazon de Jesus — erected in the mid-20th century to honor Bocaue's most celebrated literary son — stands at the plaza's center. Bocaueños gather here for Independence Day programs, New Year's countdowns, and the street fairs of the November fiesta.",
    location: "Rizal Avenue, Bocaue Town Center",
    hours: "Open 24 hours (best visited in early morning or evening)",
    highlights: [
      "Monument to poet Jose Corazon de Jesus",
      "Historic kiosk used for civic performances",
      "Open-air venue for festivals and cultural programs",
      "Surrounded by heritage-era buildings",
    ],
    image: asset("/images/places/oldtownbocaue.jpg"),
    isProtected: true,
    protectionLevel: "Municipal Heritage Site",
  },
  {
    id: "old-bocaue-bridge",
    name: "Historic Bocaue River Bridge",
    established: "c. 1920s",
    category: "bridge",
    description:
      "The old stone and steel bridge spanning the Bocaue River, a built landmark that has witnessed over a century of community life and the annual Pagoda Festival river procession.",
    story:
      "The Bocaue River Bridge was constructed during the American colonial period to replace an earlier wooden crossing. Its steel-and-concrete arches have carried generations of Bocaueños, and its banks serve as prime viewing locations for the annual Pagoda Festival fluvial procession each August. The bridge and the riverbank promenade are currently being enhanced as part of the Bocaue River Esplanade Project, which will add cultural pavilions, heritage markers, and waterfront gardens.",
    location: "National Highway, spanning the Bocaue River",
    hours: "Open 24 hours",
    highlights: [
      "Prime viewing point for the Pagoda Festival river procession",
      "Part of the Bocaue River Esplanade development project",
      "Photography landmark at sunset",
    ],
    image: asset("/images/places/river-festival.jpg"),
    isProtected: false,
  },
  {
    id: "old-municipal-hall",
    name: "Old Municipal Hall of Bocaue",
    established: "1920s",
    category: "building",
    description:
      "The original Bocaue Municipal Hall — an American-era public building whose architecture reflects the colonial civic administration style of the early 20th century.",
    story:
      "Constructed during the American colonial administration of the 1920s, the old Municipal Hall of Bocaue served as the seat of local governance for over six decades. Its simple neoclassical facade with wide verandas and louvered windows exemplifies the pragmatic public architecture of the American period. Today the building houses a museum annex and community archive maintained by the MHACTO office, preserving historical documents, photographs, and civic records dating back to the Spanish period.",
    location: "Bocaue Town Center, near the plaza",
    hours: "Monday–Friday: 8:00 AM – 5:00 PM",
    highlights: [
      "American-colonial neoclassical civic architecture",
      "MHACTO community archive and photo gallery",
      "Original municipal records dating to the Spanish period",
    ],
    image: asset("/images/places/oldtownbocaue.jpg"),
    isProtected: true,
    protectionLevel: "Municipal Heritage Site",
  },
]

// ── Museums ──────────────────────────────────────────────────────────
export interface Museum {
  id: string
  name: string
  type: "history" | "art" | "natural" | "house"
  description: string
  collections: string[]
  location: string
  hours: string
  admission: string
  contact?: string
  image: string
}

export const museums: Museum[] = [
  {
    id: "mhacto-gallery",
    name: "MHACTO Heritage Gallery",
    type: "history",
    description:
      "A small but thoughtfully curated gallery inside the Old Municipal Hall, showcasing Bocaue's history from pre-colonial times to the present through photographs, artifacts, and documents.",
    collections: [
      "Pre-colonial earthenware and implements",
      "Spanish-era religious artifacts and documents",
      "Philippine Revolution memorabilia and photographs",
      "American-period civic and school records",
      "20th-century Bocaue fireworks industry artifacts",
      "Jose Corazon de Jesus original manuscripts (facsimile)",
    ],
    location: "Old Municipal Hall, Bocaue Town Center",
    hours: "Monday–Friday: 8:00 AM – 5:00 PM; Saturday: 9:00 AM – 1:00 PM",
    admission: "Free (donations welcome)",
    contact: "MHACTO Office, Bocaue Municipal Hall",
    image: asset("/images/places/oldtownbocaue.jpg"),
  },
  {
    id: "pagoda-festival-museum",
    name: "Pagoda Festival Museum",
    type: "art",
    description:
      "Dedicated to the history and artistry of the Bocaue Pagoda Festival, featuring antique pagoda models, vintage photographs of the river procession, and festival costumes.",
    collections: [
      "Scale models of historic pagoda barges",
      "Vintage photographs of the river festival (1920s–present)",
      "Traditional festival costumes and regalia",
      "Devotional objects associated with the Holy Cross of Wawa",
      "Recorded oral histories of festival participants",
    ],
    location: "Near St. Martin of Tours Church, Bocaue Town Center",
    hours: "Tuesday–Sunday: 9:00 AM – 5:00 PM",
    admission: "₱30 per person; students free with ID",
    image: asset("/images/places/river-festival.jpg"),
  },
  {
    id: "philippine-arena-visitor-center",
    name: "Philippine Arena Visitor Center",
    type: "art",
    description:
      "The official visitor and interpretation center for the Philippine Arena, showcasing the architectural achievement, construction history, and record-breaking milestones of the world's largest indoor arena.",
    collections: [
      "Architectural models and drawings of the Arena",
      "Guinness World Record memorabilia",
      "Construction timeline and photographs",
      "Interactive displays on acoustic and structural engineering",
      "Event memorabilia from major performances",
    ],
    location: "Ciudad de Victoria Complex, Bocaue",
    hours: "Daily: 8:00 AM – 5:00 PM (access subject to scheduled events)",
    admission: "₱100 per person; guided tours available",
    contact: "Philippine Arena Administration Office",
    image: asset("/images/places/philippine-arena.jpg"),
  },
]

// ── Religious Sites ──────────────────────────────────────────────────
export interface ReligiousSite {
  id: string
  name: string
  denomination: string
  established: string
  description: string
  significance: string
  location: string
  hours: string
  highlights: string[]
  image: string
}

export const religiousSites: ReligiousSite[] = [
  {
    id: "st-martin-parish",
    name: "St. Martin of Tours Parish Church",
    denomination: "Roman Catholic",
    established: "1609",
    description:
      "Bocaue's mother church and most spiritually significant site — a 400-year-old Augustinian parish at the heart of the town.",
    significance:
      "As the oldest and most historically significant religious site in Bocaue, St. Martin of Tours Parish is more than a place of worship — it is the spiritual biography of the town itself. Every major milestone in Bocaue's history, from Spanish colonization to the Revolution to post-war reconstruction, has been reflected in and witnessed by this church. The Pagoda Festival, declared a national cultural tradition, originates from this parish. Pilgrims from across Bulacan and beyond regularly visit to pray at the main altar and the side chapel of the miraculous Cross of Wawa.",
    location: "Rizal Avenue, Bocaue Town Center",
    hours: "Daily: 5:30 AM – 8:00 PM",
    highlights: [
      "Miraculous Holy Cross of Wawa — patronal image of the Pagoda Festival",
      "Colonial-era golden retablo with hand-carved saints",
      "One of the oldest Augustinian parishes in Bulacan",
      "Active parish with daily masses",
      "Spiritual anchor of the annual Pagoda Festival",
    ],
    image: asset("/images/places/Church.jpg"),
  },
  {
    id: "iglesia-ni-cristo-central-arena",
    name: "Iglesia ni Cristo Central Temple",
    denomination: "Iglesia ni Cristo",
    established: "2014",
    description:
      "The central spiritual and cultural complex of the Iglesia ni Cristo, located in Ciudad de Victoria and anchored by the world-record-holding Philippine Arena.",
    significance:
      "The Ciudad de Victoria complex in Bocaue serves as the global headquarters of the Iglesia ni Cristo, one of the Philippines' largest homegrown Christian denominations. The complex includes the Philippine Arena — the world's largest indoor arena — as well as chapels, schools, and civic facilities serving the INC community. The inauguration of the Arena in 2014 marked the INC's centenniall and drew global attention to Bocaue.",
    location: "Ciudad de Victoria, Bocaue, Bulacan",
    hours: "Open to INC members; public access to arena during events",
    highlights: [
      "Part of the world's largest indoor arena complex",
      "Architecturally striking chapel design",
      "Center of the INC centennial celebrations of 2014",
    ],
    image: asset("/images/places/philippine-arena.jpg"),
  },
  {
    id: "holy-cross-shrine",
    name: "Shrine of the Holy Cross of Wawa",
    denomination: "Roman Catholic",
    established: "18th century",
    description:
      "A riverbank chapel and shrine housing the miraculous Holy Cross of Wawa — the sacred image at the center of the Bocaue Pagoda Festival tradition.",
    significance:
      "The Shrine of the Holy Cross of Wawa is woven into the founding miracle of the Pagoda Festival. According to tradition, the cross was found floating miraculously on the Bocaue River in the 18th century, and the site of its recovery became a place of veneration. The small riverside chapel and its surroundings are visited year-round by pilgrims seeking healing and intercession, and the holy cross itself is paraded on the river each August during the Pagoda Festival, drawing tens of thousands.",
    location: "Wawa barangay, along the Bocaue River",
    hours: "Daily: 6:00 AM – 6:00 PM",
    highlights: [
      "Original site of the miraculous cross discovery",
      "Year-round pilgrimage destination",
      "Focus of the Pagoda Festival procession each August",
      "Small chapel with votive offerings from devotees",
    ],
    image: asset("/images/places/river-festival.jpg"),
  },
]

// ── Travel & Tours ───────────────────────────────────────────────────
export interface TourPackage {
  id: string
  name: string
  duration: string
  type: "heritage" | "food" | "festival" | "nature" | "custom"
  difficulty: "easy" | "moderate" | "active"
  groupSize: string
  price: string
  description: string
  itinerary: { time: string; activity: string }[]
  includes: string[]
  highlights: string[]
  image: string
  bookingContact: string
}

export const tourPackages: TourPackage[] = [
  {
    id: "heritage-day-tour",
    name: "Bocaue Heritage Day Tour",
    duration: "Full Day (8 hours)",
    type: "heritage",
    difficulty: "easy",
    groupSize: "2–30 persons",
    price: "₱750 per person (minimum 10 pax)",
    description:
      "A guided walking and jeepney tour through Bocaue's heritage sites, including the St. Martin of Tours Church, the historic plaza, the MHACTO Heritage Gallery, and the Bocaue River waterfront.",
    itinerary: [
      { time: "8:00 AM", activity: "Meet at Bocaue Municipal Hall; welcome briefing by MHACTO guide" },
      { time: "8:30 AM", activity: "Guided tour of St. Martin of Tours Parish Church & Shrine of the Holy Cross" },
      { time: "10:00 AM", activity: "Visit to MHACTO Heritage Gallery & Old Municipal Hall archive" },
      { time: "11:30 AM", activity: "Bocaue Town Plaza walk & Jose Corazon de Jesus Monument" },
      { time: "12:30 PM", activity: "Traditional lunch at a heritage-style restaurant (own expense)" },
      { time: "2:00 PM", activity: "Bocaue River waterfront walk and pagoda procession route tour" },
      { time: "3:30 PM", activity: "Visit to a local artisan workshop (weaving or woodcarving)" },
      { time: "5:00 PM", activity: "Tour ends. Optional pasalubong shopping at local market stalls." },
    ],
    includes: [
      "Licensed MHACTO heritage guide",
      "Church and gallery entrance fees",
      "Welcome snack (puto seko and native drinks)",
      "Souvenir heritage map of Bocaue",
    ],
    highlights: [
      "400-year-old St. Martin of Tours Church",
      "Access to the MHACTO Heritage Gallery",
      "Bocaue River waterfront with pagoda route",
      "Live artisan workshop visit",
    ],
    image: asset("/images/places/Church.jpg"),
    bookingContact: "MHACTO Office: (044) 123-4567 | mhacto.bocaue@email.com",
  },
  {
    id: "pagoda-festival-immersion",
    name: "Pagoda Festival Immersion Package",
    duration: "2 Days / 1 Night (August festival weekend)",
    type: "festival",
    difficulty: "active",
    groupSize: "4–20 persons",
    price: "₱2,500 per person (includes accommodation)",
    description:
      "An all-inclusive festival experience package for the annual Bocaue Pagoda Festival — including riverside viewing area access, the solemn mass, street fair access, and a post-festival heritage tour.",
    itinerary: [
      { time: "Day 1, 4:00 PM", activity: "Arrive in Bocaue; check-in at partner accommodation; town orientation walk" },
      { time: "Day 1, 6:00 PM", activity: "Bocaue River pre-festival program & street fair" },
      { time: "Day 1, 8:00 PM", activity: "Fireworks display at the river; communal dinner" },
      { time: "Day 2, 7:00 AM", activity: "Solemn high mass at St. Martin of Tours Church" },
      { time: "Day 2, 9:00 AM", activity: "River procession viewing from reserved riverside area" },
      { time: "Day 2, 12:00 PM", activity: "Festival lunch with local delicacies" },
      { time: "Day 2, 2:00 PM", activity: "Post-festival heritage tour & artisan market" },
      { time: "Day 2, 5:00 PM", activity: "Tour concludes; departure assistance" },
    ],
    includes: [
      "1-night accommodation (twin sharing)",
      "Reserved riverside viewing area pass",
      "Festival lunch and welcome snack",
      "Licensed MHACTO guide",
      "Post-festival heritage tour",
    ],
    highlights: [
      "Front-row viewing for the Pagoda river procession",
      "Solemn mass at the historic church",
      "Full street fair and fireworks experience",
      "Overnight in Bocaue with local hosts",
    ],
    image: asset("/images/places/river-festival.jpg"),
    bookingContact: "MHACTO Office: (044) 123-4567 | Book at least 3 weeks in advance",
  },
  {
    id: "culinary-food-tour",
    name: "Bocaue Food Heritage Trail",
    duration: "Half Day (4 hours)",
    type: "food",
    difficulty: "easy",
    groupSize: "4–15 persons",
    price: "₱450 per person",
    description:
      "A guided food tour through the edible heritage of Bocaue — visiting the public market, local bakeries, kakanin stalls, and a live cooking demonstration of traditional dishes.",
    itinerary: [
      { time: "8:00 AM", activity: "Bocaue Public Market tasting walk: fresh kakanin and native delicacies" },
      { time: "9:00 AM", activity: "Visit to a heritage bakery: puto seko live baking demonstration" },
      { time: "10:00 AM", activity: "Church yard stalls: bibingka and traditional drinks" },
      { time: "11:00 AM", activity: "Community kitchen: live cooking demonstration of Bulacan lechon preparation" },
      { time: "12:00 PM", activity: "Communal lunch with local specialties; tour ends" },
    ],
    includes: [
      "Food tastings at all stops",
      "Live cooking demonstrations",
      "Recipe cards and take-home puto seko pack",
      "Licensed MHACTO food guide",
    ],
    highlights: [
      "Authentic puto seko straight from a family bakery",
      "Bocaue Public Market food experience",
      "Bulacan lechon live demonstration",
      "Community kitchen experience",
    ],
    image: asset("/images/places/Food.jpg"),
    bookingContact: "MHACTO Office: (044) 123-4567",
  },
  {
    id: "philippine-arena-day-tour",
    name: "Philippine Arena Landmark Tour",
    duration: "Half Day (3 hours)",
    type: "heritage",
    difficulty: "easy",
    groupSize: "2–50 persons",
    price: "₱500 per person (arena entrance included)",
    description:
      "A guided tour of the Philippine Arena — the world's largest indoor arena — including the Visitor Center, architectural highlights, and the Ciudad de Victoria grounds.",
    itinerary: [
      { time: "9:00 AM", activity: "Meet at Ciudad de Victoria gates; welcome briefing" },
      { time: "9:30 AM", activity: "Philippine Arena Visitor Center: history, records, and exhibits" },
      { time: "10:30 AM", activity: "Guided interior tour of the arena (subject to no-event days)" },
      { time: "11:30 AM", activity: "Exterior architecture walk and photo opportunities" },
      { time: "12:00 PM", activity: "Tour ends; option to visit Ciudad de Victoria restaurants" },
    ],
    includes: [
      "Arena visitor center entrance fee",
      "Licensed tour guide",
      "Printed itinerary and souvenir booklet",
    ],
    highlights: [
      "Guinness World Record largest indoor arena",
      "55,000-seat interior (on non-event days)",
      "Architectural landmark photography",
      "Comprehensive visitor exhibits",
    ],
    image: asset("/images/places/philippine-arena.jpg"),
    bookingContact: "MHACTO Office: (044) 123-4567 | Philippine Arena: (044) 234-5678",
  },
]
