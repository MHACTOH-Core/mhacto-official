<?php
namespace App\Models;

use PDO;

/**
 * HomeContent Model — Schema v2.
 *
 * REMOVED sections (no longer separate tables):
 *   - Hero Slides  → config table (use Settings model)
 *   - Culinary     → auto-pulled from CMS label 'local-cuisine' (via content_fields)
 *
 * MERGED sections:
 *   - Spotlight + Featured Landmarks → `featured_content` table
 *     Each row references a CMS `content` row (no data duplication).
 *
 * KEPT:
 *   - Milestones (now `milestone` table, minor column changes)
 *
 * Hero settings are now served via Settings::readHero() / updateHero().
 */

class HomeContent
{
    private PDO $conn;

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    // ─────────────────────────────────────────────────────────────────
    // FEATURED CONTENT (spotlight + landmark — reads from `featured_content`)
    // JOINs `content` + `content_images` so we return full CMS data.
    // ─────────────────────────────────────────────────────────────────

    private function featuredSelect(): string
    {
        return "
            SELECT
                fc.featured_id, fc.content_id, fc.section,
                fc.sort_order, fc.is_active,
                fc.created_at, fc.updated_at,
                c.title, c.description, c.post_type,
                cat.label_name AS category_name
            FROM featured_content fc
            LEFT JOIN content  c   ON fc.content_id  = c.content_id
            LEFT JOIN categories cat ON c.category_id  = cat.category_id
        ";
    }

