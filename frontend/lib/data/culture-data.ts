import { asset } from "@/lib/utils"

// ── Local Cuisine ────────────────────────────────────────────────────
export interface CuisineItem {
  id: string
  name: string
  tagalogName?: string
  type: "main" | "snack" | "dessert" | "drink"
  description: string
  story: string
  image: string
  where: string[]
  bestTime?: string
  isFeatured?: boolean
}

// ── Restaurant & Eatery (CMS-managed) ────────────────────────────────
export interface Restaurant {
  id: string
  name: string
  type: "restaurant" | "eatery" | "bakery" | "street-food"
  specialty: string
  description: string
  address: string
  hours: string
  tags: string[]
  image?: string
}

export const localCuisine: CuisineItem[] = [
  {
    id: "puto-seko",
    name: "Puto Seko",
    tagalogName: "Puto Seko",
    type: "snack",
    description:
      "A dry, crumbly shortbread-style rice cookie — a beloved Bocaue delicacy gifted at fiestas and brought home as pasalubong.",
    story:
      "Puto Seko is perhaps the snack most associated with Bocaue. Unlike the steamed puto found elsewhere in the Philippines, the Bocaue variety is oven-baked, yielding a dry, melt-in-your-mouth texture. Made from rice flour, butter, eggs, and sugar, each batch requires careful hand-mixing so the dough doesn't become too dense. Families have been baking puto seko for generations, and several home-based bakeries in the town proper sell hundreds of pieces daily — especially in the weeks leading up to the Pagoda Festival when demand spikes dramatically.",
    image: asset("/images/places/Food.jpg"),
    where: ["Bocaue Town Center", "Local bakeries along Rizal Street"],
    bestTime: "Year-round; peak season around the Pagoda Festival in August",
  },
  {
    id: "bocaue-taho",
    name: "Bocaue Taho",
    type: "drink",
    description:
      "Warm, silky tofu with arnibal (brown sugar syrup) and sago pearls — a morning ritual hawked by vendors along Bocaue's streets since the early 20th century.",
    story:
      "Taho vendors have been a fixture of Bocaue's early mornings for over a hundred years. Balancing aluminum canisters on their shoulders, they call out 'Tahooo!' through the predawn streets, drawing residents out for a warm cup before school or work. Bocaue's taho is distinguished by its particularly smooth silken tofu, sourced from a small local producer who uses traditional recipes passed down from Chinese settlers. The arnibal syrup is cooked longer for a richer molasses-like depth compared to the Manila version.",
    image: asset("/images/places/Food.jpg"),
    where: ["Morning street vendors throughout Bocaue", "Public market"],
    bestTime: "Early mornings (5:00 AM – 8:00 AM)",
  },
  {
    id: "bibingka-atbp",
    name: "Bibingka & Puto Bumbong",
    type: "dessert",
    description:
      "Classic Filipino rice cake delicacies prepared fresh near the church during the festive Simbang Gabi (Christmas dawn masses) season.",
    story:
      "Every December, the churchyard of St. Martin of Tours transforms at 3 AM into a fragrant outdoor food market. Vendors set up clay pots over charcoal fires to bake bibingka — a coconut-milk rice cake topped with itlog na maalat (salted duck egg) and grated coconut. Beside them, bamboo tubes are packed with black glutinous rice and steamed over boiling water to produce puto bumbong, served with muscovado sugar and coconut. These December rituals are as much about community as they are about food.",
    image: asset("/images/places/local-delicacies.jpg"),
    where: ["St. Martin of Tours Church yard", "Bocaue Public Market"],
    bestTime: "December (Simbang Gabi season)",
  },
  {
    id: "lechon-bulacan",
    name: "Bulacan Lechon",
    type: "main",
    description:
      "Slow-roasted whole suckling pig stuffed with lemongrass, tanglad, and herbs — the centerpiece of every Bocaue fiesta table.",
    story:
      "Bocaue shares Bulacan's centuries-old lechon tradition. At every significant celebration — weddings, birthdays, the fiesta of St. Martin of Tours, and the Pagoda Festival — whole pigs are slow-roasted over hardwood coals for up to six hours. The Bulacan style uses liberal amounts of lemongrass (tanglad), bay leaves, and garlic stuffed inside the cavity, which infuses the juices and creates an intensely aromatic, crackling-crisp skin. Local lechon masters (manghahanda) are hired weeks in advance for major celebrations.",
    image: asset("/images/places/Food.jpg"),
    where: ["Catering families & lechon stalls near the town plaza", "Bocaue Public Market"],
    bestTime: "Fiesta season (November) and Pagoda Festival (August)",
  },
  {
    id: "kakanin-spread",
    name: "Kakanin (Rice Dessert Spread)",
    type: "dessert",
    description:
      "An assortment of traditional Filipino rice-based sweets including suman, sapin-sapin, and biko, prepared by local vendors for weekend markets.",
    story:
      "Every weekend, Bocaue's public market fills with colorful banana-leaf-wrapped kakanin prepared by home cooks who have mastered these traditional recipes. Suman — glutinous rice cooked in coconut milk and wrapped in banana leaves — is the most popular, served with ripe mango or tsokolate. Sapin-sapin features layered glutinous rice tinted in purple, white, and yellow. Biko is a sticky-sweet coconut rice cake topped with latik (caramelized coconut cream). These sweets remain deeply embedded in Bocaue's festive and everyday food culture.",
    image: asset("/images/places/local-delicacies.jpg"),
    where: ["Bocaue Public Market", "Weekend markets along the town plaza"],
    bestTime: "Weekends; especially during fiestas and holidays",
  },
]

