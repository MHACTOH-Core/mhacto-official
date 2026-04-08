<?php
use App\Config\Database;
use App\Core\Auth;
use App\Core\Response;

/**
 * Route: /api/office
 *
 * GET /api/office   — read all MHACTO Office content (public)
 * PUT /api/office   — update MHACTO Office content (admin only)
 *
 * Content is stored in the `config` table under config_group = 'office'.
 * Array fields (coreValues, objectives, orgStructure, programs) are JSON-encoded strings.
 */

function handle_office(string $method, ?string $param1, ?string $param2 = null): void
{
    try {
        $db = (new Database())->getConnection();

        switch ($method) {
            case 'GET':
                Response::json(_office_read($db));
                break;

            case 'PUT':
                Auth::requireRole(['super_admin', 'admin', 'content_manager']);
                $data = json_decode(file_get_contents('php://input'), true);
                if (!$data) Response::error('No data provided.', 400);

                _office_write($db, $data);
                Response::json([
                    'message' => 'Office content updated successfully.',
                    'content' => _office_read($db),
                ]);
                break;

            default:
                Response::error('Method not allowed.', 405);
        }
    } catch (Exception $e) {
        error_log("office error: " . $e->getMessage());
        Response::error('An internal error occurred.', 500);
    }
}

// ── Defaults ──────────────────────────────────────────────────────

