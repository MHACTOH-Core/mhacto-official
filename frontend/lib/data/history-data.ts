import { asset } from "@/lib/utils"

// ── Timeline of Events ──────────────────────────────────────────────
export interface TimelineEvent {
  year: string
  era: string
  title: string
  description: string
  details: string
  image?: string
  significance: "major" | "notable" | "cultural"
  author?: string
}

export const timelineEvents: TimelineEvent[] = [
  {
    year: "c. 900",
    era: "Pre-Colonial Period",
    title: "Earliest Settlements Along the Bocaue River",
    description:
      "Indigenous Tagalog communities establish settlements along the fertile banks of what would later be called the Bocaue River.",
    details:
      "Long before the arrival of Spanish colonizers, the lands of present-day Bocaue were inhabited by Tagalog fishing and farming communities. The river provided an abundant source of fish and fresh water, while the surrounding plains yielded rich harvests. Early trade routes connected these communities to the coastal towns of Manila Bay and the interior of Bulacan. Archaeological finds in the area — including earthenware pottery and iron implements — indicate sustained habitation and commerce dating back to at least the 9th century CE.",
    significance: "major",
  },
  {
    year: "1572",
    era: "Spanish Colonial Period",
    title: "Bocaue Established as a Visita",
    description:
      "Spanish Augustinian missionaries formally recognize Bocaue as a visita (a dependent chapel community) under the jurisdiction of the neighboring parish of Bigaa.",
    details:
      "Following the Spanish conquest of Luzon in 1565–1571, Augustinian friars fanned out across the surrounding provinces to evangelize local populations. Bocaue was initially designated a visita — a smaller satellite community served intermittently by priests from the established parish of Bigaa (now Balagtas). The missionaries constructed the first bamboo-and-nipa chapel by the riverbank and began baptizing residents, replacing pre-colonial animist practices with Catholic faith.",
    significance: "major",
  },
  {
    year: "1609",
    era: "Spanish Colonial Period",
    title: "Parish of Bocaue Formally Founded",
    description:
      "Bocaue is elevated to a full parish under the patronage of St. Martin of Tours, with a permanent Augustinian priest assigned.",
    details:
      "By the early 17th century, Bocaue's population had grown large enough to warrant its own independent parish. The Augustinians formally established the Parish of Saint Martin of Tours in 1609, erecting the first stone church near the river. This event marked a turning point in Bocaue's identity as a distinct municipality with its own civic and religious center. The church would be expanded and renovated over subsequent centuries, surviving natural disasters and wartime destruction.",
    image: asset("/images/places/Church.jpg"),
    significance: "major",
  },
  {
    year: "1788",
    era: "Spanish Colonial Period",
    title: "The Pagoda Festival — Origin of a Living Tradition",
    description:
      "The miraculous discovery of a cross floating on the Bocaue River gives rise to the town's most celebrated annual tradition: the Bocaue Pagoda Festival.",
    details:
      "According to tradition, a cross was found miraculously floating on the Bocaue River in the late 18th century. Fishermen who retrieved it reported miraculous healings and blessings. In thanksgiving, the townspeople began an annual fluvial procession in which an ornate pagoda bearing the image of the Holy Cross is carried on a large barge through the river, accompanied by smaller decorated boats. This festival, held on the first Sunday of August each year, became a defining cultural event of Bocaue and eventually earned national and international recognition.",
    image: asset("/images/places/river-festival.jpg"),
    significance: "cultural",
  },
  {
    year: "1850",
    era: "Spanish Colonial Period",
    title: "The Stone Church Completed in Its Present Form",
    description:
      "After multiple renovations following earthquake damage, the St. Martin of Tours Church is rebuilt in its current Baroque stone form.",
    details:
      "The original 17th-century stone church suffered extensive damage from the powerful earthquakes that struck Bulacan in the 18th and early 19th centuries. A major rebuilding campaign in the mid-1800s produced the church in the Baroque style visible today — featuring a two-bell-tower façade, hand-carved retablos inside the nave, and thick stone walls reinforced against future seismic events. The church became the spiritual and social hub of Bocaue's growing colonial-era population.",
    image: asset("/images/places/church-bocaue.jpg"),
    significance: "cultural",
  },
  {
    year: "1898",
    era: "Philippine Revolution",
    title: "Bocaue and the Philippine Revolution",
    description:
      "Bocaueños join the Katipunan uprising against Spanish colonial rule, with local fighters contributing to battles across Bulacan province.",
    details:
      "The fires of the Philippine Revolution of 1896 spread quickly through Bulacan, one of the provinces most actively involved in the Katipunan uprising led by Andres Bonifacio and later Emilio Aguinaldo. Bocaue residents formed their own local chapters and armed units. The town served as a supply and communication point for revolutionary forces operating along the Marilao and Bocaue river corridors. On June 12, 1898, when Philippine independence was proclaimed in Kawit, Cavite, Bocaueños celebrated alongside the rest of the nation.",
    significance: "major",
  },
  {
    year: "1901",
    era: "American Colonial Period",
    title: "American Administration Establishes Public Schools",
    description:
      "Under the new American colonial government, the first public elementary school is established in Bocaue, expanding education to all residents.",
    details:
      "The American colonial administration that took over from Spain in 1898–1901 prioritized public education as a tool of governance and modernization. In Bocaue, a public elementary school was inaugurated in 1901, staffed initially by American Thomasite teachers — volunteers who traveled from the United States to teach English and introduce a new western-style curriculum. Literacy rates in Bocaue improved rapidly over the following decades, setting the foundation for the town's tradition of academic excellence.",
    significance: "notable",
  },
  {
    year: "1943–1945",
    era: "World War II",
    title: "Japanese Occupation and Liberation",
    description:
      "Japanese forces occupy Bocaue during World War II. The town sustains significant destruction, particularly to the church and municipal buildings, before liberation in 1945.",
    details:
      "Like much of Bulacan, Bocaue fell under Japanese occupation in early 1942 following the rapid fall of Manila. The town's strategic location along major road and river routes made it a point of military interest. Guerrilla resistance cells operated covertly throughout the occupation. During the Allied counter-offensive of 1944–1945, Bocaue experienced intense fighting and aerial bombardment, causing significant damage to the church façade, municipal buildings, and many homes. Liberation came in early 1945, and the townspeople immediately began the long process of rebuilding.",
    significance: "major",
  },
  {
    year: "1976",
    era: "Post-War Republic",
    title: "Bocaue Becomes Famous for Fireworks Industry",
    description:
      "Bocaue's fireworks and pyrotechnics industry is formally recognized as a major cottage industry, earning the town the nickname 'Fireworks Capital of the Philippines.'",
    details:
      "For generations, families in Bocaue had been crafting fireworks by hand — a tradition that some trace back to Chinese merchants who settled in the area during the colonial period. By the mid-20th century, the fireworks trade had grown into a major local industry. Bocaue supplied pyrotechnics to celebrations across the Philippines. In the 1970s, formal regulations began governing the industry, and Bocaue's reputation as the nation's fireworks capital was cemented. The industry, while subject to safety reforms over the years, remains a part of Bocaue's cultural identity.",
    image: asset("/images/places/fireworks.jpg"),
    significance: "cultural",
  },
  {
    year: "2014",
    era: "Contemporary",
    title: "Philippine Arena Inaugurated in Bocaue",
    description:
      "The Philippine Arena — the world's largest indoor arena with a capacity of 55,000 — is inaugurated in Ciudad de Victoria, Bocaue, on July 21, 2014.",
    details:
      "The Philippine Arena was constructed by the Iglesia ni Cristo as the centerpiece of their centennial celebration. Located in the 750-hectare Ciudad de Victoria complex in Bocaue, the arena was designed by the globally renowned architectural firm Populous, in partnership with Filipino engineers. The inaugural ceremony on July 21, 2014 was attended by over 50,000 members and set a Guinness World Record for the largest gathering in a domed venue. The arena catapulted Bocaue into international headlines and became one of the most visited landmarks in the country.",
    image: asset("/images/places/philippine-arena.jpg"),
    significance: "major",
  },
  {
    year: "2023",
    era: "Contemporary",
    title: "MHACTO Tourism Master Plan Launched",
    description:
      "The Municipal History, Arts, Culture and Tourism Office (MHACTO) launches the Bocaue Tourism Master Plan 2025–2030, charting the town's future as a heritage tourism destination.",
    details:
      "Recognizing Bocaue's rich cultural assets and the opportunity presented by the post-pandemic travel recovery, the local government launched a comprehensive Tourism Master Plan. The plan outlines strategies to develop heritage trails linking the St. Martin of Tours Church, the town plaza, and the Bocaue River waterfront; to support local arts and crafts industries; to digitize historical archives; and to promote community-based tourism programs. The MHACTO office leads implementation in close coordination with the Office of the Mayor, local schools, and community organizations.",
    significance: "notable",
  },
]