// ── Festivals & Celebrations ─────────────────────────────────────────
export interface Festival {
  id: string
  name: string
  date: string
  type: "religious" | "cultural" | "civic" | "seasonal"
  description: string
  highlights: string[]
  story: string
  image: string
}

export const festivals: Festival[] = [
  {
    id: "pagoda-festival",
    name: "Bocaue Pagoda Festival (Fiesta ng Bocaue)",
    date: "First Sunday of August",
    type: "religious",
    description:
      "The crown jewel of Bocaue's cultural calendar — a grand fluvial procession on the Bocaue River in which a cross-bearing pagoda barge is escorted by hundreds of decorated boats.",
    story:
      "Rooted in an 18th-century miracle story of a cross found floating on the Bocaue River, the Pagoda Festival has evolved over 230 years into one of the Philippines' most spectacular water festivals. On the morning of the feast day, a large ornate pagoda carrying the image of the Holy Cross of Wawa is placed on a river barge. Hundreds of smaller pump boats and bangka, decorated with colorful banners and flowers, escort the pagoda up and down the river to the cheers of thousands of spectators lining both banks. The festival draws pilgrims and tourists from across the country and has been recognized as a National Cultural Treasure by the National Commission for Culture and the Arts (NCCA).",
    highlights: [
      "Grand fluvial procession with hundreds of river boats",
      "Decorated pagoda barge carrying the miraculous Cross of Wawa",
      "Live music and cultural performances on the riverbanks",
      "Street fairs, local food stalls, and pyrotechnics display",
      "Solemn mass at St. Martin of Tours Church",
    ],
    image: asset("/images/places/river-festival.jpg"),
  },
  {
    id: "fiesta-san-martin",
    name: "Fiesta of St. Martin of Tours",
    date: "November 11",
    type: "religious",
    description:
      "The annual patronal feast honoring St. Martin of Tours, featuring solemn masses, processions, street fairs, and the vibrant Bocaue town center celebrations.",
    story:
      "Every November 11, the municipality celebrates its patron saint with a week of festivities. The climax is the solemn high mass at the St. Martin of Tours Church, followed by a colorful street procession of the patron's image through the town's main streets. Barangays compete in decorating their streets with parol lanterns and floral arches. The plaza fills with carnival rides, local delicacies vendors, and live entertainment. For many Bocaueños living abroad, the November fiesta is the occasion that draws them back home.",
    highlights: [
      "Solemn high mass at St. Martin of Tours Church",
      "Street procession of the patron saint's image",
      "Barangay street decoration competition",
      "Town plaza carnival and cultural shows",
      "Traditional kakanin and local food fair",
    ],
    image: asset("/images/places/Church.jpg"),
  },
  {
    id: "simbang-gabi",
    name: "Simbang Gabi (Christmas Dawn Masses)",
    date: "December 16–24",
    type: "religious",
    description:
      "Nine consecutive predawn masses in the lead-up to Christmas Eve, accompanied by the beloved outdoor food bazaar outside St. Martin of Tours Church.",
    story:
      "The nine-day novena of predawn masses (Misa de Aguinaldo) is a cornerstone of Filipino Christmas tradition, and nowhere in Bocaue is it more warmly observed than at St. Martin of Tours. Masses begin at 4:00 AM, and the churchyard is alive with vendors selling bibingka, puto bumbong, tsokolate, and native delicacies by firelight. Families dressed in their best walk together through the predawn chill, and friends reunite after catching the early mass. Completing all nine masses is considered a special act of faith and is widely believed to bring a wish or prayer answered.",
    highlights: [
      "4:00 AM masses for nine consecutive days",
      "Outdoor bibingka and puto bumbong stalls",
      "Candlelit processions on Christmas Eve",
      "Community caroling and parol displays",
    ],
    image: asset("/images/places/Church.jpg"),
  },
  {
    id: "independence-day",
    name: "Independence Day & Bocaue Founding Anniversary",
    date: "June 12 (shared with Philippine Independence Day)",
    type: "civic",
    description:
      "Dual celebration honoring both Philippine Independence Day and Bocaue's founding as a municipality, featuring civic programs, cultural presentations, and a municipal parade.",
    story:
      "June 12 is doubly significant for Bocaueños — it is both Philippine Independence Day and the day the municipality traditionally holds its founding anniversary celebrations. The day begins with a flag ceremony at the municipal hall, followed by a civic parade along the main streets, where school bands, barangay contingents, and civic organizations march. The MHACTO office organizes historical presentations, art exhibits, and cultural dances in the afternoon, highlighting Bocaue's role in the Philippine Revolution.",
    highlights: [
      "Municipal flag ceremony and civic parade",
      "School band competition",
      "Historical and cultural exhibits at the MHACTO gallery",
      "Cultural dance presentations",
      "Oratorical and essay competitions for students",
    ],
    image: asset("/images/places/Arts.jpg"),
  },
  {
    id: "new-year-fireworks",
    name: "New Year's Fireworks Celebration",
    date: "December 31 – January 1",
    type: "seasonal",
    description:
      "Bocaue, the Fireworks Capital of the Philippines, celebrates the New Year with one of the country's most spectacular pyrotechnic displays.",
    story:
      "Given Bocaue's centuries-long tradition as the center of the Philippine fireworks industry, New Year's Eve here is truly extraordinary. Families gather on rooftops and in open fields to watch competing barangays set off their finest pyrotechnic displays. The town has enforced progressive safety regulations to manage the industry responsibly while preserving the cultural practice. The midnight sky over Bocaue on December 31 lights up in a cascade of color and thunder that draws visitors from surrounding municipalities.",
    highlights: [
      "Large-scale community fireworks displays at midnight",
      "Fireworks artisan demonstrations and exhibits",
      "New Year's street parties and food fair",
      "Countdown events at the town plaza",
    ],
    image: asset("/images/places/fireworks.jpg"),
  },
]