function _office_defaults(): array
{
    return [
        'aboutP1' => 'The Municipal History, Arts, Culture and Tourism Office (MHACTO) is a department of the Bocaue Local Government Unit tasked with the preservation, promotion, and development of the municipality\'s historical, artistic, cultural, and tourism resources.',
        'aboutP2' => 'MHACTO is committed to the principle that culture and tourism are powerful engines for both economic development and community well-being — and that the only sustainable tourism is tourism that preserves what makes Bocaue unique.',
        'mission' => 'To document, preserve, and promote the history, arts, culture, and tourism of the Municipality of Bocaue, Bulacan — fostering a deep sense of community identity and pride while developing sustainable tourism programs that improve the quality of life of all Bocaueños.',
        'vision'  => 'A Bocaue that is recognized as a premier cultural heritage destination in the Philippines — where its rich past is celebrated, its living traditions are cherished, and its community is empowered through arts, culture, and tourism.',
        'coreValues' => [
            ['title' => 'Heritage Preservation', 'description' => 'We protect and promote Bocaue\'s tangible and intangible cultural heritage — from its 400-year-old church to its living traditions of weaving, balagtasan, and the Pagoda Festival.'],
            ['title' => 'Inclusive Tourism',      'description' => 'We develop tourism programs that benefit the whole community — ensuring that economic growth from tourism creates livelihoods for local artisans, food vendors, guides, and service providers.'],
            ['title' => 'Cultural Education',     'description' => 'We partner with schools, libraries, and youth organizations to cultivate pride in Bocaue\'s history and culture among the next generation of Bocaueños.'],
        ],
        'objectives' => [
            'Develop and manage heritage tourism programs that highlight Bocaue\'s historical and cultural assets.',
            'Document and preserve the municipality\'s tangible and intangible cultural heritage.',
            'Support local artisans, craftspeople, and culture bearers through recognition programs and market access.',
            'Promote Bocaue as a premier heritage tourism destination in Bulacan and Central Luzon.',
            'Foster community-based tourism through capacity building and livelihood programs.',
            'Coordinate with national agencies (NCCA, DOT, NHCP) for the protection of Bocaue\'s cultural properties.',
            'Organize and support cultural festivals, arts exhibitions, and civic heritage programs.',
            'Maintain and expand the MHACTO Heritage Gallery and community archives.',
        ],
        'orgStructure' => [
            ['name' => 'Office of the Mayor',         'role' => 'Chief Executive',                  'note' => 'oversees MHACTO direction'],
            ['name' => 'Tourism Officer',              'role' => 'Department Head',                  'note' => 'leads tourism planning & programs'],
            ['name' => 'Heritage & Culture Division',  'role' => 'Documentation & Preservation',    'note' => 'archives, research, intangible heritage'],
            ['name' => 'Arts & Events Division',       'role' => 'Programs & Events',               'note' => 'festivals, exhibits, cultural programs'],
            ['name' => 'Tourism Promotions Division',  'role' => 'Marketing & Partnerships',        'note' => 'tour packages, accreditation, DOT liaison'],
            ['name' => 'Administrative Division',      'role' => 'Administration & Records',        'note' => 'permits, coordination, records management'],
        ],
        'programs' => [
            ['title' => 'Heritage Gallery & Archives',              'description' => 'Maintains the MHACTO Heritage Gallery in the Old Municipal Hall, housing historical photographs, artifacts, documents, and oral history recordings spanning Bocaue\'s entire history.',                                                                                'badge' => 'Ongoing', 'badgeColor' => 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300'],
            ['title' => 'Living Cultural Heritage Bearer Program',  'description' => 'Identifies, recognizes, and supports master practitioners of Bocaue\'s endangered traditional arts — including weaving, woodcarving, and traditional performing arts.',                                                                                            'badge' => 'Ongoing', 'badgeColor' => 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300'],
            ['title' => 'Pagoda Festival Coordination',             'description' => 'Leads the annual coordination of the Bocaue Pagoda Festival in partnership with the Parish of St. Martin of Tours, the NCCA, and barangay governments.',                                                                                                           'badge' => 'Annual',  'badgeColor' => 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300'],
            ['title' => 'Heritage Tourism Package Development',     'description' => 'Designs and operates guided heritage tours, food trails, and festival immersion packages for individual visitors, school groups, and corporate tours.',                                                                                                              'badge' => 'Ongoing', 'badgeColor' => 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300'],
            ['title' => 'Bocaue Tourism Master Plan 2025–2030',     'description' => 'Implements the strategic roadmap for Bocaue\'s tourism development, including the Bocaue River Esplanade Project, heritage marker installation, and digital heritage archiving.',                                                                                   'badge' => '2025–2030','badgeColor' => 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300'],
            ['title' => 'School Heritage Education Program',        'description' => 'Partners with public schools in Bocaue to deliver heritage and culture modules in classrooms, organize school visits to the Heritage Gallery, and support student arts competitions.',                                                                               'badge' => 'Annual',  'badgeColor' => 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300'],
        ],
    ];
}

// ── Read ──────────────────────────────────────────────────────────

function _office_read(PDO $db): array
{
    $stmt = $db->prepare("SELECT config_key, config_value FROM config WHERE config_group = 'office'");
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_KEY_PAIR); // key => value

    if (empty($rows)) {
        return _office_defaults();
    }

    $defaults = _office_defaults();

    $decodeJson = function (string $key) use ($rows, $defaults) {
        if (!isset($rows[$key])) return $defaults[$key];
        $decoded = json_decode($rows[$key], true);
        return is_array($decoded) ? $decoded : $defaults[$key];
    };

    return [
        'aboutP1'      => isset($rows['about_p1'])  ? json_decode($rows['about_p1'], true)  ?? $defaults['aboutP1']  : $defaults['aboutP1'],
        'aboutP2'      => isset($rows['about_p2'])  ? json_decode($rows['about_p2'], true)  ?? $defaults['aboutP2']  : $defaults['aboutP2'],
        'mission'      => isset($rows['mission'])   ? json_decode($rows['mission'], true)   ?? $defaults['mission']  : $defaults['mission'],
        'vision'       => isset($rows['vision'])    ? json_decode($rows['vision'], true)    ?? $defaults['vision']   : $defaults['vision'],
        'coreValues'   => $decodeJson('core_values'),
        'objectives'   => $decodeJson('objectives'),
        'orgStructure' => $decodeJson('org_structure'),
        'programs'     => $decodeJson('programs'),
    ];
}

// ── Write ─────────────────────────────────────────────────────────

function _office_write(PDO $db, array $data): void
{
    $map = [
        'aboutP1'      => ['key' => 'about_p1',      'json' => false],
        'aboutP2'      => ['key' => 'about_p2',      'json' => false],
        'mission'      => ['key' => 'mission',        'json' => false],
        'vision'       => ['key' => 'vision',         'json' => false],
        'coreValues'   => ['key' => 'core_values',    'json' => true],
        'objectives'   => ['key' => 'objectives',     'json' => true],
        'orgStructure' => ['key' => 'org_structure',  'json' => true],
        'programs'     => ['key' => 'programs',       'json' => true],
    ];

    $stmt = $db->prepare("
        INSERT INTO config (config_group, config_key, config_value, data_type)
        VALUES ('office', :k, :v, :dt)
        ON DUPLICATE KEY UPDATE config_value = :v2, data_type = :dt2
    ");

    foreach ($map as $camel => $info) {
        if (!array_key_exists($camel, $data)) continue;

        $value    = $data[$camel];
        $dataType = $info['json'] ? 'json' : 'string';
        $encoded  = json_encode($value);

        $stmt->execute([
            ':k'   => $info['key'],
            ':v'   => $encoded,
            ':dt'  => $dataType,
            ':v2'  => $encoded,
            ':dt2' => $dataType,
        ]);
    }
}
