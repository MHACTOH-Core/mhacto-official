<?php
namespace App\Models;

use PDO;

/**
 * Post Model — Schema v2.
 * Full CRUD for CMS content.
 * Reads from `content`, `content_fields`, `content_images`, `category`.
 * Place/news-specific fields are stored in `content_fields` (key-value).
 */

class Post
{
    private PDO $conn;

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    // ── Shared SELECT fragment ─────────────────────────────────────

    private function baseSelect(): string
    {
        return "
            SELECT
                c.content_id, c.user_id, c.title, c.description,
                c.status, c.post_type, c.created_at, c.updated_at,
                cat.category_id, cat.label_name AS category_name
            FROM content c
            LEFT JOIN categories cat ON c.category_id = cat.category_id
        ";
    }

    // ── Meta key list ──────────────────────────────────────────────

    /** Single source of truth for all meta field keys. */
    private function metaKeys(): array
    {
        return [
            'label_id', 'label_key', 'is_featured',
            'location', 'latitude', 'longitude', 'hours', 'visit_date', 'contact', 'established',
            'place_category', 'story', 'news_date', 'author',
            'tour_type', 'tour_difficulty', 'tour_includes', 'tour_highlights', 'tour_itinerary',
        ];
    }

    // ── Meta helpers ───────────────────────────────────────────────

