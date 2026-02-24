// ── Educational Institutions: Colleges ──────────────────────────────
export interface College {
  id: string
  name: string
  type: "state" | "private" | "technical"
  programs: string[]
  description: string
  location: string
  contact?: string
  website?: string
  yearEstablished?: string
  enrollment?: string
}

export const colleges: College[] = [
  {
    id: "bocaue-tvet",
    name: "Bocaue Technical-Vocational Education & Training Center",
    type: "technical",
    programs: [
      "Computer Systems Servicing",
      "Electrical Installation & Maintenance",
      "Cookery (NCII)",
      "Bread & Pastry Production",
      "Shielded Metal Arc Welding",
      "Dressmaking",
    ],
    description:
      "The primary technical-vocational institution in Bocaue, offering TESDA-accredited short courses and NC II programs that equip residents with practical, employable skills.",
    location: "Bocaue, Bulacan (contact LGU for current address)",
    contact: "TESDA Bulacan Provincial Office: (044) 123-4567",
    yearEstablished: "1998",
    enrollment: "Approx. 600 enrollees per year",
  },
  {
    id: "bulacan-state-university-access",
    name: "Bulacan State University — Bocaue Access Program",
    type: "state",
    programs: [
      "BS Information Technology",
      "BS Business Administration",
      "Bachelor of Elementary Education",
      "BS Criminology",
    ],
    description:
      "BulSU's outreach programs serve Bocaue residents through extension campuses and off-site programs, allowing students to access state university education without traveling to the main campus in Malolos.",
    location: "Bocaue extension site (coordinate with BulSU main campus)",
    contact: "BulSU Main Campus: (044) 791-0153",
    website: "bulsu.edu.ph",
    yearEstablished: "BulSU main campus 1904; Bocaue access since 2010",
  },
  {
    id: "icc-bocaue",
    name: "Immaculate Conception College of Bocaue",
    type: "private",
    programs: [
      "AB Communication",
      "BS Accountancy",
      "BS Nursing",
      "BS Hotel & Restaurant Management",
      "Bachelor of Secondary Education",
    ],
    description:
      "A private Catholic institution affiliated with religious sisters, serving the communities of Bocaue and neighboring municipalities with quality higher education anchored in Christian values.",
    location: "Bocaue, Bulacan",
    contact: "School Registrar: (044) 234-9876",
    yearEstablished: "1965",
    enrollment: "Approx. 1,200 students",
  },
]

// ── Educational Institutions: Public Schools ─────────────────────────
export interface PublicSchool {
  id: string
  name: string
  level: "elementary" | "junior-high" | "senior-high" | "integrated"
  barangay: string
  description: string
  programs: string[]
  principalName?: string
  enrollmentRange?: string
}

export const publicSchools: PublicSchool[] = [
  {
    id: "bocaue-nhs",
    name: "Bocaue National High School",
    level: "integrated",
    barangay: "Bocaue Town Center",
    description:
      "The largest secondary public school in the municipality, offering Junior and Senior High School with a range of academic tracks. Home of the champion Quiz Bee team that won the 2026 Central Luzon Regional competition.",
    programs: [
      "STEM Track",
      "ABM (Accountancy, Business & Management) Track",
      "HUMSS (Humanities & Social Sciences) Track",
      "TVL — Home Economics & ICT",
      "Junior High School Complete Curriculum",
    ],
    enrollmentRange: "3,000–3,500 students",
  },
  {
    id: "mercado-elementary",
    name: "Mercado Elementary School",
    level: "elementary",
    barangay: "Bocaue Town Center",
    description:
      "Named in honor of former Mayor Ernesto Mercado, this school serves the central barangays and implements the K–6 DepEd curriculum with special programs in arts, sports, and Mother Tongue-Based Multilingual Education.",
    programs: ["K–6 Complete Elementary Curriculum", "Arts Integration Program", "School Sports Program"],
    enrollmentRange: "1,200–1,500 pupils",
  },
  {
    id: "turo-es",
    name: "Turo Elementary School",
    level: "elementary",
    barangay: "Turo",
    description:
      "One of the barangay-level elementary schools serving the agricultural communities of Bocaue's outer barangays. Implements the Gulayan sa Paaralan (school garden) program as part of food and nutrition education.",
    programs: ["K–6 Complete Elementary", "Gulayan sa Paaralan (School Garden)"],
    enrollmentRange: "600–800 pupils",
  },
  {
    id: "bocaue-whs",
    name: "Bocaue West High School",
    level: "junior-high",
    barangay: "Batia",
    description:
      "A junior high school serving the western barangays of Bocaue, with a strong focus on academic excellence and student competency programs aligned with DepEd Bulacan.",
    programs: [
      "Junior High School Complete Curriculum",
      "School-Based Management Program",
      "Reading Literacy Program",
    ],
    enrollmentRange: "1,000–1,200 students",
  },
  {
    id: "bukid-es",
    name: "Bukid Elementary School",
    level: "elementary",
    barangay: "Bukid",
    description:
      "A community-embedded school known for its vibrant cultural arts program, producing students who participate in Bulacan's regional folk dance and choral competitions.",
    programs: ["K–6 Complete Elementary", "Folk Dance & Cultural Arts Integration"],
    enrollmentRange: "400–600 pupils",
  },
]

