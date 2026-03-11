<?php
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
                c.status, c.post_type, c.author, c.created_at, c.updated_at,
                cat.category_id, cat.label_name AS category_name
            FROM content c
            LEFT JOIN category cat ON c.category_id = cat.category_id
        ";
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

        // Check if exists
        $stmt = $this->conn->prepare("SELECT meta_id FROM content_fields WHERE content_id = :id AND meta_key = :k LIMIT 1");
        $stmt->execute([':id' => $contentId, ':k' => $key]);

        if ($stmt->fetch()) {
            $this->conn->prepare("UPDATE content_fields SET meta_value = :v WHERE content_id = :id AND meta_key = :k")
                ->execute([':v' => $value, ':id' => $contentId, ':k' => $key]);
        } else {
            $this->conn->prepare("INSERT INTO content_fields (content_id, meta_key, meta_value) VALUES (:id, :k, :v)")
                ->execute([':id' => $contentId, ':k' => $key, ':v' => $value]);
        }
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
        return array_map(fn($r) => $this->formatRow($r), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function readByStatus(string $status): array
    {
        $stmt = $this->conn->prepare($this->baseSelect() . " WHERE c.status = :s ORDER BY c.created_at DESC");
        $stmt->execute([':s' => $status]);
        return array_map(fn($r) => $this->formatRow($r), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function readByLabel(string $labelKey, ?string $status = null): array
    {
        // Label is stored in content_fields as 'label_key'
        $sql = "
            SELECT c.content_id, c.user_id, c.title, c.description,
                   c.status, c.post_type, c.author, c.created_at, c.updated_at,
                   cat.category_id, cat.label_name AS category_name
            FROM content c
            LEFT JOIN category cat ON c.category_id = cat.category_id
            INNER JOIN content_fields cm ON c.content_id = cm.content_id
                AND cm.meta_key = 'label_key' AND cm.meta_value = :lk
        ";
        $params = [':lk' => $labelKey];
        if ($status) { $sql .= " AND c.status = :s"; $params[':s'] = $status; }

        // Check for is_featured meta to sort featured first
        $sql .= " ORDER BY c.created_at DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
        return array_map(fn($r) => $this->formatRow($r), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function readByCategory(string $categoryKey, ?string $status = null, ?int $limit = null): array
    {
        $catName = match ($categoryKey) {
            'history'              => 'History',
            'arts-culture'         => 'Arts & Culture',
            'tourist-destinations' => 'Tourist Destinations',
            'news'                 => 'News',
            'events'               => 'Events',
            'community'            => 'Community',
            default                => $categoryKey,
        };
        $where = "WHERE cat.label_name = :cn";
        $params = [':cn' => $catName];
        if ($status) { $where .= " AND c.status = :s"; $params[':s'] = $status; }
        $lim = $limit ? "LIMIT {$limit}" : "";
        $stmt = $this->conn->prepare($this->baseSelect() . " {$where} ORDER BY c.created_at DESC {$lim}");
        $stmt->execute($params);
        return array_map(fn($r) => $this->formatRow($r), $stmt->fetchAll(PDO::FETCH_ASSOC));
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
        $lim = $limit ? "LIMIT {$limit}" : "";
        $q = $this->baseSelect() . "
            WHERE c.post_type = 'place' AND c.status = 'published'
            ORDER BY c.created_at DESC {$lim}
        ";
        $stmt = $this->conn->prepare($q);
        $stmt->execute();
        return array_map(fn($r) => $this->formatRow($r), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /**
     * Get featured posts filtered by label (for navbar dropdown featured content).
     * Returns published posts where is_featured meta = '1', optionally filtered by label_key meta.
     */
    public function readFeaturedByLabel(?string $labelKey = null, ?int $limit = null): array
    {
        $sql = "
            SELECT c.content_id, c.user_id, c.title, c.description,
                   c.status, c.post_type, c.author, c.created_at, c.updated_at,
                   cat.category_id, cat.label_name AS category_name
            FROM content c
            LEFT JOIN category cat ON c.category_id = cat.category_id
            INNER JOIN content_fields feat ON c.content_id = feat.content_id
                AND feat.meta_key = 'is_featured' AND feat.meta_value = '1'
            WHERE c.status = 'published'
        ";
        $params = [];
        if ($labelKey) {
            $sql .= " AND EXISTS (
                SELECT 1 FROM content_fields lm
                WHERE lm.content_id = c.content_id AND lm.meta_key = 'label_key' AND lm.meta_value = :lk
            )";
            $params[':lk'] = $labelKey;
        }
        $lim = $limit ? "LIMIT {$limit}" : "";
        $sql .= " ORDER BY c.created_at DESC {$lim}";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
        return array_map(fn($r) => $this->formatRow($r), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /**
     * Get featured posts grouped by category.
     */
    public function readFeaturedByCategory(?string $categoryKey = null, ?int $limit = null): array
    {
        $sql = "
            SELECT c.content_id, c.user_id, c.title, c.description,
                   c.status, c.post_type, c.author, c.created_at, c.updated_at,
                   cat.category_id, cat.label_name AS category_name
            FROM content c
            LEFT JOIN category cat ON c.category_id = cat.category_id
            INNER JOIN content_fields feat ON c.content_id = feat.content_id
                AND feat.meta_key = 'is_featured' AND feat.meta_value = '1'
            WHERE c.status = 'published'
        ";
        $params = [];
        if ($categoryKey) {
            $catName = match ($categoryKey) {
                'history' => 'History',
                'arts-culture' => 'Arts & Culture',
                'tourist-destinations' => 'Tourist Destinations',
                'news' => 'News',
                'events' => 'Events',
                default => $categoryKey,
            };
            $sql .= " AND cat.label_name = :cn";
            $params[':cn'] = $catName;
        }
        $lim = $limit ? "LIMIT {$limit}" : "";
        $sql .= " ORDER BY c.created_at DESC {$lim}";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
        return array_map(fn($r) => $this->formatRow($r), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function readPublishedNews(?int $limit = null): array
    {
        $lim = $limit ? "LIMIT {$limit}" : "";
        $q = "
            SELECT c.content_id, c.user_id, c.title, c.description,
                   c.status, c.post_type, c.author, c.created_at, c.updated_at,
                   cat.category_id, cat.label_name AS category_name,
                   nd.meta_value AS news_date
            FROM content c
            LEFT JOIN category cat ON c.category_id = cat.category_id
            LEFT JOIN content_fields nd ON c.content_id = nd.content_id AND nd.meta_key = 'news_date'
            WHERE c.post_type = 'news' AND c.status = 'published'
            ORDER BY nd.meta_value DESC {$lim}
        ";
        $stmt = $this->conn->prepare($q);
        $stmt->execute();
        return array_map(fn($r) => $this->formatRow($r), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function readPublishedEvents(?int $limit = null): array
    {
        $lim = $limit ? "LIMIT {$limit}" : "";
        $q = "
            SELECT c.content_id, c.user_id, c.title, c.description,
                   c.status, c.post_type, c.author, c.created_at, c.updated_at,
                   cat.category_id, cat.label_name AS category_name,
                   nd.meta_value AS news_date
            FROM content c
            LEFT JOIN category cat ON c.category_id = cat.category_id
            LEFT JOIN content_fields nd ON c.content_id = nd.content_id AND nd.meta_key = 'news_date'
            WHERE c.post_type = 'event' AND c.status = 'published'
            ORDER BY nd.meta_value DESC {$lim}
        ";
        $stmt = $this->conn->prepare($q);
        $stmt->execute();
        return array_map(fn($r) => $this->formatRow($r), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    // ── CREATE ─────────────────────────────────────────────────────

    public function create(array $data): int
    {
        $this->conn->beginTransaction();
        try {
            $stmt = $this->conn->prepare("
                INSERT INTO content
                  (user_id, category_id, title, description, status, post_type, author)
                VALUES
                  (:uid, :cid, :title, :desc, :status, :pt, :author)
            ");
            $stmt->execute([
                ':uid'    => $data['user_id'] ?? 1,
                ':cid'    => $data['category_id'] ?? null,
                ':title'  => $data['title'],
                ':desc'   => $data['description'] ?? '',
                ':status' => $data['status'] ?? 'draft',
                ':pt'     => $data['post_type'] ?? 'place',
                ':author' => $data['author'] ?? null,
            ]);
            $contentId = (int) $this->conn->lastInsertId();

            // Store meta fields
            $metaKeys = [
                'label_id', 'label_key', 'is_featured',
                'location', 'hours', 'visit_date', 'contact', 'established',
                'place_category', 'story', 'news_date',
            ];
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
                $lbl = $this->conn->prepare("SELECT label_key FROM category WHERE category_id = :id LIMIT 1");
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
            $allowed = ['title', 'description', 'status', 'post_type', 'category_id', 'author'];

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
            $metaKeys = [
                'label_id', 'label_key', 'is_featured',
                'location', 'hours', 'visit_date', 'contact', 'established',
                'place_category', 'story', 'news_date',
            ];
            foreach ($metaKeys as $mk) {
                if (array_key_exists($mk, $data)) {
                    $this->setMeta($id, $mk, $data[$mk] !== null ? (string) $data[$mk] : null);
                }
            }
            // Resolve label_key from label_id if label_id was updated
            if (array_key_exists('label_id', $data) && $data['label_id'] && !array_key_exists('label_key', $data)) {
                $lbl = $this->conn->prepare("SELECT label_key FROM category WHERE category_id = :lid LIMIT 1");
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

    // ── Format ─────────────────────────────────────────────────────

    private function formatRow(array $row): array
    {
        $contentId = (int) $row['content_id'];
        $postType  = $row['post_type'] ?? 'place';
        $images    = $this->getImages($contentId);
        $imageUrls = array_map(fn($img) => $img['image_url'], $images);
        $meta      = $this->getMeta($contentId);

        return [
            'id'              => (string) $contentId,
            'title'           => $row['title'],
            'body'            => $row['description'] ?? '',
            'contentCategory' => $this->mapCategoryKey($row['category_name'] ?? null),
            'label'           => $meta['label_key'] ?? 'destinations',
            'postType'        => $postType,
            'status'          => strtolower($row['status']),
            'image'           => $imageUrls,
            'isFeatured'      => (bool) ($meta['is_featured'] ?? false),
            'location'        => $meta['location'] ?? null,
            'hours'           => $meta['hours'] ?? null,
            'contact'         => $meta['contact'] ?? null,
            'established'     => $meta['established'] ?? null,
            'category'        => $meta['place_category'] ?? null,
            'story'           => $meta['story'] ?? null,
            'highlights'      => [],
            'newsDate'        => $meta['news_date'] ?? null,
            'author'          => $row['author'] ?? null,
            'createdAt'       => $row['created_at'],
            'updatedAt'       => $row['updated_at'],
        ];
    }

    private function mapCategoryKey(?string $name): string
    {
        return match ($name) {
            'History'              => 'history',
            'Arts & Culture'       => 'arts-culture',
            'Tourist Destinations' => 'tourist-destinations',
            'News'                 => 'news',
            'Events'               => 'events',
            default                => 'history',
        };
    }
}
