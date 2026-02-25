<?php
/**
 * Settings Model — Reads from existing `site_settings` table.
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
            return [
                'siteName'                   => 'MHACTO Bocaue',
                'siteDescription'            => 'Municipal History, Arts, Culture & Tourism Office — Bocaue, Bulacan',
                'contactEmail'               => 'mhacto@bocaue.gov.ph',
                'contactPhone'               => '(044) 123-4567',
                'address'                    => 'Municipal Hall, Bocaue, Bulacan 3018',
                'siteLogoUrl'                => null,
                'enableInquiryNotifications' => true,
                'enableAnalytics'            => true,
                'maintenanceMode'            => false,
            ];
        }

        return $this->formatRow($row);
    }

    /** Update settings. */
    public function update(array $data): array
    {
        // Get the first row's ID
        $stmt = $this->conn->query("SELECT settings_id FROM site_settings ORDER BY settings_id ASC LIMIT 1");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) return $this->read();

        $settingsId = $row['settings_id'];
        $fields = [];
        $params = [':id' => $settingsId];

        $map = [
            'siteName'                   => 'site_name',
            'siteDescription'            => 'site_description',
            'contactEmail'               => 'contact_email',
            'contactPhone'               => 'contact_phone',
            'address'                    => 'office_address',
            'siteLogoUrl'                => 'site_logo_url',
            'enableInquiryNotifications' => 'notify_inquiries',
            'enableAnalytics'            => 'enable_analytics',
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
            'maintenanceMode'            => false, // Not in existing DB; default false
        ];
    }
}
