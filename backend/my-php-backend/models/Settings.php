<?php
/**
 * Settings Model — Optimized schema.
 * `site_settings` now also stores hero section config
 * (absorbed from the old `hero_settings` table).
 */

class Settings
{
    private PDO $conn;

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    /** Read the first settings row. */
    public function read(): array
    {
        $query = "SELECT * FROM site_settings ORDER BY settings_id ASC LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return $this->defaults();
        }

        return $this->formatRow($row);
    }

    /** Read hero settings only (convenience for hero-settings endpoint). */
    public function readHero(): array
    {
        $row = $this->readRaw();
        if (!$row) {
            return $this->heroDefaults();
        }
        return $this->formatHero($row);
    }

    /** Update settings. */
    public function update(array $data): array
    {
        $row = $this->readRaw();
        if (!$row) return $this->read();

        $settingsId = $row['settings_id'];
        $fields = [];
        $params = [':id' => $settingsId];

        $map = [
            // General settings
            'siteName'                   => 'site_name',
            'siteDescription'            => 'site_description',
            'contactEmail'               => 'contact_email',
            'contactPhone'               => 'contact_phone',
            'address'                    => 'office_address',
            'siteLogoUrl'                => 'site_logo_url',
            'enableInquiryNotifications' => 'notify_inquiries',
            'enableAnalytics'            => 'enable_analytics',
            // Hero settings
            'heroSubtitle'               => 'hero_subtitle',
            'heroTitle'                  => 'hero_title',
            'heroHighlight'              => 'hero_highlight',
            'heroDescription'            => 'hero_description',
            'heroVideoUrl'               => 'hero_video_url',
            'heroFallbackImage'          => 'hero_fallback_img',
            'heroCtaText'                => 'hero_cta_text',
            'heroCtaLink'                => 'hero_cta_link',
        ];

        foreach ($map as $camel => $col) {
            if (array_key_exists($camel, $data)) {
                $fields[] = "{$col} = :{$col}";
                $value = $data[$camel];
                if (is_bool($value)) $value = $value ? 1 : 0;
                $params[":{$col}"] = $value;
            }
        }

        if (!empty($fields)) {
            $query = "UPDATE site_settings SET " . implode(', ', $fields) . " WHERE settings_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->execute($params);
        }

        return $this->read();
    }

    /** Update hero settings only (convenience for hero-settings endpoint). */
    public function updateHero(array $data): array
    {
        $row = $this->readRaw();
        if (!$row) return $this->heroDefaults();

        $settingsId = $row['settings_id'];
        $fields = [];
        $params = [':id' => $settingsId];

        // Accept both camelCase (from frontend) and old key names
        $heroMap = [
            'subtitle'      => 'hero_subtitle',
            'title'         => 'hero_title',
            'highlight'     => 'hero_highlight',
            'description'   => 'hero_description',
            'videoUrl'      => 'hero_video_url',
            'fallbackImage' => 'hero_fallback_img',
            'ctaText'       => 'hero_cta_text',
            'ctaLink'       => 'hero_cta_link',
        ];

        foreach ($heroMap as $key => $col) {
            if (array_key_exists($key, $data)) {
                $fields[] = "{$col} = :{$col}";
                $params[":{$col}"] = $data[$key];
            }
        }

        if (!empty($fields)) {
            $query = "UPDATE site_settings SET " . implode(', ', $fields) . " WHERE settings_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->execute($params);
        }

        return $this->readHero();
    }

    // ── Private helpers ────────────────────────────────────────────

    private function readRaw(): array|false
    {
        $stmt = $this->conn->query("SELECT * FROM site_settings ORDER BY settings_id ASC LIMIT 1");
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: false;
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

    private function formatRow(array $row): array
    {
        return [
            'siteName'                   => $row['site_name'],
            'siteDescription'            => $row['site_description'],
            'contactEmail'               => $row['contact_email'],
            'contactPhone'               => $row['contact_phone'],
            'address'                    => $row['office_address'],
            'siteLogoUrl'                => $row['site_logo_url'] ?? null,
            'enableInquiryNotifications' => (bool) $row['notify_inquiries'],
            'enableAnalytics'            => (bool) $row['enable_analytics'],
            'maintenanceMode'            => false,
            // Hero settings
            'heroSubtitle'      => $row['hero_subtitle'] ?? '',
            'heroTitle'         => $row['hero_title'] ?? 'Explore The River',
            'heroHighlight'     => $row['hero_highlight'] ?? '',
            'heroDescription'   => $row['hero_description'] ?? '',
            'heroVideoUrl'      => $row['hero_video_url'] ?? '',
            'heroFallbackImage' => $row['hero_fallback_img'] ?? '',
            'heroCtaText'       => $row['hero_cta_text'] ?? 'Explore Now',
            'heroCtaLink'       => $row['hero_cta_link'] ?? '/destinations',
        ];
    }

    /** Format hero fields only (for hero-settings endpoint, uses old key names). */
    private function formatHero(array $row): array
    {
        return [
            'settingId'     => (int) $row['settings_id'],
            'subtitle'      => $row['hero_subtitle'] ?? '',
            'title'         => $row['hero_title'] ?? 'Explore The River',
            'highlight'     => $row['hero_highlight'] ?? '',
            'description'   => $row['hero_description'] ?? '',
            'videoUrl'      => $row['hero_video_url'] ?? '',
            'fallbackImage' => $row['hero_fallback_img'] ?? '',
            'ctaText'       => $row['hero_cta_text'] ?? 'Explore Now',
            'ctaLink'       => $row['hero_cta_link'] ?? '/destinations',
            'updatedAt'     => $row['updated_at'] ?? null,
        ];
    }
}