// ── Cultural Practices & Traditions ─────────────────────────────────
export interface CulturalPractice {
  id: string
  name: string
  category: "religion" | "community" | "lifecycle" | "crafts" | "performing-arts"
  description: string
  significance: string
  status: "active" | "endangered" | "revived"
  image?: string
}

export const culturalPractices: CulturalPractice[] = [
  {
    id: "pagoda-procession",
    name: "Fluvial Pagoda Procession",
    category: "religion",
    description:
      "The annual river procession of the Holy Cross of Wawa, conducted on the Bocaue River during the first Sunday of August.",
    significance:
      "Recognized by the National Commission for Culture and the Arts as a national cultural tradition, the pagoda procession is a living expression of Bocaue's syncretic Catholic faith and its deep connection to the river that has nourished it for centuries. The tradition unites thousands of participants across all barangays in a single act of communal celebration.",
    status: "active",
    image: asset("/images/places/river-festival.jpg"),
  },
  {
    id: "balagtasan",
    name: "Balagtasan (Tagalog Verse Debate)",
    category: "performing-arts",
    description:
      "A traditional form of competitive poetic debate in Tagalog, in which two participants argue opposite sides of a proposition in improvised verse.",
    significance:
      "Bocaue's claim as the hometown of Jose Corazon de Jesus ('Huseng Batute'), the greatest balagtasan champion of the 20th century, gives the town a special stake in preserving this oral literary tradition. MHACTO organizes annual balagtasan competitions in schools to pass the art to the next generation.",
    status: "revived",
    image: asset("/images/places/Arts.jpg"),
  },
  {
    id: "pandan-weaving",
    name: "Pandan Mat & Basket Weaving",
    category: "crafts",
    description:
      "Traditional hand-weaving of decorative and functional mats, baskets, and fans from dried pandan leaves, a craft practiced in Bocaue for generations.",
    significance:
      "Pandan weaving is both a livelihood and an art form in Bocaue. Elderly weavers produce intricate geometric patterns that encode family traditions and local symbols. The MHACTO office has documented several master weavers and supports an apprenticeship program to transfer these skills to young community members.",
    status: "endangered",
    image: asset("/images/places/Arts.jpg"),
  },
  {
    id: "pagmamahal-sa-namatay",
    name: "Undas (All Saints' / All Souls' Day Traditions)",
    category: "lifecycle",
    description:
      "The communal gathering of families at the Bocaue public cemetery during November 1–2 to clean graves, light candles, and commemorate loved ones.",
    significance:
      "Undas in Bocaue is a deeply social and spiritual event. Entire extended families — including relatives who have migrated to Manila or abroad — return to the cemetery to spend the night beside the graves of parents, grandparents, and ancestors. Food is shared, stories are retold, and prayers and songs mark the vigil. The tradition reinforces family bonds and the community's reverence for ancestry.",
    status: "active",
  },
  {
    id: "harana",
    name: "Harana (Traditional Serenade)",
    category: "performing-arts",
    description:
      "A courtship tradition in which a suitor serenades a young woman at her window accompanied by guitar-playing companions, singing traditional kundiman and folk songs.",
    significance:
      "Harana has largely disappeared from urban Philippine life, but in the older barangays of Bocaue, elderly residents recall evenings filled with the sound of guitars beneath second-floor windows. MHACTO has documented harana songs from Bocaue's oral tradition and produced a short film showing elderly practitioners demonstrating the practice, ensuring it is not lost to history.",
    status: "endangered",
  },
  {
    id: "pyrotechnics-craft",
    name: "Ancestral Fireworks Craftsmanship",
    category: "crafts",
    description:
      "The multi-generational craft of hand-making pyrotechnics — from simple sparklers to complex aerials — practiced by Bocaue families since the 18th century.",
    significance:
      "Bocaue's designation as the Fireworks Capital of the Philippines is built on this inherited craft. While modern safety regulations have formalized what was once a cottage industry, several families in Bocaue still produce fireworks by hand using techniques passed down from grandparents. MHACTO supports responsible preservation of this tradition through safety-compliant craftsmen's cooperatives.",
    status: "active",
    image: asset("/images/places/fireworks.jpg"),
  },
]