// ── Hospitals & Health Facilities ───────────────────────────────────
export interface Hospital {
  id: string
  name: string
  type: "government" | "private" | "lying-in" | "rhu"
  services: string[]
  description: string
  location: string
  contact: string
  beds?: number
  hours: string
  emergency: boolean
}

export const hospitals: Hospital[] = [
  {
    id: "bocaue-rhu",
    name: "Bocaue Rural Health Unit (RHU)",
    type: "rhu",
    services: [
      "General outpatient consultation",
      "Maternal and child health care",
      "Immunization (EPI program)",
      "Family planning services",
      "Nutrition program (Operation Timbang)",
      "TB-DOTS (tuberculosis treatment)",
      "Dental services",
      "PhilHealth accredited",
    ],
    description:
      "The primary government health facility in Bocaue, providing free primary healthcare services to all residents under the municipality's Universal Health Care program. The RHU operates barangay health centers (BHC) in all 14 barangays for community outreach.",
    location: "Bocaue Municipal Compound, Bocaue, Bulacan",
    contact: "(044) 123-4567 | RHU hotline: 0917-xxx-xxxx",
    hours: "Monday–Friday: 7:00 AM – 5:00 PM; BHCs: 8:00 AM – 5:00 PM",
    emergency: false,
  },
  {
    id: "bocaue-sacred-heart",
    name: "Sacred Heart Hospital of Bocaue",
    type: "private",
    services: [
      "Emergency and trauma care (24/7)",
      "General surgery",
      "Obstetrics and gynecology",
      "Pediatrics",
      "Internal medicine",
      "Orthopedics",
      "Diagnostic laboratory",
      "X-ray and ultrasound",
      "PhilHealth and HMO accredited",
    ],
    description:
      "A full-service private hospital serving Bocaue and surrounding municipalities, with a 24-hour emergency department, surgical suites, and a broad range of specialist clinics. One of the most accessible secondary-care hospitals in the Bocaue-Meycauayan corridor.",
    location: "National Highway, Bocaue, Bulacan",
    contact: "(044) 234-5678 | Emergency: (044) 234-5679",
    beds: 75,
    hours: "24 hours / 7 days (emergency department always open)",
    emergency: true,
  },
  {
    id: "bulacan-medical-center",
    name: "Bulacan Medical Center (nearest referral hospital)",
    type: "government",
    services: [
      "Level 2 tertiary care",
      "Emergency medicine",
      "Neurology",
      "Cardiology",
      "Oncology support",
      "Blood bank",
      "Philhealth, DSWD, and indigent program accredited",
    ],
    description:
      "While located in Malolos City (the provincial capital), Bulacan Medical Center serves as the primary government referral hospital for Bocaue residents requiring specialized or complex care beyond the capacity of local facilities. The MHACTO and LGU health office facilitate referral assistance for indigent patients.",
    location: "Malolos City, Bulacan (approx. 30 minutes from Bocaue)",
    contact: "(044) 662-0401",
    beds: 350,
    hours: "24 hours",
    emergency: true,
  },
  {
    id: "bocaue-lying-in",
    name: "Bocaue Birthing Home & Lying-In Clinic",
    type: "lying-in",
    services: [
      "Normal spontaneous delivery (NSVD)",
      "Pre-natal check-up",
      "Post-natal care",
      "Newborn care and immunization",
      "PhilHealth maternity benefit accredited",
    ],
    description:
      "A dedicated lying-in clinic providing safe, affordable, and accessible maternal care to Bocaue residents. Staffed by licensed nurses and midwives, it is the primary delivery facility for mothers who are not high-risk and do not require hospital-level care.",
    location: "Bocaue Poblacion, Bulacan",
    contact: "Municipal Health Office: (044) 123-4567",
    hours: "24 hours",
    emergency: false,
  },
]

