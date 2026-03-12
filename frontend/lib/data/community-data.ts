// ── Unified All-Schools Directory ────────────────────────────────────
export interface SchoolEntry {
  id: string
  name: string
  ownership: "public" | "private"
  level: "elementary" | "junior-high" | "senior-high" | "college" | "technical-vocational" | "integrated"
  barangay: string
  description: string
  logo?: string           // path under /public
  programs: string[]
  enrollment?: string
  yearEstablished?: string
  contact?: string
  website?: string
}

export const allSchools: SchoolEntry[] = [
  // ── Public Elementary Schools ────────────────────────────────────
  {
    id: "bambang-es",
    name: "Bambang Elementary School",
    ownership: "public",
    level: "elementary",
    barangay: "Bambang",
    description:
      "A DepEd-accredited public elementary school serving the barangay of Bambang, implementing the K–6 curriculum with Mother Tongue-Based Multilingual Education and school-based feeding programs.",
    programs: ["K–6 Complete Elementary Curriculum", "MTB-MLE Program", "Gulayan sa Paaralan"],
  },
  {
    id: "batia-es",
    name: "Batia Elementary School",
    ownership: "public",
    level: "elementary",
    barangay: "Batia",
    description:
      "Serving the community of Batia, this public elementary school delivers the full DepEd K–6 curriculum alongside sports development and nutrition programs for its pupils.",
    programs: ["K–6 Complete Elementary Curriculum", "School Sports Program", "Nutrition & Health Program"],
  },
  {
    id: "binang-es",
    name: "Biñang Elementary School",
    ownership: "public",
    level: "elementary",
    barangay: "Biñang",
    description:
      "A barangay-level public elementary school in Biñang offering the national K–6 curriculum and participating in Division-level academic and cultural competitions.",
    programs: ["K–6 Complete Elementary Curriculum", "Reading Literacy Program", "Cultural Arts Integration"],
  },
  {
    id: "bunducan-es",
    name: "Bunducan Elementary School",
    ownership: "public",
    level: "elementary",
    barangay: "Bunducan",
    description:
      "Public elementary school in Bunducan implementing the DepEd K–6 curriculum, with active parent-teacher community associations supporting the school's programs and infrastructure.",
    programs: ["K–6 Complete Elementary Curriculum", "PTCA-Supported Programs", "Brigada Eskwela"],
  },
  {
    id: "bunlo-es",
    name: "Bunlo Elementary School",
    ownership: "public",
    level: "elementary",
    barangay: "Bunlo",
    description:
      "Serving the residents of Bunlo, this school delivers foundational education under the DepEd K–6 framework with emphasis on numeracy, literacy, and community-based learning.",
    programs: ["K–6 Complete Elementary Curriculum", "Numeracy Intervention", "Community-Based Learning"],
  },
  {
    id: "bocaue-central",
    name: "Cong. E. R. Cruz Memorial Central School",
    ownership: "public",
    level: "elementary",
    barangay: "Poblacion",
    description:
      "Also known as Bocaue Central School, this is one of the oldest and most prominent public elementary schools in the municipality, named in honor of Congressman E. R. Cruz. It serves the central barangays and is recognized for consistent academic performance at the division level.",
    programs: ["K–6 Complete Elementary Curriculum", "Special Science Class", "School Sports Program", "Arts & Music Integration"],
  },
  {
    id: "duhat-es",
    name: "Duhat Elementary School",
    ownership: "public",
    level: "elementary",
    barangay: "Duhat",
    description:
      "A public elementary school in Barangay Duhat offering the full DepEd K–6 curriculum. Active in tree-planting and environmental education programs in partnership with the local barangay.",
    programs: ["K–6 Complete Elementary Curriculum", "Environmental Education Program", "Gulayan sa Paaralan"],
  },
  {
    id: "lolomboy-es",
    name: "Lolomboy Elementary School",
    ownership: "public",
    level: "elementary",
    barangay: "Lolomboy",
    description:
      "Serving one of Bocaue's most populated barangays, Lolomboy Elementary implements DepEd's K–6 curriculum with additional focus on Science and Technology integration and active participation in Division competitions.",
    programs: ["K–6 Complete Elementary Curriculum", "Science Club", "Brigada Eskwela Program"],
  },
  {
    id: "taal-es",
    name: "Taal Elementary School",
    ownership: "public",
    level: "elementary",
    barangay: "Taal",
    description:
      "Public elementary school in Barangay Taal implementing the DepEd K–6 framework. Known for its active student organizations and community-oriented projects coordinated with the barangay council.",
    programs: ["K–6 Complete Elementary Curriculum", "Student Government Program", "Community Outreach Activities"],
  },
  {
    id: "tambubong-es",
    name: "Tambubong Elementary School",
    ownership: "public",
    level: "elementary",
    barangay: "Tambubong",
    description:
      "A community-rooted public elementary school in Tambubong, providing quality foundational education and participating in DepEd's feeding program and early literacy initiatives.",
    programs: ["K–6 Complete Elementary Curriculum", "Early Literacy Program", "School Feeding Program"],
  },
  {
    id: "turo-es",
    name: "Turo Elementary School",
    ownership: "public",
    level: "elementary",
    barangay: "Turo",
    description:
      "One of the barangay-level elementary schools serving the outer communities of Bocaue. Implements the Gulayan sa Paaralan (school garden) program as part of food and nutrition education.",
    programs: ["K–6 Complete Elementary", "Gulayan sa Paaralan (School Garden)", "MTB-MLE Program"],
  },
  {
    id: "bolakan-es",
    name: "Bolakan Elementary School",
    ownership: "public",
    level: "elementary",
    barangay: "Bolakan",
    description:
      "Public elementary school serving the Bolakan community under the DepEd K–6 curriculum. Recognized for its active participation in cultural programs and sports tournaments at the district level.",
    programs: ["K–6 Complete Elementary Curriculum", "Cultural Arts Program", "District Sports Competitions"],
  },
  {
    id: "northville-v-es",
    name: "Northville V Elementary School",
    ownership: "public",
    level: "elementary",
    barangay: "Lolomboy",
    description:
      "A public elementary school established to serve the growing residential community of Northville V. Implements the full DepEd K–6 curriculum with strong parent-teacher community involvement.",
    programs: ["K–6 Complete Elementary Curriculum", "PTCA Programs", "Reading Intervention"],
  },
  {
    id: "bocaue-hills-es",
    name: "Bocaue Hills Elementary School",
    ownership: "public",
    level: "elementary",
    barangay: "Batia",
    description:
      "Serving the Bocaue Hills subdivision community, this public elementary school provides accessible quality education under the DepEd K–6 curriculum to pupils from the surrounding residential areas.",
    programs: ["K–6 Complete Elementary Curriculum", "Numeracy & Literacy Program", "Brigada Eskwela"],
  },
  {
    id: "sta-martha-es",
    name: "St. Martha Elementary School",
    ownership: "public",
    level: "elementary",
    barangay: "Wakas",
    description:
      "A public elementary school named after St. Martha, delivering the DepEd K–6 curriculum to pupils from Wakas and neighboring barangays, with emphasis on values formation and academic excellence.",
    programs: ["K–6 Complete Elementary Curriculum", "Values Formation Program", "School-Based Reading Program"],
  },

  // ── Public Secondary Schools ─────────────────────────────────────
  {
    id: "batia-hs",
    name: "Batia High School",
    ownership: "public",
    level: "junior-high",
    barangay: "Batia",
    description:
      "A public secondary school in Barangay Batia offering the complete Junior High School curriculum under DepEd. Known for its competitive sports teams and active Supreme Student Government.",
    programs: ["Junior High School Complete Curriculum (Gr. 7–10)", "School Sports Program", "SSG Leadership Program"],
  },
  {
    id: "lolomboy-nhs",
    name: "Lolomboy National High School",
    ownership: "public",
    level: "junior-high",
    barangay: "Lolomboy",
    description:
      "A DepEd national high school serving the students of Lolomboy and surrounding barangays, with a full Junior High School curriculum and strong involvement in Division-level academic and extracurricular competitions.",
    programs: ["Junior High School Complete Curriculum (Gr. 7–10)", "Academic Bowl Teams", "Community Immersion Program"],
  },
  {
    id: "taal-hs",
    name: "Taal High School",
    ownership: "public",
    level: "junior-high",
    barangay: "Taal",
    description:
      "Public secondary school in Barangay Taal delivering the DepEd Junior High School curriculum. Engages students in values formation, academic achievement, and service-learning activities.",
    programs: ["Junior High School Complete Curriculum (Gr. 7–10)", "Reading Literacy Program", "Service-Learning Projects"],
  },
  {
    id: "bambang-nhs",
    name: "Iluminada Mendoza-Roxas Memorial High School",
    ownership: "public",
    level: "junior-high",
    barangay: "Bambang",
    description:
      "Officially named the Iluminada Mendoza-Roxas Memorial High School and locally known as Bambang National High School, this public secondary school serves the students of Bambang and nearby areas with the full DepEd Junior High School curriculum.",
    programs: ["Junior High School Complete Curriculum (Gr. 7–10)", "Technology & Livelihood Education", "Journalism & Student Publication"],
  },

  // ── Private Elementary & Secondary Schools ───────────────────────
  {
    id: "academia-sta-cruz",
    name: "Academia de Sta. Cruz",
    ownership: "private",
    level: "integrated",
    barangay: "Bocaue Town Center",
    description:
      "A private Catholic school in Bocaue offering quality basic education from Grade School through High School, guided by Christian values and a holistic approach to student development.",
    programs: ["Grade School Curriculum (K–6)", "Junior High School (Gr. 7–10)", "Senior High School"],
  },
  {
    id: "bocaue-adventist-es",
    name: "Bocaue Adventist Elementary School",
    ownership: "private",
    level: "elementary",
    barangay: "Bocaue Town Center",
    description:
      "A private Seventh-day Adventist school providing faith-integrated elementary education. Emphasizes character development, spiritual growth, and academic excellence in a nurturing Christian environment.",
    programs: ["K–6 Elementary Curriculum", "Christian Values Formation", "Health & Wellness Education"],
  },
  {
    id: "corinthian-school",
    name: "Corinthian School",
    ownership: "private",
    level: "integrated",
    barangay: "Bocaue Town Center",
    description:
      "A private school in Bocaue offering a comprehensive basic education program from Grade School to High School, committed to developing well-rounded students grounded in academic excellence and good values.",
    programs: ["Grade School Curriculum", "Junior High School", "Senior High School"],
  },
  {
    id: "divine-world-learning",
    name: "Divine World Learning School",
    ownership: "private",
    level: "integrated",
    barangay: "Bocaue Town Center",
    description:
      "A private learning institution in Bocaue providing integrated basic education anchored in Christian principles, nurturing students academically, morally, and spiritually from the early grades through high school.",
    programs: ["Grade School Curriculum", "Junior High School", "Faith-Based Values Program"],
  },
  {
    id: "friends-of-jesus",
    name: "Friends of Jesus Christian School",
    ownership: "private",
    level: "integrated",
    barangay: "Bocaue Town Center",
    description:
      "A Christian school in Bocaue integrating Biblical principles with a quality academic curriculum, fostering a Christ-centered learning environment for students from kindergarten through high school.",
    programs: ["Kindergarten & Grade School", "Junior High School", "Christian Living & Values Education"],
  },
  {
    id: "integrated-school-montessori",
    name: "Integrated School of Montessori",
    ownership: "private",
    level: "integrated",
    barangay: "Bocaue Town Center",
    description:
      "A private school in Bocaue applying the Montessori educational philosophy alongside the standard DepEd curriculum, promoting child-centered, hands-on learning that develops independence and critical thinking from the early years.",
    programs: ["Montessori Kindergarten & Preschool", "Grade School Curriculum", "Junior High School"],
  },
  {
    id: "nehemiah-standard-academy",
    name: "Nehemiah Standard Academy",
    ownership: "private",
    level: "integrated",
    barangay: "Bocaue Town Center",
    description:
      "A private Christian school in Bocaue offering basic education animated by Biblical standards and committed to developing students of character, integrity, and academic competence.",
    programs: ["Grade School Curriculum", "Junior High School", "Christian Character Formation Program"],
  },
  {
    id: "our-lady-of-fatima-academy",
    name: "Our Lady of Fatima Academy",
    ownership: "private",
    level: "integrated",
    barangay: "Bocaue Town Center",
    description:
      "A Catholic private school in Bocaue bearing the patronage of Our Lady of Fatima, providing integrated basic education from Grade School through High School with emphasis on faith, service, and academic excellence.",
    programs: ["Grade School Curriculum (K–6)", "Junior High School (Gr. 7–10)", "Senior High School", "Religious & Values Education"],
  },
  {
    id: "st-francis-lyceum",
    name: "St. Francis Lyceum",
    ownership: "private",
    level: "integrated",
    barangay: "Bocaue Town Center",
    description:
      "A private school in Bocaue named after St. Francis of Assisi, offering a complete basic education program that integrates Franciscan values of simplicity, humility, and care for creation with a strong academic curriculum.",
    programs: ["Grade School Curriculum", "Junior High School", "Senior High School", "Values Formation & Social Responsibility"],
  },
  {
    id: "st-john-academy-bayanihan",
    name: "St. John Academy of Bayanihan",
    ownership: "private",
    level: "integrated",
    barangay: "Bayanihan",
    description:
      "Located in the Bayanihan community of Bocaue, St. John Academy provides accessible private basic education grounded in Christian values, serving families in Bayanihan and surrounding neighborhoods.",
    programs: ["Grade School Curriculum", "Junior High School", "Character Development Program"],
  },
  {
    id: "jilcf-sintang-paaralan",
    name: "JILCF Sintang Paaralan",
    ownership: "private",
    level: "integrated",
    barangay: "Bocaue Town Center",
    description:
      "A school under the Jesus Is Lord Church Foundation, Sintang Paaralan delivers faith-based basic education integrating the DepEd curriculum with Christian formation and community values.",
    programs: ["Grade School Curriculum", "Junior High School", "Christian Living & Formation"],
  },
  {
    id: "sto-nino-academy",
    name: "Sto. Niño Academy",
    ownership: "private",
    level: "integrated",
    barangay: "Bocaue Town Center",
    description:
      "A private Catholic school under the patronage of the Holy Child Jesus (Sto. Niño), offering basic education from Grade School through High School anchored in devotion, service, and academic rigor.",
    programs: ["Grade School Curriculum (K–6)", "Junior High School", "Religious Formation Program"],
  },

  // ── Higher Education / Colleges ──────────────────────────────────
  {
    id: "bulacan-polytechnic-college",
    name: "Bulacan Polytechnic College",
    ownership: "public",
    level: "college",
    barangay: "Bocaue Town Center",
    description:
      "A government-run polytechnic college in Bocaue offering technical and professional degree programs aligned with industry needs. Provides affordable higher education to students from Bocaue and neighboring municipalities.",
    programs: ["BS Industrial Technology", "Bachelor of Technical-Vocational Teacher Education", "BS Business Administration", "Associate in Computer Technology"],
  },
  {
    id: "dr-yangas",
    name: "Dr. Yanga's Colleges, Inc.",
    ownership: "private",
    level: "college",
    barangay: "Bocaue Town Center",
    description:
      "One of the premier private educational institutions in Bocaue and the surrounding Bulacan municipalities. Dr. Yanga's Colleges has been producing competent graduates across business, education, and health sciences since its founding.",
    logo: "/images/logos/schools/dr-yangas.png",
    programs: ["BS Business Administration", "BS Accountancy", "Bachelor of Elementary Education", "Bachelor of Secondary Education", "BS Nursing", "BS Criminology"],
    yearEstablished: "1946",
  },
  {
    id: "jilcf-inc",
    name: "Jesus Is Lord Colleges Foundation, Inc.",
    ownership: "private",
    level: "college",
    barangay: "Bocaue Town Center",
    description:
      "A private Christian higher education institution under the Jesus Is Lord Church Foundation, offering collegiate programs guided by Biblical principles and a commitment to producing graduates of integrity and professional competence.",
    programs: ["BS Business Administration", "Bachelor of Elementary Education", "BS Information Technology", "Christian Ministry Program"],
  },
  {
    id: "mt-carmel-college",
    name: "Mt. Carmel College",
    ownership: "private",
    level: "college",
    barangay: "Bocaue Town Center",
    description:
      "A private Catholic college in Bocaue operated under the patronage of Our Lady of Mt. Carmel, offering higher education programs anchored in Carmelite spirituality and dedicated to excellence in academic formation.",
    programs: ["BS Nursing", "BS Midwifery", "Bachelor of Elementary Education", "BS Business Administration"],
  },
  {
    id: "st-paul-college",
    name: "St. Paul College",
    ownership: "private",
    level: "college",
    barangay: "Bocaue Town Center",
    description:
      "A private college in Bocaue offering collegiate programs informed by the Pauline tradition of learning, service, and evangelization, preparing graduates for professional and civic roles in the community.",
    programs: ["BS Business Administration", "BS Accountancy", "Bachelor in Elementary Education", "BS Computer Science"],
  },
  {
    id: "colegio-de-san-martin",
    name: "Colegio de San Martin",
    ownership: "private",
    level: "college",
    barangay: "Bocaue Town Center",
    description:
      "Named after the municipality's patron saint, St. Martin of Tours, Colegio de San Martin is a private college in Bocaue offering higher education programs that blend rigorous academics with the values of charity, humility, and service.",
    programs: ["BS Business Administration", "Bachelor of Elementary Education", "BS Criminology", "Associate Programs"],
  },
]

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