// ── Local Business ───────────────────────────────────────────────────
export interface LocalBusiness {
  id: string
  name: string
  type: "food" | "crafts" | "retail" | "services" | "agri"
  description: string
  products: string[]
  location: string
  contact?: string
  yearEstablished?: string
  image?: string
}

export const localBusinesses: LocalBusiness[] = [
  {
    id: "puto-seko-family-bakery",
    name: "Dela Cruz Puto Seko House",
    type: "food",
    description:
      "A family-run bakery specializing in the authentic Bocaue puto seko recipe handed down for four generations. Supplies local markets and ships nationwide.",
    products: ["Puto Seko", "Puto Cheese", "Traditional Kakanin"],
    location: "Rizal Street, Bocaue Town Center",
    yearEstablished: "1952",
    image: asset("/images/places/Food.jpg"),
  },
  {
    id: "bocaue-fireworks-cooperative",
    name: "Bocaue Pyrotechnics Artisans Cooperative",
    type: "crafts",
    description:
      "A safety-regulated cooperative of licensed fireworks craftsmen producing display pyrotechnics and consumer fireworks for the Philippine market.",
    products: ["Display aerial shells", "Consumer fireworks", "Sparklers", "Fountains"],
    location: "Industrial Zone, Bocaue",
    contact: "LGU-registered; inquire at Municipal Hall",
    image: asset("/images/places/fireworks.jpg"),
  },
  {
    id: "bocaue-public-market-weave",
    name: "Bocaue Weavers' Market Stall",
    type: "crafts",
    description:
      "A market stall in the Bocaue Public Market selling handwoven pandan mats, baskets, fans, and decorative items made by local weavers.",
    products: ["Pandan mats", "Bilao baskets", "Hand fans", "Decorative wall hangings"],
    location: "Bocaue Public Market, Ground Floor",
    image: asset("/images/places/Arts.jpg"),
  },
  {
    id: "local-organic-farm",
    name: "Bokasyong Organic Farm",
    type: "agri",
    description:
      "A community-managed organic farm supplying vegetables, herbs, and native produce to local restaurants and the public market.",
    products: [
      "Organic pechay, sitaw, kangkong",
      "Native herbs (tanglad, pandan, luya)",
      "Free-range eggs",
    ],
    location: "Barangay Turo, Bocaue",
    yearEstablished: "2018",
    image: asset("/images/places/oldtownbocaue.jpg"),
  },
]