    private function getThumbnail(int $contentId): ?string
    {
        $stmt = $this->conn->prepare("
            SELECT image_url FROM content_images
            WHERE content_id = :cid
            ORDER BY is_thumbnail DESC, sort_order ASC, image_id ASC
            LIMIT 1
        ");
        $stmt->execute([':cid' => $contentId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $row['image_url'] : null;
    }

    /** Get a meta value for a content item. */
    private function getContentMeta(int $contentId, string $key): ?string
    {
        $stmt = $this->conn->prepare("SELECT meta_value FROM content_fields WHERE content_id = :id AND meta_key = :k LIMIT 1");
        $stmt->execute([':id' => $contentId, ':k' => $key]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $row['meta_value'] : null;
    }

    // ── SPOTLIGHT ──────────────────────────────────────────────────

    public function getSpotlight($all = false)
    {
        $where = "WHERE fc.section = 'spotlight'";
        if (!$all) $where .= " AND fc.is_active = 1";

        $sql = $this->featuredSelect() . " {$where} ORDER BY fc.is_active DESC, fc.created_at DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $results = array_map([$this, 'formatFeatured'], $rows);

        if ($all) return $results;
        return $results[0] ?? null;
    }

    public function createSpotlight($data)
    {
        if (!empty($data['isActive'])) {
            $this->conn->exec("UPDATE featured_content SET is_active = 0 WHERE section = 'spotlight'");
        }

        $stmt = $this->conn->prepare("
            INSERT INTO featured_content (content_id, section, sort_order, is_active)
            VALUES (:contentId, 'spotlight', 0, :isActive)
        ");
        $stmt->execute([
            ':contentId' => $data['contentId'] ?? null,
            ':isActive'  => isset($data['isActive']) ? ($data['isActive'] ? 1 : 0) : 0,
        ]);

        return $this->conn->lastInsertId();
    }

    public function updateSpotlight($id, $data)
    {
        $this->conn->beginTransaction();
        try {
            if (!empty($data['isActive'])) {
                $deact = $this->conn->prepare("UPDATE featured_content SET is_active = 0 WHERE section = 'spotlight' AND featured_id != :id");
                $deact->execute([':id' => $id]);
            }

            $fields = [];
            $params = [':id' => $id];

            $fieldMap = [
                'contentId' => 'content_id',
                'isActive'  => 'is_active',
            ];

            foreach ($fieldMap as $apiField => $dbField) {
                if (isset($data[$apiField])) {
                    $value = $data[$apiField];
                    if ($apiField === 'isActive') $value = $value ? 1 : 0;
                    $fields[] = "{$dbField} = :{$apiField}";
                    $params[":{$apiField}"] = $value;
                }
            }

            if (empty($fields)) {
                $this->conn->commit();
                return false;
            }

            $sql = "UPDATE featured_content SET " . implode(', ', $fields) . " WHERE featured_id = :id AND section = 'spotlight'";
            $stmt = $this->conn->prepare($sql);
            $result = $stmt->execute($params);
            $this->conn->commit();
            return $result;
        } catch (\Exception $e) {
            $this->conn->rollBack();
            error_log("HomeContent::updateSpotlight error: " . $e->getMessage());
            return false;
        }
    }

    public function deleteSpotlight($id)
    {
        $stmt = $this->conn->prepare("DELETE FROM featured_content WHERE featured_id = :id AND section = 'spotlight'");
        return $stmt->execute([':id' => $id]);
    }

    // ── FEATURED LANDMARKS ────────────────────────────────────────

    public function getFeaturedLandmarks($all = false)
    {
        $where = "WHERE fc.section = 'landmark'";
        if (!$all) $where .= " AND fc.is_active = 1";

        $sql = $this->featuredSelect() . " {$where} ORDER BY fc.sort_order ASC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return array_map([$this, 'formatFeatured'], $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function createFeaturedLandmark($data)
    {
        $stmt = $this->conn->prepare("
            INSERT INTO featured_content (content_id, section, sort_order, is_active)
            VALUES (:contentId, 'landmark', :sortOrder, :isActive)
        ");
        $stmt->execute([
            ':contentId' => $data['contentId'] ?? null,
            ':sortOrder' => $data['sortOrder'] ?? 0,
            ':isActive'  => isset($data['isActive']) ? ($data['isActive'] ? 1 : 0) : 1,
        ]);

        return $this->conn->lastInsertId();
    }

    public function updateFeaturedLandmark($id, $data)
    {
        $fields = [];
        $params = [':id' => $id];

        $fieldMap = [
            'contentId' => 'content_id',
            'sortOrder' => 'sort_order',
            'isActive'  => 'is_active',
        ];

        foreach ($fieldMap as $apiField => $dbField) {
            if (isset($data[$apiField])) {
                $value = $data[$apiField];
                if ($apiField === 'isActive') $value = $value ? 1 : 0;
                $fields[] = "{$dbField} = :{$apiField}";
                $params[":{$apiField}"] = $value;
            }
        }

        if (empty($fields)) return false;

        $sql = "UPDATE featured_content SET " . implode(', ', $fields) . " WHERE featured_id = :id AND section = 'landmark'";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute($params);
    }

    public function deleteFeaturedLandmark($id)
    {
        $stmt = $this->conn->prepare("DELETE FROM featured_content WHERE featured_id = :id AND section = 'landmark'");
        return $stmt->execute([':id' => $id]);
    }

    public function reorderFeaturedLandmarks($order)
    {
        $this->conn->beginTransaction();
        try {
            $stmt = $this->conn->prepare("UPDATE featured_content SET sort_order = :sortOrder WHERE featured_id = :id AND section = 'landmark'");

            foreach ($order as $index => $id) {
                $stmt->execute([
                    ':sortOrder' => $index + 1,
                    ':id'        => $id,
                ]);
            }

            $this->conn->commit();
            return true;
        } catch (\Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }

    // ── HERO SETTINGS (convenience — delegates to config table via Settings model) ──

    public function getHeroSettings()
    {
        $stmt = $this->conn->prepare("
            SELECT config_key, config_value, data_type
            FROM config
            WHERE config_group = 'hero'
        ");
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($rows)) return null;

        $map = [];
        foreach ($rows as $row) {
            $decoded = json_decode($row['config_value'] ?? 'null', true);
            $map[$row['config_key']] = $decoded;
        }

        // Parse up to 4 title/highlight pairs from config
        $titles = [];
        for ($i = 1; $i <= 4; $i++) {
            $t = $map["hero_title_$i"] ?? null;
            $h = $map["hero_highlight_$i"] ?? null;
            if ($t !== null && trim($t) !== '') {
                $titles[] = ['title' => $t, 'highlight' => $h ?? ''];
            }
        }
        // Fallback: if no numbered titles found, try legacy single title
        if (empty($titles)) {
            $legacyTitle = $map['hero_title'] ?? 'Explore The River';
            $legacyHighlight = $map['hero_highlight'] ?? 'Town Wonders';
            $titles[] = ['title' => $legacyTitle, 'highlight' => $legacyHighlight];
        }

        return [
            'subtitle'      => $map['hero_subtitle'] ?? '',
            'title'         => $titles[0]['title'] ?? '',
            'highlight'     => $titles[0]['highlight'] ?? '',
            'titles'        => $titles,
            'description'   => $map['hero_description'] ?? '',
            'videoUrl'      => $map['hero_video_url'] ?? '',
            'fallbackImage' => $map['hero_fallback_img'] ?? '',
            'ctaText'       => $map['hero_cta_text'] ?? 'Explore Now',
            'ctaLink'       => $map['hero_cta_link'] ?? '/destinations',
        ];
    }

    public function updateHeroSettings($data)
    {
        $heroMap = [
            'subtitle'      => 'hero_subtitle',
            'description'   => 'hero_description',
            'videoUrl'      => 'hero_video_url',
            'fallbackImage' => 'hero_fallback_img',
            'ctaText'       => 'hero_cta_text',
            'ctaLink'       => 'hero_cta_link',
        ];

        foreach ($heroMap as $apiField => $configKey) {
            if (isset($data[$apiField])) {
                $jsonValue = json_encode($data[$apiField]);
                $stmt = $this->conn->prepare("
                    INSERT INTO config (config_group, config_key, config_value, data_type)
                    VALUES ('hero', :k, :v, 'string')
                    ON DUPLICATE KEY UPDATE config_value = :v2
                ");
                $stmt->execute([
                    ':k'  => $configKey,
                    ':v'  => $jsonValue,
                    ':v2' => $jsonValue,
                ]);
            }
        }

        // Save title/highlight — accept flat fields from admin form
        if (isset($data['title']) || isset($data['highlight'])) {
            $pairs = [
                'hero_title_1'     => $data['title'] ?? '',
                'hero_highlight_1' => $data['highlight'] ?? '',
            ];
            foreach ($pairs as $configKey => $value) {
                $jsonValue = json_encode($value);
                $stmt = $this->conn->prepare("
                    INSERT INTO config (config_group, config_key, config_value, data_type)
                    VALUES ('hero', :k, :v, 'string')
                    ON DUPLICATE KEY UPDATE config_value = :v2
                ");
                $stmt->execute([
                    ':k'  => $configKey,
                    ':v'  => $jsonValue,
                    ':v2' => $jsonValue,
                ]);
            }
        }

        return true;
    }

    // ─────────────────────────────────────────────────────────────────
    // MILESTONES (History Timeline) — now uses `milestone` table
    // ─────────────────────────────────────────────────────────────────

    public function getMilestones($all = false)
    {
        $sql = "SELECT milestone_id AS milestoneId,
                       year, title, description, detail,
                       side, sort_order AS sortOrder, is_active AS isActive,
                       created_at AS createdAt, updated_at AS updatedAt
                FROM milestones";

        if (!$all) {
            $sql .= " WHERE is_active = 1";
        }

        $sql .= " ORDER BY sort_order ASC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $results = $stmt->fetchAll();

        return array_map(function ($row) {
            $row['isActive'] = (bool) $row['isActive'];
            return $row;
        }, $results);
    }

    public function createMilestone($data)
    {
        // Check for duplicate (same year + title)
        if (!empty($data['year']) && !empty($data['title'])) {
            $check = $this->conn->prepare(
                "SELECT milestone_id FROM milestones WHERE year = :year AND title = :title LIMIT 1"
            );
            $check->execute([':year' => $data['year'], ':title' => $data['title']]);
            if ($check->fetch()) {
                return ['error' => 'duplicate', 'message' => 'A milestone with the same year and title already exists.'];
            }
        }

        $sql = "INSERT INTO milestones (year, title, description, detail, side, sort_order, is_active)
                VALUES (:year, :title, :description, :detail, :side, :sortOrder, :isActive)";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':year'        => $data['year'] ?? null,
            ':title'       => $data['title'] ?? null,
            ':description' => $data['description'] ?? null,
            ':detail'      => $data['detail'] ?? null,
            ':side'        => $data['side'] ?? 'left',
            ':sortOrder'   => $data['sortOrder'] ?? '0',
            ':isActive'    => isset($data['isActive']) ? ($data['isActive'] ? 1 : 0) : 1,
        ]);

        return $this->conn->lastInsertId();
    }

    public function updateMilestone($id, $data)
    {
        $fields = [];
        $params = [':id' => $id];

        $fieldMap = [
            'year'        => 'year',
            'title'       => 'title',
            'description' => 'description',
            'detail'      => 'detail',
            'side'        => 'side',
            'sortOrder'   => 'sort_order',
            'isActive'    => 'is_active',
        ];

        foreach ($fieldMap as $apiField => $dbField) {
            if (isset($data[$apiField])) {
                $value = $data[$apiField];
                if ($apiField === 'isActive') $value = $value ? 1 : 0;
                $fields[] = "{$dbField} = :{$apiField}";
                $params[":{$apiField}"] = $value;
            }
        }

        if (empty($fields)) return false;

        $sql = "UPDATE milestones SET " . implode(', ', $fields) . " WHERE milestone_id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute($params);
    }

    public function deleteMilestone($id)
    {
        $stmt = $this->conn->prepare("DELETE FROM milestones WHERE milestone_id = :id");
        return $stmt->execute([':id' => $id]);
    }

    public function reorderMilestones($order)
    {
        $this->conn->beginTransaction();
        try {
            $stmt = $this->conn->prepare("UPDATE milestones SET sort_order = :sortOrder WHERE milestone_id = :id");

            foreach ($order as $index => $id) {
                $stmt->execute([
                    ':sortOrder' => $index + 1,
                    ':id'        => $id,
                ]);
            }

            $this->conn->commit();
            return true;
        } catch (\Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }

    // ── Format helper for featured_content rows ────────────────────

    private function formatFeatured(array $row): array
    {
        $contentId = $row['content_id'] ? (int) $row['content_id'] : null;
        $image = $contentId ? $this->getThumbnail($contentId) : null;

        // Get place-specific meta from content_fields
        $location      = $contentId ? $this->getContentMeta($contentId, 'location') : null;
        $placeCategory = $contentId ? $this->getContentMeta($contentId, 'place_category') : null;
        $newsDate      = $contentId ? $this->getContentMeta($contentId, 'news_date') : null;

        return [
            'featuredId'    => (int) $row['featured_id'],
            'contentId'     => $contentId ? (string) $contentId : null,
            'section'       => $row['section'],
            'title'         => $row['title'] ?? '',
            'description'   => $row['description'] ?? '',
            'image'         => $image,
            'postType'      => $row['post_type'] ?? null,
            'location'      => $location,
            'category'      => $placeCategory ?? $row['category_name'] ?? null,
            'date'          => $newsDate,
            'sortOrder'     => (int) ($row['sort_order'] ?? 0),
            'isActive'      => (bool) ($row['is_active'] ?? true),
            'createdAt'     => $row['created_at'],
            'updatedAt'     => $row['updated_at'],
        ];
    }
}