    /** Get all meta key-value pairs for a content item. */
    private function getMeta(int $contentId): array
    {
        $stmt = $this->conn->prepare("SELECT meta_key, meta_value FROM content_fields WHERE content_id = :id");
        $stmt->execute([':id' => $contentId]);
        $meta = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $meta[$row['meta_key']] = $row['meta_value'];
        }
        return $meta;
    }

    /** Get a single meta value. */
    private function getMetaValue(int $contentId, string $key): ?string
    {
        $stmt = $this->conn->prepare("SELECT meta_value FROM content_fields WHERE content_id = :id AND meta_key = :k LIMIT 1");
        $stmt->execute([':id' => $contentId, ':k' => $key]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $row['meta_value'] : null;
    }

    /** Set a meta key-value pair (upsert). */
    private function setMeta(int $contentId, string $key, ?string $value): void
    {
        if ($value === null) {
            $this->conn->prepare("DELETE FROM content_fields WHERE content_id = :id AND meta_key = :k")
                ->execute([':id' => $contentId, ':k' => $key]);
            return;
        }

        $this->conn->prepare(
            "INSERT INTO content_fields (content_id, meta_key, meta_value) VALUES (:id, :k, :v)
             ON DUPLICATE KEY UPDATE meta_value = VALUES(meta_value)"
        )->execute([':id' => $contentId, ':k' => $key, ':v' => $value]);
    }

    /** Bulk set meta keys for a content item. */
    private function setMetaBulk(int $contentId, array $metaMap): void
    {
        foreach ($metaMap as $key => $value) {
            $this->setMeta($contentId, $key, $value);
        }
    }

    // ── READ ───────────────────────────────────────────────────────

    public function readAll(): array
    {
        $stmt = $this->conn->prepare($this->baseSelect() . " ORDER BY c.created_at DESC");
        $stmt->execute();
        return $this->formatRows($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function readByStatus(string $status): array
    {
        $stmt = $this->conn->prepare($this->baseSelect() . " WHERE c.status = :s ORDER BY c.created_at DESC");
        $stmt->execute([':s' => $status]);
        return $this->formatRows($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function readByLabel(string $labelKey, ?string $status = null): array
    {
        // Label is stored in content_fields as 'label_key'
        $sql = "
            SELECT c.content_id, c.user_id, c.title, c.description,
                   c.status, c.post_type, c.created_at, c.updated_at,
                   cat.category_id, cat.label_name AS category_name
            FROM content c
            LEFT JOIN categories cat ON c.category_id = cat.category_id
            WHERE EXISTS (
                SELECT 1 FROM content_fields cm
                WHERE cm.content_id = c.content_id
                  AND cm.meta_key = 'label_key' AND cm.meta_value = :lk
            )
        ";
        $params = [':lk' => $labelKey];
        if ($status) { $sql .= " AND c.status = :s"; $params[':s'] = $status; }

        // Check for is_featured meta to sort featured first
        $sql .= " ORDER BY c.created_at DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
        return $this->formatRows($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function readByCategory(string $categoryKey, ?string $status = null, ?int $limit = null): array
    {
        $catName = match ($categoryKey) {
            'history'              => 'History',
            'arts-culture'         => 'Arts & Culture',
            'tourist-wonders'      => 'Tourist Destinations',
            'tourist-destinations' => 'Tourist Destinations',
            'news'                 => 'News & Events',
            'events'               => 'News & Events',
            'community'            => 'Community',
            default                => $categoryKey,
        };
        $where = "WHERE cat.label_name = :cn";
        $params = [':cn' => $catName];
        if ($status) { $where .= " AND c.status = :s"; $params[':s'] = $status; }
        $sql = $this->baseSelect() . " {$where} ORDER BY c.created_at DESC";
        if ($limit !== null) { $sql .= " LIMIT :_lim"; }
        $stmt = $this->conn->prepare($sql);
        foreach ($params as $k => $v) $stmt->bindValue($k, $v);
        if ($limit !== null) $stmt->bindValue(':_lim', (int)$limit, PDO::PARAM_INT);
        $stmt->execute();
        return $this->formatRows($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function readOne(int $id): array|false
    {
        $stmt = $this->conn->prepare($this->baseSelect() . " WHERE c.content_id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $this->formatRow($row) : false;
    }

    public function readPublishedPlaces(?int $limit = null): array
    {
        $q = $this->baseSelect() . "
            WHERE c.post_type = 'place' AND c.status = 'published'
            ORDER BY c.created_at DESC
        ";
        if ($limit !== null) { $q .= " LIMIT :_lim"; }
        $stmt = $this->conn->prepare($q);
        if ($limit !== null) $stmt->bindValue(':_lim', (int)$limit, PDO::PARAM_INT);
        $stmt->execute();
        return $this->formatRows($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /**
     * Get featured posts filtered by label (for navbar dropdown featured content).
     * Returns published posts where is_featured meta = '1', optionally filtered by label_key meta.
     */
    public function readFeaturedByLabel(?string $labelKey = null, ?int $limit = null): array
    {
        $sql = "
            SELECT c.content_id, c.user_id, c.title, c.description,
                   c.status, c.post_type, c.created_at, c.updated_at,
                   cat.category_id, cat.label_name AS category_name
            FROM content c
            LEFT JOIN categories cat ON c.category_id = cat.category_id
            WHERE c.status = 'published'
              AND EXISTS (
                SELECT 1 FROM content_fields feat
                WHERE feat.content_id = c.content_id AND feat.meta_key = 'is_featured' AND feat.meta_value = '1'
              )
        ";
        $params = [];
        if ($labelKey) {
            $sql .= " AND EXISTS (
                SELECT 1 FROM content_fields lm
                WHERE lm.content_id = c.content_id AND lm.meta_key = 'label_key' AND lm.meta_value = :lk
            )";
            $params[':lk'] = $labelKey;
        }
        $sql .= " ORDER BY c.created_at DESC";
        if ($limit !== null) { $sql .= " LIMIT :_lim"; }
        $stmt = $this->conn->prepare($sql);
        foreach ($params as $k => $v) $stmt->bindValue($k, $v);
        if ($limit !== null) $stmt->bindValue(':_lim', (int)$limit, PDO::PARAM_INT);
        $stmt->execute();
        return $this->formatRows($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /**
     * Get featured posts grouped by category.
     */
    public function readFeaturedByCategory(?string $categoryKey = null, ?int $limit = null): array
    {
        $sql = "
            SELECT c.content_id, c.user_id, c.title, c.description,
                   c.status, c.post_type, c.created_at, c.updated_at,
                   cat.category_id, cat.label_name AS category_name
            FROM content c
            LEFT JOIN categories cat ON c.category_id = cat.category_id
            WHERE c.status = 'published'
              AND EXISTS (
                SELECT 1 FROM content_fields feat
                WHERE feat.content_id = c.content_id AND feat.meta_key = 'is_featured' AND feat.meta_value = '1'
              )
        ";
        $params = [];
        if ($categoryKey) {
            $catName = match ($categoryKey) {
                'history'              => 'History',
                'arts-culture'         => 'Arts & Culture',
                'tourist-wonders'      => 'Tourist Destinations',
                'tourist-destinations' => 'Tourist Destinations',
                'news'                 => 'News & Events',
                'events'               => 'News & Events',
                'community'            => 'Community',
                default                => $categoryKey,
            };
            $sql .= " AND cat.label_name = :cn";
            $params[':cn'] = $catName;
        }
        $sql .= " ORDER BY c.created_at DESC";
        if ($limit !== null) { $sql .= " LIMIT :_lim"; }
        $stmt = $this->conn->prepare($sql);
        foreach ($params as $k => $v) $stmt->bindValue($k, $v);
        if ($limit !== null) $stmt->bindValue(':_lim', (int)$limit, PDO::PARAM_INT);
        $stmt->execute();
        return $this->formatRows($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function readPublishedNews(?int $limit = null): array
    {
        $q = "
            SELECT c.content_id, c.user_id, c.title, c.description,
                   c.status, c.post_type, c.created_at, c.updated_at,
                   cat.category_id, cat.label_name AS category_name,
                   nd.meta_value AS news_date
            FROM content c
            LEFT JOIN categories cat ON c.category_id = cat.category_id
            LEFT JOIN content_fields nd ON c.content_id = nd.content_id AND nd.meta_key = 'news_date'
            WHERE c.post_type = 'news' AND c.status = 'published'
            ORDER BY nd.meta_value DESC
        ";
        if ($limit !== null) { $q .= " LIMIT :_lim"; }
        $stmt = $this->conn->prepare($q);
        if ($limit !== null) $stmt->bindValue(':_lim', (int)$limit, PDO::PARAM_INT);
        $stmt->execute();
        return $this->formatRows($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function readPublishedEvents(?int $limit = null): array
    {
        $q = "
            SELECT c.content_id, c.user_id, c.title, c.description,
                   c.status, c.post_type, c.created_at, c.updated_at,
                   cat.category_id, cat.label_name AS category_name,
                   nd.meta_value AS news_date
            FROM content c
            LEFT JOIN categories cat ON c.category_id = cat.category_id
            LEFT JOIN content_fields nd ON c.content_id = nd.content_id AND nd.meta_key = 'news_date'
            WHERE c.post_type = 'event' AND c.status = 'published'
            ORDER BY nd.meta_value DESC
        ";
        if ($limit !== null) { $q .= " LIMIT :_lim"; }
        $stmt = $this->conn->prepare($q);
        if ($limit !== null) $stmt->bindValue(':_lim', (int)$limit, PDO::PARAM_INT);
        $stmt->execute();
        return $this->formatRows($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    // ── CREATE ─────────────────────────────────────────────────────

    public function create(array $data): int
    {
        $this->conn->beginTransaction();
        try {
            $stmt = $this->conn->prepare("
                INSERT INTO content
                  (user_id, category_id, title, description, status, post_type)
                VALUES
                  (:uid, :cid, :title, :desc, :status, :pt)
            ");
            $stmt->execute([
                ':uid'    => $data['user_id'] ?? 1,
                ':cid'    => $data['category_id'] ?? null,
                ':title'  => $data['title'],
                ':desc'   => $data['description'] ?? '',
                ':status' => $data['status'] ?? 'draft',
                ':pt'     => $data['post_type'] ?? 'place',
            ]);
            $contentId = (int) $this->conn->lastInsertId();

            // Store meta fields
            $metaKeys = $this->metaKeys();
            $metaMap = [];
            foreach ($metaKeys as $mk) {
                if (array_key_exists($mk, $data) && $data[$mk] !== null) {
                    $metaMap[$mk] = (string) $data[$mk];
                }
            }
            // Handle is_featured default
            if (!isset($metaMap['is_featured'])) {
                $metaMap['is_featured'] = '0';
            }
            // Auto-set news_date for news/event
            if (!isset($metaMap['news_date']) && in_array($data['post_type'] ?? '', ['news', 'event'])) {
                $metaMap['news_date'] = date('Y-m-d');
            }
            // Resolve label_key from label_id if not provided
            if (isset($data['label_id']) && !isset($metaMap['label_key'])) {
                $lbl = $this->conn->prepare("SELECT label_key FROM categories WHERE category_id = :id LIMIT 1");
                $lbl->execute([':id' => $data['label_id']]);
                $row = $lbl->fetch(PDO::FETCH_ASSOC);
                if ($row && $row['label_key']) {
                    $metaMap['label_key'] = $row['label_key'];
                }
            }
            $this->setMetaBulk($contentId, $metaMap);

            // Images
            if (!empty($data['images'])) {
                $imgStmt = $this->conn->prepare("
                    INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order)
                    VALUES (:cid, :url, :th, :so)
                ");
                foreach ($data['images'] as $idx => $url) {
                    $imgStmt->execute([':cid' => $contentId, ':url' => $url, ':th' => $idx === 0 ? 1 : 0, ':so' => $idx]);
                }
            }

            $this->conn->commit();
            return $contentId;
        } catch (\Exception $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }

    // ── UPDATE ─────────────────────────────────────────────────────

    public function update(int $id, array $data): bool
    {
        $this->conn->beginTransaction();
        try {
            // Update core content columns
            $fields = []; $params = [':id' => $id];
            $allowed = ['title', 'description', 'status', 'post_type', 'category_id'];

            foreach ($allowed as $f) {
                if (array_key_exists($f, $data)) {
                    $fields[] = "{$f} = :{$f}";
                    $params[":{$f}"] = $data[$f];
                }
            }

            if ($fields) {
                $set = implode(', ', $fields);
                $this->conn->prepare("UPDATE content SET {$set} WHERE content_id = :id")->execute($params);
            }

            // Update meta fields
            $metaKeys = $this->metaKeys();
            foreach ($metaKeys as $mk) {
                if (array_key_exists($mk, $data)) {
                    $this->setMeta($id, $mk, $data[$mk] !== null ? (string) $data[$mk] : null);
                }
            }
            // Resolve label_key from label_id if label_id was updated
            if (array_key_exists('label_id', $data) && $data['label_id'] && !array_key_exists('label_key', $data)) {
                $lbl = $this->conn->prepare("SELECT label_key FROM categories WHERE category_id = :lid LIMIT 1");
                $lbl->execute([':lid' => $data['label_id']]);
                $row = $lbl->fetch(PDO::FETCH_ASSOC);
                if ($row && $row['label_key']) {
                    $this->setMeta($id, 'label_key', $row['label_key']);
                }
            }

            // Replace images
            if (array_key_exists('images', $data)) {
                $this->conn->prepare("DELETE FROM content_images WHERE content_id = :id")->execute([':id' => $id]);
                if (!empty($data['images'])) {
                    $imgStmt = $this->conn->prepare("
                        INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order)
                        VALUES (:cid, :url, :th, :so)
                    ");
                    foreach ($data['images'] as $idx => $url) {
                        $imgStmt->execute([':cid' => $id, ':url' => $url, ':th' => $idx === 0 ? 1 : 0, ':so' => $idx]);
                    }
                }
            }

            $this->conn->commit();
            return true;
        } catch (\Exception $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }

    // ── DELETE ─────────────────────────────────────────────────────

    public function delete(int $id): bool
    {
        // content_images and content_fields have ON DELETE CASCADE
        return $this->conn->prepare("DELETE FROM content WHERE content_id = :id")->execute([':id' => $id]);
    }

    // ── Images helper ──────────────────────────────────────────────

    public function getImages(int $contentId): array
    {
        $q = "SELECT image_id, image_url, is_thumbnail
              FROM content_images WHERE content_id = :id
              ORDER BY is_thumbnail DESC, sort_order ASC, image_id ASC";
        $stmt = $this->conn->prepare($q);
        $stmt->execute([':id' => $contentId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ── Batch loaders (eliminate N+1 queries) ──────────────────────

    /**
     * Batch-load all meta for a set of content IDs.
     * Returns [ contentId => [ metaKey => metaValue, ... ], ... ]
     */
    private function batchGetMeta(array $ids): array
    {
        if (empty($ids)) return [];
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $stmt = $this->conn->prepare(
            "SELECT content_id, meta_key, meta_value FROM content_fields WHERE content_id IN ({$placeholders})"
        );
        $stmt->execute(array_values($ids));
        $result = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $result[(int)$row['content_id']][$row['meta_key']] = $row['meta_value'];
        }
        return $result;
    }

    /**
     * Batch-load all images for a set of content IDs.
     * Returns [ contentId => [ imageUrl, ... ], ... ]
     */
    private function batchGetImages(array $ids): array
    {
        if (empty($ids)) return [];
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $stmt = $this->conn->prepare(
            "SELECT content_id, image_url FROM content_images WHERE content_id IN ({$placeholders})
             ORDER BY is_thumbnail DESC, sort_order ASC, image_id ASC"
        );
        $stmt->execute(array_values($ids));
        $result = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $result[(int)$row['content_id']][] = $row['image_url'];
        }
        return $result;
    }

    /**
     * Format multiple rows at once using batch-loaded meta + images.
     * Reduces from 2N+1 queries down to 3 queries total.
     */
    private function formatRows(array $rows): array
    {
        if (empty($rows)) return [];
        $ids = array_map(fn($r) => (int) $r['content_id'], $rows);
        $allMeta   = $this->batchGetMeta($ids);
        $allImages = $this->batchGetImages($ids);

        return array_map(function (array $row) use ($allMeta, $allImages) {
            $contentId = (int) $row['content_id'];
            $postType  = $row['post_type'] ?? 'place';
            $imageUrls = $allImages[$contentId] ?? [];
            $meta      = $allMeta[$contentId] ?? [];
            return $this->buildFormatted($row, $contentId, $postType, $imageUrls, $meta);
        }, $rows);
    }

    // ── Format ─────────────────────────────────────────────────────

    private function formatRow(array $row): array
    {
        $contentId = (int) $row['content_id'];
        $postType  = $row['post_type'] ?? 'place';
        $images    = $this->getImages($contentId);
        $imageUrls = array_map(fn($img) => $img['image_url'], $images);
        $meta      = $this->getMeta($contentId);
        return $this->buildFormatted($row, $contentId, $postType, $imageUrls, $meta);
    }

    /** Shared formatting logic used by both formatRow (single) and formatRows (batch). */
    private function buildFormatted(array $row, int $contentId, string $postType, array $imageUrls, array $meta): array
    {
        return [
            'id'              => (string) $contentId,
            'title'           => $row['title'],
            'body'            => $row['description'] ?? '',
            'contentCategory' => $this->mapCategoryKey($row['category_name'] ?? null, $meta['label_key'] ?? null),
            'label'           => $meta['label_key'] ?? 'destinations',
            'postType'        => $postType,
            'status'          => strtolower($row['status']),
            'image'           => $imageUrls,
            'isFeatured'      => (bool) ($meta['is_featured'] ?? false),
            'location'        => $meta['location'] ?? null,
            'latitude'        => $meta['latitude'] ?? null,
            'longitude'       => $meta['longitude'] ?? null,
            'hours'           => $meta['hours'] ?? null,
            'contact'         => $meta['contact'] ?? null,
            'established'     => $meta['established'] ?? null,
            'category'        => $meta['place_category'] ?? null,
            'story'           => $meta['story'] ?? null,
            'highlights'      => $this->parseJsonMeta($meta, 'tour_highlights'),
            'includes'        => $this->parseJsonMeta($meta, 'tour_includes'),
            'itinerary'       => $this->parseJsonMeta($meta, 'tour_itinerary'),
            'tourType'        => $meta['tour_type'] ?? null,
            'tourDifficulty'  => $meta['tour_difficulty'] ?? null,
            'newsDate'        => $meta['news_date'] ?? null,
            'author'          => $meta['author'] ?? null,
            'createdAt'       => $row['created_at'],
            'updatedAt'       => $row['updated_at'],
        ];
    }

    /** Parse a JSON-encoded meta value into an array. */
    private function parseJsonMeta(array $meta, string $key): array
    {
        if (empty($meta[$key])) return [];
        $decoded = json_decode($meta[$key], true);
        return is_array($decoded) ? $decoded : [];
    }

    private function mapCategoryKey(?string $name, ?string $labelKey = null): string
    {
        return match ($name) {
            'History'              => 'history',
            'Arts & Culture'       => 'arts-culture',
            'Tourist Destinations' => 'tourist-wonders',
            'Tourism Wonders'      => 'tourist-wonders', // legacy: older rows stored label id
            'News & Events'        => in_array($labelKey, ['events'], true) ? 'events' : 'news',
            'Community'            => 'community',
            default                => 'history',
        };
    }
}