// ── People Wonders ──────────────────────────────────────────────────
export interface PeopleWonder {
  id: string
  name: string
  category: "pageant" | "arts" | "sports" | "civic" | "entertainment" | "academics"
  title: string
  achievement: string
  description: string
  year?: string
  awards?: string[]
  image?: string
  social?: string
  isAlive: true
}

export const peopleWonders: PeopleWonder[] = [
  {
    id: "maria-reyes-pageant",
    name: "Maria Cristina Reyes",
    category: "pageant",
    title: "Miss Bocaue 2023 · Binibining Bulacan Top 5",
    achievement: "Crowned Miss Bocaue 2023 and placed in the Top 5 of Binibining Bulacan, representing the municipality with grace and advocacy for heritage preservation.",
    description:
      "Maria Cristina grew up in Barangay Sta. Ana and developed a passion for cultural arts and community service. During her reign, she launched the 'Bocaue Proud' campaign, visiting public schools to promote awareness of the town's rich history and the Pagoda Festival tradition. Her platform centered on empowering young women through arts and livelihood training.",
    year: "2023",
    awards: ["Miss Bocaue 2023", "Binibining Bulacan Top 5", "Best in Cultural Attire – Binibining Bulacan 2023"],
    image: asset("/images/placeholder-user.jpg"),
    isAlive: true,
  },
  {
    id: "jestoni-santos-athlete",
    name: "Jestoni Santos",
    category: "sports",
    title: "National Age-Group Swimming Champion",
    achievement: "Multiple gold medalist in regional and national age-group swimming competitions, representing Bulacan Province and carrying Bocaue's name to national meets.",
    description:
      "Jestoni began training at the Bocaue municipal pool at the age of 7. By 14, he had already claimed three gold medals in the Palarong Pambansa for the 100m and 200m freestyle events. Scouts from the Philippine Swimming League have identified him as a future national team prospect. He attributes his discipline to the support of Bocaue's community coaches and his family in Wakas.",
    year: "2022–present",
    awards: ["Palarong Pambansa Gold – 100m Freestyle 2023", "Palarong Pambansa Gold – 200m Freestyle 2023", "Bulacan Best Athlete in Aquatics 2022"],
    image: asset("/images/placeholder-user.jpg"),
    isAlive: true,
  },
  {
    id: "ana-dela-cruz-artist",
    name: "Ana Corazon Dela Cruz",
    category: "arts",
    title: "Visual Artist · National Youth Art Awardee",
    achievement: "Recipient of the National Commission for Culture and the Arts (NCCA) Young Artists Grant 2024, known for large-scale paintings documenting Bocaue's river culture.",
    description:
      "Ana's signature series 'Ilog ng Pagasa' — a collection of 12 oil-on-canvas paintings depicting life along the Bocaue River — was exhibited at the Cultural Center of the Philippines and later toured provincial galleries across Bulacan. She cites the Pagoda Festival as her greatest creative inspiration, describing the river procession as 'a living painting that I try to freeze on canvas.' She teaches youth mural workshops at the MHACTO gallery every summer.",
    year: "2024",
    awards: ["NCCA Young Artists Grant 2024", "CCP Visual Arts Finalist 2023", "Bulacan Arts Festival Best in Painting 2022"],
    image: asset("/images/places/Arts.jpg"),
    isAlive: true,
  },
  {
    id: "carlo-bautista-musician",
    name: "Carlo Miguel Bautista",
    category: "entertainment",
    title: "Singer-Songwriter · OPM Regional Awardee",
    achievement: "Award-winning OPM singer-songwriter whose debut album 'Sawa sa Tubig' draws from Bocaue's river narratives and folk music traditions, earning acclaim on streaming platforms.",
    description:
      "Carlo started singing at St. Martin of Tours Parish choir at age nine. His original compositions blend contemporary OPM with kundiman melodies and the rhythms of Bocaue's festival music. His debut EP, released independently in 2023, accumulated over 500,000 streams. The title track 'Sawa sa Tubig' is an ode to the Bocaue River and has been used as the background score for the LGU's tourism video campaigns.",
    year: "2023",
    awards: ["Himig Handog Finalist 2023", "Bulacan Music Award – Best New Artist 2023", "MHACTO Cultural Ambassador 2024"],
    image: asset("/images/places/Arts.jpg"),
    isAlive: true,
  },
  {
    id: "dr-patricia-lim-civic",
    name: "Dr. Patricia Lim-Gonzales",
    category: "civic",
    title: "Community Physician · Gawad Kalinga Health Hero 2023",
    achievement: "Bocaue-born physician who founded the 'Libreng Konsulta' free community clinic serving over 3,000 underprivileged residents annually, recognized by Gawad Kalinga as a 2023 Health Hero.",
    description:
      "After completing her medical degree at UP Manila, Dr. Patricia returned to Bocaue and established a free weekend clinic in Barangay Turo, initially operating from her family's garage. Today, the clinic has grown into a proper medical facility with volunteer doctors and nurses from Manila. She has also spearheaded annual medical missions during the Pagoda Festival, providing free check-ups, medicines, and dental services to festival-goers and residents.",
    year: "2023",
    awards: ["Gawad Kalinga Health Hero 2023", "Bulacan Provincial Government Outstanding Citizen 2022", "UP Manila Distinguished Alumna 2024"],
    image: asset("/images/placeholder-user.jpg"),
    isAlive: true,
  },
  {
    id: "lea-santos-pageant-2",
    name: "Lea Mikaela Santos",
    category: "pageant",
    title: "Mutya ng Bulacan 2022 · Miss Tourism Bulacan",
    achievement: "Crowned Mutya ng Bulacan 2022 and Miss Tourism Bulacan, championing Bocaue's cultural heritage and the Pagoda Festival on provincial and national tourism stages.",
    description:
      "A native of Barangay Batia, Lea used her titles to promote Bocaue as a cultural and eco-tourism destination. She represented Bulacan in national pageants and served as face of the provincial tourism department's 'Visit Bulacan' campaign. Off the stage, she volunteers at heritage education programs and has been instrumental in fundraising for the restoration of old colonial-era structures in the town proper.",
    year: "2022",
    awards: ["Mutya ng Bulacan 2022", "Miss Tourism Bulacan 2022", "Best in Talent – Mutya ng Bulacan 2022"],
    image: asset("/images/placeholder-user.jpg"),
    isAlive: true,
  },
  {
    id: "ryan-ocampo-academics",
    name: "Ryan Paolo Ocampo",
    category: "academics",
    title: "UP Diliman Summa Cum Laude · Bar Topnotcher 2024",
    achievement: "Graduated Summa Cum Laude from UP Diliman College of Law and ranked in the Top 10 of the 2024 Philippine Bar Examinations, the highest academic achievement from Bocaue in recent memory.",
    description:
      "Ryan is the son of a tricycle driver from Barangay Lolomboy who earned a scholarship to UP Diliman, where he distinguished himself in legal studies. His bar examination performance — achieved while working part-time as a legal aid volunteer — has made him a symbol of meritocracy and the power of public education in Bocaue. He has pledged to return to his community to provide free legal counsel to indigent residents through the MHACTO's community legal desk.",
    year: "2024",
    awards: ["UP Diliman Summa Cum Laude 2024", "2024 Philippine Bar Top 10", "UP Law Dean's Medal of Excellence"],
    image: asset("/images/placeholder-user.jpg"),
    isAlive: true,
  },
  {
    id: "sofia-garcia-dancer",
    name: "Sofia Anne Garcia",
    category: "arts",
    title: "Ballet & Folk Dance Champion · Bayanihan Youth Ensemble",
    achievement: "Principal dancer of the Bayanihan Youth Ensemble who has performed at international folk dance competitions in Asia and Europe, representing Philippine culture on the world stage.",
    description:
      "Sofia trained at the Bocaue School of Arts and has been performing Philippine folk dances since age six. Her technical precision and storytelling through movement brought her to the Bayanihan Youth Ensemble, where she has been a principal dancer since 2021. She has performed in South Korea, Japan, Germany, and Spain, always returning to Bocaue to teach free dance workshops for children in the community, ensuring the next generation of folk dancers continues the tradition.",
    year: "2021–present",
    awards: ["Bayanihan Youth Ensemble Principal Dancer 2021", "Best Performer – ASEAN Folk Dance Festival 2023", "MHACTO Arts Excellence Award 2024"],
    image: asset("/images/placeholder-user.jpg"),
    isAlive: true,
  },
]