export const timelineEras = [
  { label: "Pre-Colonial", color: "bg-amber-500" },
  { label: "Spanish Colonial", color: "bg-orange-500" },
  { label: "Philippine Revolution", color: "bg-red-500" },
  { label: "American Colonial", color: "bg-blue-500" },
  { label: "World War II", color: "bg-gray-600" },
  { label: "Post-War Republic", color: "bg-green-600" },
  { label: "Contemporary", color: "bg-primary" },
]

// ── Notable Persons ──────────────────────────────────────────────────
export interface NotablePerson {
  id: string
  name: string
  title: string
  years: string
  category: "government" | "arts" | "religion" | "sports" | "education" | "national-hero"
  description: string
  legacy: string
  image?: string
  featured?: boolean
  author?: string
}

export const notablePersons: NotablePerson[] = [
  {
    id: "general-proceso-into-bocaue",
    name: "Gen. Proceso Into",
    title: "Revolutionary Leader & War Veteran",
    years: "1862–1931",
    category: "national-hero",
    featured: true,
    description:
      "A Bocaueño general who played a decisive role in the Philippine Revolution against Spain and the subsequent Philippine-American War, leading guerrilla operations across Bulacan.",
    legacy:
      "Gen. Proceso Into is remembered as one of Bocaue's most celebrated patriots. He organized and commanded local Katipunan units, coordinating with provincial commanders during the revolutionary campaigns of 1896–1898. After the fall of Manila to American forces, he continued armed resistance and was eventually captured and imprisoned. His courage and sacrifice are commemorated in local civic ceremonies.",
  },
  {
    id: "jose-corazon-de-jesus",
    name: "Jose Corazon de Jesus",
    title: "National Poet — 'Huseng Batute'",
    years: "1896–1932",
    category: "arts",
    featured: true,
    description:
      "One of the most celebrated Filipino poets of the 20th century, born in Bocaue, whose Tagalog verse elevated balagtasan (poetic debate) to a national art form.",
    legacy:
      "Known by his pen name 'Huseng Batute,' Jose Corazon de Jesus was born in Bocaue on September 25, 1896. He became the undisputed champion of balagtasan — a performed form of Tagalog verse debate — winning competitions across Manila and the provinces. His love poems, patriotic verses, and witty social commentary remain part of Philippine literary canon. The Bocaue public square bears his name in honor of his contributions to Filipino literature and language.",
    image: asset("/images/places/Arts.jpg"),
  },
  {
    id: "fr-mariano-victoria",
    name: "Fr. Mariano Victoria",
    title: "Parish Priest & Community Builder",
    years: "1830–1905",
    category: "religion",
    description:
      "A beloved Filipino priest who served the Parish of St. Martin of Tours during the tumultuous period of the Philippine Revolution, mediating between colonial authorities and local revolutionaries.",
    legacy:
      "Fr. Mariano Victoria served as parish priest of Bocaue for over three decades during the Spanish colonial period and the early years of American governance. Known for his deep compassion for the poor, he established charitable programs to support widows and orphans and mediated local conflicts. His pastoral work helped preserve the church and its archives during the upheavals of 1896–1898.",
  },
  {
    id: "atty-ernesto-mercado",
    name: "Atty. Ernesto Mercado",
    title: "Educator & Municipal Mayor",
    years: "1920–1988",
    category: "government",
    description:
      "A lawyer, educator, and two-term municipal mayor who modernized Bocaue's public infrastructure and established its first public library in the 1960s.",
    legacy:
      "Atty. Ernesto Mercado served as Municipal Mayor of Bocaue during the 1960s, presiding over a period of significant development. He paved the town's main roads, constructed the new municipal hall, and — most memorably — founded the Bocaue Public Library in 1964, the first of its kind in the municipality. His legacy lives on in the Mercado Elementary School, named in his honor.",
  },
  {
    id: "olympia-san-agustin",
    name: "Olympia San Agustin",
    title: "Celebrated Folk Weaver & Cultural Heritage Bearer",
    years: "1940–present",
    category: "arts",
    description:
      "A nationally recognized master weaver from Bocaue whose intricate pandan and buri weaving has been exhibited at the National Museum of the Philippines.",
    legacy:
      "Olympia San Agustin learned to weave at the feet of her grandmother, who was one of Bocaue's last practitioners of the traditional pandan mat and basket technique. Now in her eighties, Olympia has exhibited her work at the National Museum and has taught hundreds of young weavers through community workshops. The MHACTO office has designated her as a Living Cultural Heritage Bearer, ensuring her techniques are documented and preserved for future generations.",
  },
  {
    id: "coach-renato-dela-paz",
    name: "Coach Renato Dela Paz",
    title: "Sports Coach — National Swimming Champion Trainer",
    years: "1965–present",
    category: "sports",
    description:
      "Head coach of the Bocaue Swim Team, whose athletes have won national championships and represented the Philippines in Southeast Asian youth competitions.",
    legacy:
      "Coach Renato Dela Paz has dedicated over three decades to developing young swimmers from Bocaue. Training in the municipal pool with minimal facilities, his athletes have consistently outperformed better-funded competitors from larger cities. Several of his former students have gone on to represent the Philippines in regional and international competitions. He is regarded as a model of grassroots sports development.",
  },
]

export const personCategoryLabels: Record<NotablePerson["category"], string> = {
  "national-hero": "Patriot & Hero",
  arts: "Arts & Literature",
  religion: "Religion & Service",
  government: "Government & Law",
  education: "Education",
  sports: "Sports",
}
