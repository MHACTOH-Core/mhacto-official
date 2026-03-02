<?php
/**
 * Settings Model — Schema v2.
 * Reads from `config` table (key-value store grouped by config_group).
 * Replaces the old single-row `site_settings` table.
 */

class Settings
{
    private PDO $conn;

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    // ── Read all settings (general + hero merged) ──────────────────

    /** Read all config rows and return as a flat camelCase object. */
    public function read(): array
    {
        $rows = $this->readGroup(null);
        if (empty($rows)) {
            return $this->defaults();
        }
        return $this->formatAll($rows);
    }

    /** Read only hero-group config keys. */
    public function readHero(): array
    {
        $rows = $this->readGroup('hero');
        if (empty($rows)) {
            return $this->heroDefaults();
        }
        return $this->formatHero($rows);
    }

    // ── Update settings ────────────────────────────────────────────

    /** Update general + hero config keys from a camelCase payload. */
    public function update(array $data): array
    {
        $map = $this->camelToConfigMap();

        foreach ($map as $camel => $info) {
            if (array_key_exists($camel, $data)) {
                $this->upsertKey($info['group'], $info['key'], $data[$camel], $info['type']);
            }
        }

        return $this->read();
    }

    /** Update hero config keys from a short-key payload (subtitle, title, etc.). */
    public function updateHero(array $data): array
    {
        $heroMap = [
            'subtitle'      => ['key' => 'hero_subtitle',     'type' => 'string'],
            'title'         => ['key' => 'hero_title',        'type' => 'string'],
            'highlight'     => ['key' => 'hero_highlight',    'type' => 'string'],
            'description'   => ['key' => 'hero_description',  'type' => 'string'],
            'videoUrl'      => ['key' => 'hero_video_url',    'type' => 'string'],
            'fallbackImage' => ['key' => 'hero_fallback_img', 'type' => 'string'],
            'ctaText'       => ['key' => 'hero_cta_text',     'type' => 'string'],
            'ctaLink'       => ['key' => 'hero_cta_link',     'type' => 'string'],
        ];

        foreach ($heroMap as $apiKey => $info) {
            if (array_key_exists($apiKey, $data)) {
                $this->upsertKey('hero', $info['key'], $data[$apiKey], $info['type']);
            }
        }

        return $this->readHero();
    }

    // ── Private helpers ────────────────────────────────────────────