// ── Crafts & Artisans ────────────────────────────────────────────────
export interface Artisan {
  id: string
  name: string
  craft: string
  experience: string
  description: string
  products: string[]
  awards?: string[]
  location: string
  image?: string
}

export const artisans: Artisan[] = [
  {
    id: "olympia-weaver",
    name: "Olympia San Agustin",
    craft: "Pandan & Buri Weaving",
    experience: "60+ years",
    description:
      "Master weaver and MHACTO-recognized Living Cultural Heritage Bearer, whose intricate pandan mats and baskets have been exhibited at the National Museum of the Philippines.",
    products: ["Pandan sleeping mats (banig)", "Decorative baskets", "Buri wall hangings"],
    awards: ["National Museum Featured Artisan 2019", "MHACTO Heritage Bearer 2022"],
    location: "Sta. Ana, Bocaue",
    image: asset("/images/places/Arts.jpg"),
  },
  {
    id: "roman-woodcarver",
    name: "Eduardo Roman",
    craft: "Religious Wood Carving",
    experience: "35 years",
    description:
      "A self-taught woodcarver who produces hand-carved religious images (santo) and decorative pieces in the tradition of Paete, Laguna, but rooted in Bocaue's own folk iconography.",
    products: ["Santo Niño carvings", "San Martin de Tours images", "Decorative relief panels"],
    location: "Bocaue Town Center",
    image: asset("/images/places/Arts.jpg"),
  },
  {
    id: "perla-clay-pots",
    name: "Perla Manalo",
    craft: "Clay Pottery & Palayok Making",
    experience: "40 years",
    description:
      "One of the last practitioners of traditional palayok (clay pot) making in Bocaue, producing cooking pots, serving vessels, and decorative earthenware using Philippine red clay.",
    products: ["Palayok cooking pots", "Clay water jugs (banga)", "Decorative vases"],
    location: "Wakas, Bocaue",
    image: asset("/images/places/oldtownbocaue.jpg"),
  },
  {
    id: "pyro-artist",
    name: "Felipe Torres",
    craft: "Pyrotechnics Design & Artistry",
    experience: "25 years",
    description:
      "A licensed pyrotechnics designer who creates custom aerial fireworks displays for festivals, corporate events, and civic celebrations across Central Luzon.",
    products: ["Custom aerial display sequences", "Competition fireworks", "Themed sky shows"],
    awards: ["BOCAUE FESTIVAL Best Display 2022", "Central Luzon Pyrotechnics Champion 2023"],
    location: "Bocaue Pyrotechnics Zone",
    image: asset("/images/places/fireworks.jpg"),
  },
]