// ── Barangays ────────────────────────────────────────────────────────
export interface Barangay {
  id: string
  name: string
  captain: string
  address: string
  contact?: string
  population?: string
  description: string
  image?: string
}

export const barangays: Barangay[] = [
  {
    id: "bambang",
    name: "Bambang",
    captain: "Hon. Ricardo S. Santos",
    address: "Barangay Hall, Bambang, Bocaue, Bulacan",
    contact: "(044) 123-4001",
    population: "~8,500",
    description:
      "One of Bocaue's agricultural barangays, Bambang is known for its rice fields, community cooperatives, and the annual Araw ng Bambang celebration.",
  },
  {
    id: "batia",
    name: "Batia",
    captain: "Hon. Elena M. Reyes",
    address: "Barangay Hall, Batia, Bocaue, Bulacan",
    contact: "(044) 123-4002",
    population: "~6,200",
    description:
      "A quiet residential barangay with growing commercial activity along its main road, Batia is home to several private schools and small cottage industries.",
  },
  {
    id: "binang",
    name: "Biñang",
    captain: "Hon. Fernando C. Dela Cruz",
    address: "Barangay Hall, Biñang 1st & 2nd, Bocaue, Bulacan",
    contact: "(044) 123-4003",
    population: "~5,800",
    description:
      "Divided into Biñang 1st and 2nd, this barangay preserves a strong sense of tradition with active participation in the Pagoda Festival and parish activities.",
  },
  {
    id: "bunlo",
    name: "Bunlo",
    captain: "Hon. Jose P. Garcia",
    address: "Barangay Hall, Bunlo, Bocaue, Bulacan",
    contact: "(044) 123-4004",
    population: "~7,100",
    description:
      "A riverside barangay along the Bocaue River, Bunlo has deep connections to the Pagoda Festival and is known for its fishing heritage and boat-building traditions.",
  },
  {
    id: "sulucan",
    name: "Sulucan",
    captain: "Hon. Maria L. Bautista",
    address: "Barangay Hall, Sulucan, Bocaue, Bulacan",
    contact: "(044) 123-4005",
    population: "~5,400",
    description:
      "A predominantly residential barangay, Sulucan is recognized for its well-organized community programs and active Sangguniang Kabataan.",
  },
  {
    id: "taal",
    name: "Taal",
    captain: "Hon. Roberto A. Lim",
    address: "Barangay Hall, Taal, Bocaue, Bulacan",
    contact: "(044) 123-4006",
    population: "~9,300",
    description:
      "One of the larger barangays in Bocaue, Taal straddles the national highway and hosts numerous commercial establishments, schools, and residential subdivisions.",
  },
  {
    id: "wakas",
    name: "Wakas",
    captain: "Hon. Angelina T. Navarro",
    address: "Barangay Hall, Wakas, Bocaue, Bulacan",
    contact: "(044) 123-4007",
    population: "~11,000",
    description:
      "Bocaue's most densely populated barangay, Wakas is a vibrant commercial and residential hub with a bustling market area and proximity to the NLEX interchange.",
  },
  {
    id: "lolomboy",
    name: "Lolomboy",
    captain: "Hon. Carlos V. Mendoza",
    address: "Barangay Hall, Lolomboy, Bocaue, Bulacan",
    contact: "(044) 123-4008",
    population: "~15,000",
    description:
      "The most populous barangay in Bocaue, Lolomboy features large residential subdivisions, SM City Bocaue, and serves as the municipality's major urban growth center.",
  },
  {
    id: "tambubong",
    name: "Tambubong",
    captain: "Hon. Patricia G. Ocampo",
    address: "Barangay Hall, Tambubong, Bocaue, Bulacan",
    contact: "(044) 123-4009",
    population: "~4,800",
    description:
      "A historically agricultural barangay, Tambubong is transitioning into a mixed residential-commercial area while maintaining strong cultural ties to Bocaue's farming heritage.",
  },
  {
    id: "turo",
    name: "Turo",
    captain: "Hon. Daniel R. Cruz",
    address: "Barangay Hall, Turo, Bocaue, Bulacan",
    contact: "(044) 123-4010",
    population: "~6,000",
    description:
      "Located near the municipal center, Turo is known for its accessibility and service-oriented community, with a health center that serves as a model BHC in the municipality.",
  },
  {
    id: "bunducan",
    name: "Bunducan",
    captain: "Hon. Marites S. Aquino",
    address: "Barangay Hall, Bunducan, Bocaue, Bulacan",
    contact: "(044) 123-4011",
    population: "~4,500",
    description:
      "A peaceful barangay with a strong sense of community, Bunducan is noted for its annual barangay fiesta, cooperative-driven livelihood projects, and active senior citizens' association.",
  },
  {
    id: "poblacion",
    name: "Poblacion",
    captain: "Hon. Rafael M. Gonzales",
    address: "Barangay Hall, Poblacion, Bocaue, Bulacan",
    contact: "(044) 123-4012",
    population: "~7,500",
    description:
      "The town center of Bocaue, Poblacion is home to the Municipal Hall, St. Martin of Tours Church, the public market, and the historic town plaza — the civic and cultural heart of the municipality.",
  },
  {
    id: "duhat",
    name: "Duhat",
    captain: "Hon. Lorena V. Santos",
    address: "Barangay Hall, Duhat, Bocaue, Bulacan",
    contact: "(044) 123-4013",
    population: "~5,000",
    description:
      "Named after the native Java plum tree, Duhat is a close-knit barangay with active youth programs, a dedicated sports court, and growing residential areas along its periphery.",
  },
  {
    id: "bolakan",
    name: "Bolakan",
    captain: "Hon. Antonio F. Villanueva",
    address: "Barangay Hall, Bolakan, Bocaue, Bulacan",
    contact: "(044) 123-4014",
    population: "~3,200",
    description:
      "One of Bocaue's smaller barangays, Bolakan maintains a tight-knit rural character with community-based livelihood programs and active participation in inter-barangay sports leagues.",
  },
]
