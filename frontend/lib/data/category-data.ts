import { asset } from "@/lib/utils"

export type CategoryType = "history" | "arts-business" | "tourism" | "culinary"

export interface CategoryPlace {
  id: string
  title: string
  description: string
  shortDescription: string
  image: string
  category: CategoryType
  location?: string
  highlights?: string[]
}

export const categoryData: Record<CategoryType, { title: string; icon: string; description: string; heroImage: string }> = {
  history: {
    title: "History Wonders",
    icon: "📜",
    description: "Explore historical landmarks and heritage sites that showcase Bocaue's rich cultural legacy",
    heroImage: asset("/images/places/Church.JPG"),
  },
  "arts-business": {
    title: "Arts and Business Wonders",
    icon: "🎨",
    description: "Discover art galleries, business districts, and creative spaces in Bocaue",
    heroImage: asset("/images/places/Arts.JPG"),
  },
  tourism: {
    title: "Tourism Wonders",
    icon: "✈️",
    description: "Visit top tourist attractions and destinations perfect for travelers and adventurers",
    heroImage: asset("/images/places/Arena.JPG"),
  },
  culinary: {
    title: "Culinary Wonders",
    icon: "🍽️",
    description: "Experience local cuisines and dining experiences that showcase Bocaue's flavors",
    heroImage: asset("/images/places/Food.JPG"),
  },
}

