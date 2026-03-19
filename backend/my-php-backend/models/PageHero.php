<?php
namespace App\Models;

use PDO;

/**
 * PageHero Model — manages per-page hero image/text configuration.
 * Stores data in the `config` table with config_group = 'page_hero_{slug}'.
 *
 * Each page hero has: imageUrl, label, title, description, iconName, accentColor
 */

class PageHero
{
    private PDO $conn;

    /** All supported page slugs with their default values */
    private const PAGES = [
        'destinations' => [
            'displayName'  => 'Tourist Destinations',
            'imageUrl'     => '/images/places/oldtownbocaue.jpg',
            'iconName'     => 'Landmark',
            'accentColor'  => 'amber-300',
            'label'        => 'Bocaue Wonders',
            'title'        => 'Tourist Destinations',
            'description'  => 'From heritage churches to riverside views — explore Bocaue\'s most iconic sites and sacred places.',
        ],
        'culture' => [
            'displayName'  => 'Arts & Culture',
            'imageUrl'     => '/images/places/oldtownbocaue.jpg',
            'iconName'     => 'Sparkles',
            'accentColor'  => 'amber-300',
            'label'        => 'Bocaue Wonders',
            'title'        => 'Arts & Culture',
            'description'  => 'Immerse yourself in the rich heritage, living traditions, and vibrant festivals that make Bocaue a cultural treasure of Bulacan.',
        ],

        'history' => [
            'displayName'  => 'History of Bocaue',
            'imageUrl'     => '/images/places/oldtownbocaue.jpg',
            'iconName'     => 'BookOpen',
            'accentColor'  => 'amber-300',
            'label'        => 'Bocaue Wonders',
            'title'        => 'History of Bocaue',
            'description'  => 'A town shaped by faith, revolution, and culture — discover the story of Bocaue.',
        ],
        'events' => [
            'displayName'  => 'Municipal Events',
            'imageUrl'     => '/images/places/river-festival.jpg',
            'iconName'     => 'CalendarDays',
            'accentColor'  => 'cyan-300',
            'label'        => 'Events',
            'title'        => 'Municipal Events',
            'description'  => 'Stay updated with the latest municipal events, festivals, and community gatherings in Bocaue.',
        ],
        'news' => [
            'displayName'  => 'News & Blog',
            'imageUrl'     => '/images/places/oldtownbocaue.jpg',
            'iconName'     => 'Megaphone',
            'accentColor'  => 'blue-300',
            'label'        => 'News & Blog',
            'title'        => 'Stay Informed & Updated',
            'description'  => 'Latest announcements, updates, and stories from the heart of Bocaue.',
        ],
        'inquire' => [
            'displayName'  => 'Tourist Inquiry',
            'imageUrl'     => '/images/places/river-festival.jpg',
            'iconName'     => '',
            'accentColor'  => 'cyan-300',
            'label'        => 'Tourism',
            'title'        => 'Tourist Inquiry & Registration',
            'description'  => 'Fill out the form below and we will get back to you with all the information you need.',
        ],
        'mission-vision' => [
            'displayName'  => 'Mission & Vision',
            'imageUrl'     => '/images/places/river-festival.jpg',
            'iconName'     => '',
            'accentColor'  => 'cyan-300',
            'label'        => 'MHACTO Bocaue',
            'title'        => 'Mission & Vision',
            'description'  => 'Guiding principles of the Municipal History, Arts, Culture and Tourism Office.',
        ],
        'tourism-office' => [
            'displayName'  => 'Tourism Office',
            'imageUrl'     => '/images/places/oldtownbocaue.jpg',
            'iconName'     => 'Building2',
            'accentColor'  => 'cyan-300',
            'label'        => 'Organization',
            'title'        => 'Tourism Office',
            'description'  => 'The Municipal History, Arts, Culture and Tourism Office of Bocaue, Bulacan.',
        ],
        'travel-tours' => [
            'displayName'  => 'Travel & Tours',
            'imageUrl'     => '/images/places/river-festival.jpg',
            'iconName'     => 'Map',
            'accentColor'  => 'cyan-300',
            'label'        => 'Tourism',
            'title'        => 'Travel & Tours',
            'description'  => 'Curated tour packages by MHACTO Bocaue — discover the best of our municipality.',
        ],

        // ── Child / sub-pages ──────────────────────────────────────

        'local-cuisine' => [
            'displayName'  => 'Local Cuisine',
            'imageUrl'     => '/images/places/Food.jpg',
            'iconName'     => 'Utensils',
            'accentColor'  => 'amber-300',
            'label'        => 'Local Culinary',
            'title'        => 'Taste of Bocaue',
            'description'  => 'From legendary crispy chicharon to generations-old kakanin — explore the flavors, stories, and traditions behind Bocaue\'s most beloved delicacies.',
        ],
        'festivals-celebrations' => [
            'displayName'  => 'Festivals & Celebrations',
            'imageUrl'     => '/images/places/river-festival.jpg',
            'iconName'     => 'Sparkles',
            'accentColor'  => 'amber-300',
            'label'        => 'Culture',
            'title'        => 'Festivals & Celebrations',
            'description'  => 'The annual traditions and celebrations that bring Bocaue alive — from world-famous river festivals to intimate Christmas dawn masses.',
        ],
        'practices-traditions' => [
            'displayName'  => 'Cultural Practices & Traditions',
            'imageUrl'     => '/images/places/Arts.jpg',
            'iconName'     => 'Heart',
            'accentColor'  => 'pink-300',
            'label'        => 'Culture',
            'title'        => 'Cultural Practices & Traditions',
            'description'  => 'The living intangible heritage of Bocaue — practices passed down through generations that define the community\'s identity.',
        ],
        'crafts-artisan' => [
            'displayName'  => 'Crafts & Artisan',
            'imageUrl'     => '/images/places/Arts.jpg',
            'iconName'     => 'Hammer',
            'accentColor'  => 'amber-300',
            'label'        => 'Arts & Culture',
            'title'        => 'Crafts & Artisan',
            'description'  => 'Meet the master craftspeople of Bocaue — weavers, woodcarvers, potters, and pyrotechnics artists who keep centuries-old traditions alive with their hands and their hearts.',
        ],
        'people-wonders' => [
            'displayName'  => 'People Wonders',
            'imageUrl'     => '/images/places/Arts.jpg',
            'iconName'     => 'Users',
            'accentColor'  => 'pink-300',
            'label'        => 'Arts & Culture',
            'title'        => 'People Wonders',
            'description'  => 'Celebrating the remarkable living individuals of Bocaue — pageant queens, champion athletes, award-winning artists, civic heroes, and achievers who carry the pride of the town to the world.',
        ],
        'timeline' => [
            'displayName'  => 'Timeline of Events',
            'imageUrl'     => '/images/places/oldtownbocaue.jpg',
            'iconName'     => 'Clock',
            'accentColor'  => 'amber-300',
            'label'        => 'History',
            'title'        => 'Timeline of Events',
            'description'  => 'From pre-colonial settlements to modern milestones — a chronological journey through the rich history of Bocaue, Bulacan.',
        ],
        'notable-persons' => [
            'displayName'  => 'Notable Persons',
            'imageUrl'     => '/images/places/Arts.jpg',
            'iconName'     => 'Users',
            'accentColor'  => 'purple-300',
            'label'        => 'History',
            'title'        => 'Notable Persons',
            'description'  => 'The men and women of Bocaue whose lives, work, and sacrifice have shaped the identity and culture of the municipality.',
        ],
        'local-business' => [
            'displayName'  => 'Local Business',
            'imageUrl'     => '/images/places/Food.jpg',
            'iconName'     => 'Store',
            'accentColor'  => 'green-300',
            'label'        => 'Community',
            'title'        => 'Local Business',
            'description'  => 'The enterprises and industries rooted in Bocaue\'s culture and heritage, sustaining livelihoods for generations.',
        ],

        // ── Community sub-pages ────────────────────────────────────

        'schools' => [
            'displayName'  => 'Schools in Bocaue',
            'imageUrl'     => '/images/places/oldtownbocaue.jpg',
            'iconName'     => 'School',
            'accentColor'  => 'cyan-300',
            'label'        => 'Community',
            'title'        => 'Schools in Bocaue',
            'description'  => 'All public and private educational institutions shaping the next generation of Bocaueños.',
        ],
        'hospitals' => [
            'displayName'  => 'Hospitals & Health',
            'imageUrl'     => '/images/places/oldtownbocaue.jpg',
            'iconName'     => 'Activity',
            'accentColor'  => 'red-300',
            'label'        => 'Community',
            'title'        => 'Hospitals & Health',
            'description'  => 'Health facilities and medical services available to residents and visitors of Bocaue, Bulacan.',
        ],
        'pagoda' => [
            'displayName'  => 'Pagoda Festival',
            'imageUrl'     => '/images/places/river-festival.jpg',
            'iconName'     => 'Sparkles',
            'accentColor'  => 'amber-300',
            'label'        => 'Bocaue Wonders',
            'title'        => 'The Pagoda Festival',
            'description'  => 'A centuries-old river procession honoring the Holy Cross of Wawa — Bocaue\'s most iconic cultural tradition.',
        ],
        'barangays' => [
            'displayName'  => 'Barangays of Bocaue',
            'imageUrl'     => '/images/places/oldtownbocaue.jpg',
            'iconName'     => 'Landmark',
            'accentColor'  => 'emerald-300',
            'label'        => 'Community',
            'title'        => 'Barangays of Bocaue',
            'description'  => 'Explore the 14 barangays that make up the Municipality of Bocaue, Bulacan — each with its own identity, leadership, and community character.',
        ],
    ];