// ── Events ───────────────────────────────────────────────────────────
export interface MunicipalEvent {
  id: string
  title: string
  date: string
  endDate?: string
  category: "festival" | "civic" | "sports" | "cultural" | "religious" | "health"
  location: string
  description: string
  highlights: string[]
  ticketed: boolean
  price?: string
  organizer: string
  image?: string
}

export const municipalEvents: MunicipalEvent[] = [
  {
    id: "pagoda-festival-2026",
    title: "Bocaue Pagoda Festival 2026",
    date: "2026-08-02",
    category: "festival",
    location: "Bocaue River & Town Center",
    description:
      "The 238th Bocaue Pagoda Festival — the Philippines' most spectacular water festival, featuring the grand fluvial procession of the Holy Cross of Wawa, street fairs, and fireworks.",
    highlights: [
      "Grand river procession with hundreds of decorated boats",
      "Solemn high mass at St. Martin of Tours Church",
      "River-illuminated pagoda parade at dusk",
      "Pyrotechnics display by Bocaue's fireworks artisans",
      "Cultural performances and street food fair",
    ],
    ticketed: false,
    organizer: "Bocaue LGU & Parish of St. Martin of Tours",
  },
  {
    id: "fiesta-san-martin-2026",
    title: "Fiesta of St. Martin of Tours 2026",
    date: "2026-11-11",
    category: "religious",
    location: "St. Martin of Tours Church & Town Plaza",
    description:
      "Annual patronal feast of the municipality, with a solemn high mass, street procession, barangay decoration competitions, and a weeklong festive program.",
    highlights: [
      "Solemn mass and street procession",
      "Barangay casa decoration competition",
      "Live music and cultural dance shows at the plaza",
      "Traditional food bazaar and trade fair",
    ],
    ticketed: false,
    organizer: "Bocaue LGU & Parish of St. Martin of Tours",
  },
  {
    id: "bocaue-sports-cup-2026",
    title: "Bocaue Inter-Barangay Sports Cup 2026",
    date: "2026-04-01",
    endDate: "2026-04-30",
    category: "sports",
    location: "Bocaue Sports Complex & Barangay Courts",
    description:
      "The annual inter-barangay sports tournament featuring basketball, volleyball, swimming, chess, and kabaddi — the premier amateur sports event in Bocaue.",
    highlights: [
      "Basketball — the most contested sport",
      "Volleyball open and mixed divisions",
      "Swimming at the municipal pool",
      "Chess — individual and team categories",
      "Cash prizes and trophies for champions",
    ],
    ticketed: false,
    organizer: "Bocaue LGU Sports Development Office",
  },
  {
    id: "mhacto-cultural-exhibit-2026",
    title: "MHACTO Heritage Arts Exhibition 2026",
    date: "2026-06-10",
    endDate: "2026-06-20",
    category: "cultural",
    location: "MHACTO Heritage Gallery, Old Municipal Hall",
    description:
      "An annual showcase of Bocaue's living heritage — featuring works by local artisans, student art competitions, historical photo exhibits, and cultural performances.",
    highlights: [
      "Artisan showcase: weaving, woodcarving, pottery",
      "Student arts competition (painting, poetry, photography)",
      "Historical photo exhibit: 100 years of Bocaue in images",
      "Live balagtasan performances",
      "Heritage tour packages sold at the event",
    ],
    ticketed: false,
    organizer: "MHACTO Bocaue",
  },
  {
    id: "simbang-gabi-2026",
    title: "Simbang Gabi 2026",
    date: "2026-12-16",
    endDate: "2026-12-24",
    category: "religious",
    location: "St. Martin of Tours Church",
    description:
      "Nine consecutive 4:00 AM dawn masses leading up to Christmas Eve, accompanied by the beloved outdoor food bazaar tradition in the churchyard.",
    highlights: [
      "Dawn masses at 4:00 AM each day",
      "Outdoor bibingka and puto bumbong stalls",
      "Christmas caroling and parol competition",
      "Christmas Eve midnight mass",
    ],
    ticketed: false,
    organizer: "Parish of St. Martin of Tours",
  },
  {
    id: "independence-day-2026",
    title: "Philippine Independence Day & Bocaue Founding Anniversary",
    date: "2026-06-12",
    category: "civic",
    location: "Bocaue Municipal Hall & Town Plaza",
    description:
      "Dual celebration of Philippine Independence Day and Bocaue's municipal founding anniversary, with a civic parade, cultural exhibits, and student competitions.",
    highlights: [
      "Municipal flag ceremony and civic parade",
      "School band and color guard competition",
      "MHACTO historical exhibits",
      "Oratorical and essay competitions",
      "Barangay cultural presentations",
    ],
    ticketed: false,
    organizer: "Bocaue LGU",
  },
]