export const categoryPlaces: Record<CategoryType, CategoryPlace[]> = {
  history: [
    {
      id: "st-martin-church",
      title: "St. Martin of Tours Church",
      shortDescription: "Historic Spanish-era church standing for centuries as a symbol of faith",
      description:
        "A beautifully preserved Spanish-colonial church dating back to the 1600s, featuring Baroque architecture and hand-carved retablos. The spiritual heart of Bocaue's religious heritage.",
      image: asset("/images/places/Church.JPG"),
      category: "history",
      location: "Bocaue Town Center, Bulacan",
      highlights: [
        "One of the oldest parishes in Bulacan",
        "Baroque-style stone church with hand-carved details",
        "Patron saint: St. Martin of Tours (Feast day: November 11)",
        "Spiritual center of the Bocaue River Festival",
      ],
    },
    {
      id: "bocaue-historical-markers",
      title: "Historical Markers & Town Heritage",
      shortDescription: "Discover markers documenting Bocaue's journey through time",
      description:
        "Throughout Bocaue, historical markers and monuments commemorate significant events and figures that shaped the town's development from Spanish colonial times to modern era.",
      image: asset("/images/places/Church.JPG"),
      category: "history",
      location: "Various locations in Bocaue",
      highlights: [
        "Marking major historical events and figures",
        "Spanish colonial heritage documentation",
        "Town development timeline",
        "Community gathering places for heritage celebration",
      ],
    },
    {
      id: "bocaue-river-folklore",
      title: "Bocaue River - Folklore & Heritage",
      shortDescription: "Experience the cultural significance of Bocaue's iconic river",
      description:
        "The Bocaue River is more than a geographic feature—it's the narrative thread of the town's story, from ancient fishing traditions to spiritual processions that echo through centuries.",
      image: asset("/images/places/Church.JPG"),
      category: "history",
      location: "Bocaue River, Bulacan",
      highlights: [
        "Pre-colonial fishing and trade hub",
        "Spiritual significance in local culture",
        "Home to the famous Pagoda River Festival",
        "Living connection to the town's origins",
      ],
    },
    {
      id: "colonial-architecture-tour",
      title: "Colonial Architecture Heritage Tour",
      shortDescription: "Walk through streets lined with Spanish-era architectural influences",
      description:
        "Bocaue preserves examples of Spanish colonial architecture, including residential houses with bahay na bato styling and municipal buildings reflecting centuries of design tradition.",
      image: asset("/images/places/Church.JPG"),
      category: "history",
      location: "Bocaue Town Proper",
      highlights: [
        "Bahay na bato architectural style",
        "Municipal heritage buildings",
        "Street layout following Spanish grid patterns",
        "Living museum of architectural evolution",
      ],
    },
  ],
  "arts-business": [
    {
      id: "bocaue-artisan-village",
      title: "Bocaue Artisan Crafts Center",
      shortDescription: "Meet traditional craftspeople creating handmade fireworks and crafts",
      description:
        "Bocaue has a centuries-old tradition of artisan craftsmanship, from handmade pyrotechnics to traditional weaving. Visit workshops where skilled artisans practice their craft using methods passed down through generations.",
      image: asset("/images/places/Arts.JPG"),
      category: "arts-business",
      location: "Bocaue Artisan Districts",
      highlights: [
        "Handmade pyrotechnics demonstrations",
        "Traditional weaving workshops",
        "Family-run craft businesses",
        "Direct purchase of authentic local crafts",
      ],
    },
    {
      id: "creative-districts",
      title: "Bocaue Creative & Business Districts",
      shortDescription: "Explore emerging creative hubs and commercial centers",
      description:
        "Modern Bocaue is home to vibrant creative districts where local entrepreneurs, artists, and small businesses thrive. Visit galleries, workshops, and studios showcasing contemporary and traditional art.",
      image: asset("/images/places/Arts.JPG"),
      category: "arts-business",
      location: "Various business zones in Bocaue",
      highlights: [
        "Contemporary art galleries and exhibitions",
        "Small business incubation centers",
        "Artist studios and workshops",
        "Local entrepreneur showcases",
      ],
    },
    {
      id: "macarthur-highway-commerce",
      title: "MacArthur Highway Commercial Hub",
      shortDescription: "The economic heartbeat of Bocaue's business community",
      description:
        "MacArthur Highway is the bustling commercial center of Bocaue, lined with shops, restaurants, and businesses. It's the perfect place to experience local commerce and entrepreneurship.",
      image: asset("/images/places/Arts.JPG"),
      category: "arts-business",
      location: "MacArthur Highway, Bocaue",
      highlights: [
        "Traditional and modern retail shops",
        "Local restaurants and food establishments",
        "Family-owned businesses",
        "Shopping and commerce hub",
      ],
    },
    {
      id: "cultural-shows-performances",
      title: "Cultural Shows & Performance Venues",
      shortDescription: "Experience authentic cultural performances and artistic expressions",
      description:
        "Throughout the year, Bocaue hosts cultural shows, theater performances, and artistic events celebrating local talent and heritage. From street performances to stage productions.",
      image: asset("/images/places/Arts.JPG"),
      category: "arts-business",
      location: "Various venues in Bocaue",
      highlights: [
        "Local theater and performing arts",
        "Street festivals and performances",
        "Cultural celebration showcases",
        "Community talent platforms",
      ],
    },
  ],
  tourism: [
    {
      id: "philippine-arena",
      title: "Philippine Arena - The Largest Indoor Arena",
      shortDescription: "World's largest indoor arena hosting world-class events",
      description:
        "An architectural marvel and Guinness World Record holder, the Philippine Arena can seat 55,000 people. Experience the scale and grandeur of this engineering wonder located right in Bocaue.",
      image: asset("/images/places/philippine-arena.jpg"),
      category: "tourism",
      location: "Ciudad de Victoria, Bocaue, Bulacan",
      highlights: [
        "Guinness World Record - largest indoor mixed-use arena",
        "55,000 seating capacity",
        "Hosts international concerts and sports events",
        "World-class event facilities",
      ],
    },
    {
      id: "bocaue-river-festival-experience",
      title: "Bocaue River Festival - Annual Celebration",
      shortDescription: "Witness the legendary fluvial parade and week-long festivities",
      description:
        "The Bocaue River Festival is a spectacular week-long celebration featuring the iconic pagoda fluvial procession, cultural shows, street dancing, and thousands of visitors from around the world.",
      image: asset("/images/places/Arena.JPG"),
      category: "tourism",
      location: "Bocaue River, Bulacan",
      highlights: [
        "Over 235 years of tradition",
        "Iconic pagoda fluvial procession",
        "Week-long festivities and cultural shows",
        "One of Bulacan's most significant festivals",
      ],
    },
    {
      id: "bocaue-nature-tourism",
      title: "Bocaue Riverbank Nature & Adventure",
      shortDescription: "Scenic walks and nature experiences along the historic river",
      description:
        "Escape the hustle and bustle with tranquil nature walks along the Bocaue River. Enjoy birdwatching, photography opportunities, and the serene beauty of the river landscape.",
      image: asset("/images/places/Arena.JPG"),
      category: "tourism",
      location: "Bocaue River, accessible from Town Center",
      highlights: [
        "Scenic shaded walking paths",
        "Birdwatching opportunities (herons, kingfishers)",
        "Photography-friendly spots",
        "Family-friendly outdoor activities",
      ],
    },
    {
      id: "ciudad-de-victoria",
      title: "Ciudad de Victoria - Modern Urban Development",
      shortDescription: "Experience modern Bocaue with world-class facilities and communities",
      description:
        "Home to the Philippine Arena and mixed-use developments, Ciudad de Victoria represents Bocaue's modernization while maintaining its cultural identity. Shopping, dining, and entertainment all in one complex.",
      image: asset("/images/places/Arena.JPG"),
      category: "tourism",
      location: "Ciudad de Victoria, Bocaue",
      highlights: [
        "World-class venue - Philippine Arena",
        "Modern shopping and entertainment",
        "Residential and commercial spaces",
        "Cultural event hosting capabilities",
      ],
    },
  ],
  culinary: [
    {
      id: "bocaue-chicharon-king",
      title: "Bocaue Chicharon - The Legendary Crispy Pork Skin",
      shortDescription: "Taste the famous crispy delicacy that put Bocaue on the national food map",
      description:
        "Bocaue is renowned nationwide for its exceptional chicharon—deep-fried pork rind with an incomparable crunch. Perfected through generations, these crispy treats are made using traditional double-fry methods and secret family recipes.",
      image: asset("/images/places/Food.JPG"),
      category: "culinary",
      location: "MacArthur Highway, Bocaue",
      highlights: [
        "Crispy perfection through double-fry tradition",
        "Family recipes passed down for generations",
        "Nationally famous and sought-after",
        "Available from multiple local producers",
      ],
    },
    {
      id: "traditional-rice-cakes",
      title: "Traditional Kakanin - Rice Cakes Heritage",
      shortDescription: "Discover authentic Bulacan rice cakes with centuries-old traditions",
      description:
        "Bocaue's kakanin (rice cakes) are made using ancestral recipes. Taste suman wrapped in banana leaves, bibingka baked over charcoal, colorful puto, and other delicacies that represent authentic Bulacan cuisine.",
      image: asset("/images/places/Food.JPG"),
      category: "culinary",
      location: "Local markets and bakeries in Bocaue",
      highlights: [
        "Suman wrapped in banana leaves",
        "Bibingka baked over charcoal",
        "Colorful puto and other delicacies",
        "Pre-colonial culinary traditions alive",
      ],
    },
    {
      id: "local-restaurants-dining",
      title: "Bocaue Local Restaurants & Dining",
      shortDescription: "Experience authentic Bocaue cuisine at family-run establishments",
      description:
        "From casual eateries to well-established restaurants, Bocaue's dining scene celebrates local flavors. Enjoy traditional Bulacan dishes prepared fresh using local ingredients and time-honored recipes.",
      image: asset("/images/places/Food.JPG"),
      category: "culinary",
      location: "Various locations in Bocaue",
      highlights: [
        "Family-run establishments with heritage recipes",
        "Fresh local ingredients",
        "Traditional Bulacan cuisine",
        "Authentic dining experiences",
      ],
    },
    {
      id: "food-festival-events",
      title: "Bocaue Food Festival & Culinary Events",
      shortDescription: "Celebrate local cuisine at Bocaue's vibrant food festivals",
      description:
        "Throughout the year, Bocaue hosts food-related festivals and cook-offs where local chefs and home cooks showcase their culinary talents. Part of the River Festival and other cultural celebrations.",
      image: asset("/images/places/Food.JPG"),
      category: "culinary",
      location: "Various festival locations in Bocaue",
      highlights: [
        "Annual cook-offs and food competitions",
        "Display of local culinary talents",
        "Tasting opportunities for traditional dishes",
        "Cultural celebration through food",
      ],
    },
  ],
}

export function getCategoryPlaces(category: CategoryType) {
  return categoryPlaces[category] || []
}

export function getAllCategories() {
  return Object.keys(categoryData) as CategoryType[]
}