    /** Read config rows, optionally filtered by group. */
    private function readGroup(?string $group): array
    {
        if ($group) {
            $stmt = $this->conn->prepare("SELECT config_group, config_key, config_value, data_type FROM config WHERE config_group = :g");
            $stmt->execute([':g' => $group]);
        } else {
            $stmt = $this->conn->prepare("SELECT config_group, config_key, config_value, data_type FROM config");
            $stmt->execute();
        }
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /** Upsert a single config key. */
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

    /** Decode a JSON config_value, respecting data_type hint. */
    private function decodeValue(string $jsonValue, string $dataType): mixed
    {
        $decoded = json_decode($jsonValue, true);
        // json_decode returns null for "null" string, which is correct
        if ($decoded === null && strtolower(trim($jsonValue)) !== 'null') {
            // Fallback: treat as raw string if not valid JSON
            return $jsonValue;
        }

        return match ($dataType) {
            'boolean' => (bool) $decoded,
            'number'  => is_numeric($decoded) ? $decoded + 0 : $decoded,
            default   => $decoded,
        };
    }

    /** Build a flat key→value map from config rows. */
    private function buildMap(array $rows): array
    {
        $map = [];
        foreach ($rows as $row) {
            $map[$row['config_key']] = $this->decodeValue(
                $row['config_value'] ?? 'null',
                $row['data_type'] ?? 'string'
            );
        }
        return $map;
    }

    /** Map from camelCase frontend keys to config_group + config_key. */
    private function camelToConfigMap(): array
    {
        return [
            // General
            'siteName'                   => ['group' => 'general', 'key' => 'site_name',          'type' => 'string'],
            'siteDescription'            => ['group' => 'general', 'key' => 'site_description',   'type' => 'string'],
            'contactEmail'               => ['group' => 'general', 'key' => 'contact_email',      'type' => 'string'],
            'contactPhone'               => ['group' => 'general', 'key' => 'contact_phone',      'type' => 'string'],
            'address'                    => ['group' => 'general', 'key' => 'office_address',     'type' => 'string'],
            'siteLogoUrl'                => ['group' => 'general', 'key' => 'site_logo_url',      'type' => 'string'],
            'enableInquiryNotifications' => ['group' => 'general', 'key' => 'notify_inquiries',   'type' => 'boolean'],
            'enableAnalytics'            => ['group' => 'general', 'key' => 'enable_analytics',   'type' => 'boolean'],
            // Hero
            'heroSubtitle'               => ['group' => 'hero', 'key' => 'hero_subtitle',     'type' => 'string'],
            'heroTitle'                  => ['group' => 'hero', 'key' => 'hero_title',        'type' => 'string'],
            'heroHighlight'              => ['group' => 'hero', 'key' => 'hero_highlight',    'type' => 'string'],
            'heroDescription'            => ['group' => 'hero', 'key' => 'hero_description',  'type' => 'string'],
            'heroVideoUrl'               => ['group' => 'hero', 'key' => 'hero_video_url',    'type' => 'string'],
            'heroFallbackImage'          => ['group' => 'hero', 'key' => 'hero_fallback_img', 'type' => 'string'],
            'heroCtaText'                => ['group' => 'hero', 'key' => 'hero_cta_text',     'type' => 'string'],
            'heroCtaLink'                => ['group' => 'hero', 'key' => 'hero_cta_link',     'type' => 'string'],
        ];
    }

    /** Format all config rows into the frontend-expected shape. */
    private function formatAll(array $rows): array
    {
        $map = $this->buildMap($rows);
        return [
            'siteName'                   => $map['site_name'] ?? 'MHACTO Bocaue',
            'siteDescription'            => $map['site_description'] ?? '',
            'contactEmail'               => $map['contact_email'] ?? '',
            'contactPhone'               => $map['contact_phone'] ?? '',
            'address'                    => $map['office_address'] ?? '',
            'siteLogoUrl'                => $map['site_logo_url'] ?? null,
            'enableInquiryNotifications' => $map['notify_inquiries'] ?? true,
            'enableAnalytics'            => $map['enable_analytics'] ?? true,
            'maintenanceMode'            => false,
            // Hero
            'heroSubtitle'      => $map['hero_subtitle'] ?? '',
            'heroTitle'         => $map['hero_title'] ?? 'Explore The River',
            'heroHighlight'     => $map['hero_highlight'] ?? '',
            'heroDescription'   => $map['hero_description'] ?? '',
            'heroVideoUrl'      => $map['hero_video_url'] ?? '',
            'heroFallbackImage' => $map['hero_fallback_img'] ?? '',
            'heroCtaText'       => $map['hero_cta_text'] ?? 'Explore Now',
            'heroCtaLink'       => $map['hero_cta_link'] ?? '/destinations',
        ];
    }

    /** Format hero config rows using short keys (for hero-settings endpoint). */
    private function formatHero(array $rows): array
    {
        $map = $this->buildMap($rows);
        return [
            'subtitle'      => $map['hero_subtitle'] ?? '',
            'title'         => $map['hero_title'] ?? 'Explore The River',
            'highlight'     => $map['hero_highlight'] ?? '',
            'description'   => $map['hero_description'] ?? '',
            'videoUrl'      => $map['hero_video_url'] ?? '',
            'fallbackImage' => $map['hero_fallback_img'] ?? '',
            'ctaText'       => $map['hero_cta_text'] ?? 'Explore Now',
            'ctaLink'       => $map['hero_cta_link'] ?? '/destinations',
        ];
    }

    private function defaults(): array
    {
        return array_merge([
            'siteName'                   => 'MHACTO Bocaue',
            'siteDescription'            => 'Municipal History, Arts, Culture & Tourism Office — Bocaue, Bulacan',
            'contactEmail'               => 'mhacto@bocaue.gov.ph',
            'contactPhone'               => '(044) 123-4567',
            'address'                    => 'Municipal Hall, Bocaue, Bulacan 3018',
            'siteLogoUrl'                => null,
            'enableInquiryNotifications' => true,
            'enableAnalytics'            => true,
            'maintenanceMode'            => false,
        ], $this->heroDefaults());
    }

    private function heroDefaults(): array
    {
        return [
            'heroSubtitle'      => 'Bocaue, Bulacan',
            'heroTitle'         => 'Explore The River',
            'heroHighlight'     => 'Town Wonders',
            'heroDescription'   => '',
            'heroVideoUrl'      => '',
            'heroFallbackImage' => '',
            'heroCtaText'       => 'Explore Now',
            'heroCtaLink'       => '/destinations',
        ];
    }
}
