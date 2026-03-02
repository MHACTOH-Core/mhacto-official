<?php
/**
 * Post Model — Full CRUD for CMS content.
 * Optimized schema: reads from `content`, `content_images`, `categories`.
 * No more JOINs to `place` / `news` — columns are inlined in `content`.
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
                c.status, c.post_type, c.is_featured, c.created_at, c.updated_at,
                c.location, c.hours, c.visit_date AS place_date,
                c.contact, c.established, c.place_category, c.story,
                c.news_date,
                cat.category_id, cat.label_name AS category_name,
                lbl.category_id AS label_id, lbl.label_key, lbl.label_name AS label_display
            FROM content c
            LEFT JOIN categories cat ON c.category_id = cat.category_id
            LEFT JOIN categories lbl ON c.label_id    = lbl.category_id
        ";
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
        $where = "WHERE lbl.label_key = :lk";
        $params = [':lk' => $labelKey];
        if ($status) { $where .= " AND c.status = :s"; $params[':s'] = $status; }
        $stmt = $this->conn->prepare($this->baseSelect() . " {$where} ORDER BY c.is_featured DESC, c.created_at DESC");
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
        $stmt = $this->conn->prepare($this->baseSelect() . " {$where} ORDER BY c.is_featured DESC, c.created_at DESC {$lim}");
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
            ORDER BY c.is_featured DESC, c.created_at DESC {$lim}
        ";
        $stmt = $this->conn->prepare($q);
        $stmt->execute();
        return array_map(fn($r) => $this->formatRow($r), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /**
     * Get featured posts filtered by label (for navbar dropdown featured content).
     * Returns published posts where is_featured=1, optionally filtered by label key.
     */
    public function readFeaturedByLabel(?string $labelKey = null, ?int $limit = null): array
    {
        $where = "WHERE c.is_featured = 1 AND c.status = 'published'";
        $params = [];
        if ($labelKey) {
            $where .= " AND lbl.label_key = :lk";
            $params[':lk'] = $labelKey;
        }
        $lim = $limit ? "LIMIT {$limit}" : "";
        $q = $this->baseSelect() . " {$where} ORDER BY c.created_at DESC {$lim}";
        $stmt = $this->conn->prepare($q);
        $stmt->execute($params);
        return array_map(fn($r) => $this->formatRow($r), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /**
     * Get featured posts grouped by category.
     * Returns published featured posts for all categories.
     */
    public function readFeaturedByCategory(?string $categoryKey = null, ?int $limit = null): array
    {
        $where = "WHERE c.is_featured = 1 AND c.status = 'published'";
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
            $where .= " AND cat.label_name = :cn";
            $params[':cn'] = $catName;
        }
        $lim = $limit ? "LIMIT {$limit}" : "";
        $q = $this->baseSelect() . " {$where} ORDER BY c.created_at DESC {$lim}";
        $stmt = $this->conn->prepare($q);
        $stmt->execute($params);
        return array_map(fn($r) => $this->formatRow($r), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function readPublishedNews(?int $limit = null): array
    {
        $lim = $limit ? "LIMIT {$limit}" : "";
        $q = $this->baseSelect() . "
            WHERE c.post_type = 'news' AND c.status = 'published'
            ORDER BY c.news_date DESC {$lim}
        ";
        $stmt = $this->conn->prepare($q);
        $stmt->execute();
        return array_map(fn($r) => $this->formatRow($r), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function readPublishedEvents(?int $limit = null): array
    {
        $lim = $limit ? "LIMIT {$limit}" : "";
        $q = $this->baseSelect() . "
            WHERE c.post_type = 'event' AND c.status = 'published'
            ORDER BY c.news_date DESC {$lim}
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
                  (user_id, category_id, label_id, title, description, status, post_type, is_featured,
                   location, hours, visit_date, contact, established, place_category, story, news_date)
                VALUES
                  (:uid, :cid, :lid, :title, :desc, :status, :pt, :feat,
                   :loc, :hrs, :vdate, :con, :est, :pcat, :story, :ndate)
            ");
            $stmt->execute([
                ':uid'    => $data['user_id'] ?? 1,
                ':cid'    => $data['category_id'] ?? null,
                ':lid'    => $data['label_id'] ?? null,
                ':title'  => $data['title'],
                ':desc'   => $data['description'] ?? '',
                ':status' => $data['status'] ?? 'draft',
                ':pt'     => $data['post_type'] ?? 'place',
                ':feat'   => $data['is_featured'] ?? 0,
                // Place fields
                ':loc'    => $data['location'] ?? null,
                ':hrs'    => $data['hours'] ?? null,
                ':vdate'  => $data['place_date'] ?? null,
                ':con'    => $data['contact'] ?? null,
                ':est'    => $data['established'] ?? null,
                ':pcat'   => $data['place_category'] ?? null,
                ':story'  => $data['story'] ?? null,
                // News field
                ':ndate'  => $data['news_date'] ?? (in_array($data['post_type'] ?? '', ['news','event']) ? date('Y-m-d') : null),
            ]);
            $contentId = (int) $this->conn->lastInsertId();

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
            $fields = []; $params = [':id' => $id];

            // All updatable columns in the flat `content` table
            $allowed = [
                'title', 'description', 'status', 'post_type', 'is_featured',
                'category_id', 'label_id',
                'location', 'hours', 'contact', 'established', 'story',
            ];
            foreach ($allowed as $f) {
                if (array_key_exists($f, $data)) {
                    $fields[] = "{$f} = :{$f}";
                    $params[":{$f}"] = $data[$f];
                }
            }
            // place_category maps to place_category column
            if (array_key_exists('place_category', $data)) {
                $fields[] = "place_category = :pcat";
                $params[':pcat'] = $data['place_category'];
            }
            // place_date maps to visit_date
            if (array_key_exists('place_date', $data)) {
                $fields[] = "visit_date = :vdate";
                $params[':vdate'] = $data['place_date'];
            }
            // news_date
            if (array_key_exists('news_date', $data)) {
                $fields[] = "news_date = :ndate";
                $params[':ndate'] = $data['news_date'];
            }

            if ($fields) {
                $set = implode(', ', $fields);
                $this->conn->prepare("UPDATE content SET {$set} WHERE content_id = :id")->execute($params);
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
        // content_images has ON DELETE CASCADE, so just delete content
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

        return [
            'id'              => (string) $contentId,
            'title'           => $row['title'],
            'body'            => $row['description'] ?? '',
            'contentCategory' => $this->mapCategoryKey($row['category_name'] ?? null),
            'label'           => $row['label_key'] ?? 'destinations',
            'postType'        => $postType,
            'status'          => strtolower($row['status']),
            'image'           => $imageUrls,
            'isFeatured'      => (bool) ($row['is_featured'] ?? false),
            'location'        => $row['location'] ?? null,
            'hours'           => $row['hours'] ?? null,
            'contact'         => $row['contact'] ?? null,
            'established'     => $row['established'] ?? null,
            'category'        => $row['place_category'] ?? null,
            'story'           => $row['story'] ?? null,
            'highlights'      => [],
            'newsDate'        => $row['news_date'] ?? null,
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