    private const HERO_FIELDS = ['imageUrl', 'iconName', 'accentColor', 'label', 'title', 'description'];

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    /**
     * Read all page heroes as an array keyed by page slug.
     * Returns defaults merged with any overrides from the config table.
     */
    public function readAll(): array
    {
        // Get all page_hero_* config rows in one query
        $stmt = $this->conn->prepare("
            SELECT config_group, config_key, config_value, data_type
            FROM config
            WHERE config_group LIKE 'page_hero_%'
        ");
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Group by slug
        $overrides = [];
        foreach ($rows as $row) {
            $slug = str_replace('page_hero_', '', $row['config_group']);
            $key = $row['config_key'];
            $overrides[$slug][$key] = $this->decodeValue($row['config_value'], $row['data_type'] ?? 'string');
        }

        // Merge defaults with overrides
        $result = [];
        foreach (self::PAGES as $slug => $defaults) {
            $hero = [
                'slug'        => $slug,
                'displayName' => $defaults['displayName'],
            ];
            foreach (self::HERO_FIELDS as $field) {
                $snakeKey = $this->camelToSnake($field);
                $hero[$field] = $overrides[$slug][$snakeKey] ?? $defaults[$field];
            }
            $result[] = $hero;
        }

        return $result;
    }

    /**
     * Read a single page hero by slug.
     */
    public function readBySlug(string $slug): ?array
    {
        if (!isset(self::PAGES[$slug])) {
            return null;
        }

        $group = 'page_hero_' . $slug;
        $stmt = $this->conn->prepare("
            SELECT config_key, config_value, data_type
            FROM config
            WHERE config_group = :g
        ");
        $stmt->execute([':g' => $group]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $overrides = [];
        foreach ($rows as $row) {
            $overrides[$row['config_key']] = $this->decodeValue($row['config_value'], $row['data_type'] ?? 'string');
        }

        $defaults = self::PAGES[$slug];
        $hero = [
            'slug'        => $slug,
            'displayName' => $defaults['displayName'],
        ];
        foreach (self::HERO_FIELDS as $field) {
            $snakeKey = $this->camelToSnake($field);
            $hero[$field] = $overrides[$snakeKey] ?? $defaults[$field];
        }

        return $hero;
    }

    /**
     * Update a page hero. Accepts camelCase fields.
     * Only writes fields present in the payload.
     */
    public function update(string $slug, array $data): ?array
    {
        if (!isset(self::PAGES[$slug])) {
            return null;
        }

        $group = 'page_hero_' . $slug;

        foreach (self::HERO_FIELDS as $field) {
            if (array_key_exists($field, $data)) {
                $snakeKey = $this->camelToSnake($field);
                $this->upsertKey($group, $snakeKey, $data[$field]);
            }
        }

        return $this->readBySlug($slug);
    }

    // ── Private helpers ────────────────────────────────────────────

    private function upsertKey(string $group, string $key, mixed $value, string $dataType = 'string'): void
    {
        $jsonValue = json_encode($value);
        $stmt = $this->conn->prepare("
            INSERT INTO config (config_group, config_key, config_value, data_type)
            VALUES (:g, :k, :v, :dt)
            ON DUPLICATE KEY UPDATE config_value = :v2, data_type = :dt2
        ");
        $stmt->execute([
            ':g'   => $group,
            ':k'   => $key,
            ':v'   => $jsonValue,
            ':dt'  => $dataType,
            ':v2'  => $jsonValue,
            ':dt2' => $dataType,
        ]);
    }

    private function decodeValue(string $jsonValue, string $dataType): mixed
    {
        $decoded = json_decode($jsonValue, true);
        if ($decoded === null && strtolower(trim($jsonValue)) !== 'null') {
            return $jsonValue;
        }
        return $decoded;
    }

    private function camelToSnake(string $input): string
    {
        return strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $input));
    }
}
