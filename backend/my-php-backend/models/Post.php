<?php
/**
 * Post Model — Reads from existing `cms`, `place`, `news`,
 * `content_image`, and `catergory` tables.
 *
 * Maps the multi-table DB structure → flat camelCase objects for the frontend.
 */

class Post
{
    private PDO $conn;

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    // ── READ ───────────────────────────────────────────────────────

    /** Fetch all posts (cms + place/news + images + category), newest first. */
    public function readAll(): array
    {
        $query = "
            SELECT
                c.content_id, c.user_id, c.title, c.description,
                c.status, c.is_featured, c.created_at, c.updated_at,
                -- category (table is misspelled in DB as 'catergory')
                cat.category_id, cat.label_name, cat.color_code,
                -- place details (NULL if not a place)
                p.place_id, p.location, p.hours, p.date AS place_date,
                p.contact, p.established, p.category AS place_category, p.story,
                -- news details (NULL if not news)
                n.news_id, n.date AS news_date
            FROM cms c
            LEFT JOIN catergory cat ON c.category_id = cat.category_id
            LEFT JOIN place p       ON p.content_id  = c.content_id
            LEFT JOIN news n        ON n.content_id  = c.content_id
            ORDER BY c.created_at DESC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(fn($row) => $this->formatRow($row), $rows);
    }

    /** Fetch posts filtered by status (PUBLISHED / DRAFT / ARCHIVED). */
    public function readByStatus(string $status): array
    {
        $status = strtoupper($status);

        $query = "
            SELECT
                c.content_id, c.user_id, c.title, c.description,
                c.status, c.is_featured, c.created_at, c.updated_at,
                cat.category_id, cat.label_name, cat.color_code,
                p.place_id, p.location, p.hours, p.date AS place_date,
                p.contact, p.established, p.category AS place_category, p.story,
                n.news_id, n.date AS news_date
            FROM cms c
            LEFT JOIN catergory cat ON c.category_id = cat.category_id
            LEFT JOIN place p       ON p.content_id  = c.content_id
            LEFT JOIN news n        ON n.content_id  = c.content_id
            WHERE c.status = :status
            ORDER BY c.created_at DESC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([':status' => $status]);
        return array_map(fn($row) => $this->formatRow($row), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /** Fetch a single post by content_id. */
    public function readOne(int $id): array|false
    {
        $query = "
            SELECT
                c.content_id, c.user_id, c.title, c.description,
                c.status, c.is_featured, c.created_at, c.updated_at,
                cat.category_id, cat.label_name, cat.color_code,
                p.place_id, p.location, p.hours, p.date AS place_date,
                p.contact, p.established, p.category AS place_category, p.story,
                n.news_id, n.date AS news_date
            FROM cms c
            LEFT JOIN catergory cat ON c.category_id = cat.category_id
            LEFT JOIN place p       ON p.content_id  = c.content_id
            LEFT JOIN news n        ON n.content_id  = c.content_id
            WHERE c.content_id = :id
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ? $this->formatRow($row) : false;
    }

    /** Fetch only published places (for the public site). */
    public function readPublishedPlaces(): array
    {
        $query = "
            SELECT
                c.content_id, c.user_id, c.title, c.description,
                c.status, c.is_featured, c.created_at, c.updated_at,
                cat.category_id, cat.label_name, cat.color_code,
                p.place_id, p.location, p.hours, p.date AS place_date,
                p.contact, p.established, p.category AS place_category, p.story
            FROM cms c
            INNER JOIN place p      ON p.content_id  = c.content_id
            LEFT JOIN catergory cat  ON c.category_id = cat.category_id
            WHERE c.status = 'PUBLISHED'
            ORDER BY c.created_at DESC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return array_map(fn($row) => $this->formatRow($row), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /** Fetch only published news (for the public site). */
    public function readPublishedNews(): array
    {
        $query = "
            SELECT
                c.content_id, c.user_id, c.title, c.description,
                c.status, c.is_featured, c.created_at, c.updated_at,
                cat.category_id, cat.label_name, cat.color_code,
                n.news_id, n.date AS news_date
            FROM cms c
            INNER JOIN news n       ON n.content_id  = c.content_id
            LEFT JOIN catergory cat  ON c.category_id = cat.category_id
            WHERE c.status = 'PUBLISHED'
            ORDER BY n.date DESC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return array_map(fn($row) => $this->formatRow($row), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    // ── Images helper ──────────────────────────────────────────────

    /** Fetch all images for a given content_id. */
    public function getImages(int $contentId): array
    {
        $query = "SELECT image_id, image_url, is_thumbnail
                  FROM content_image
                  WHERE content_id = :id
                  ORDER BY is_thumbnail DESC, image_id ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([':id' => $contentId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ── Format ─────────────────────────────────────────────────────

    /**
     * Map the multi-table row → camelCase object matching the frontend CMSPost type.
     */
    private function formatRow(array $row): array
    {
        $contentId = (int) $row['content_id'];
        $isPlace   = !empty($row['place_id']);
        $isNews    = !empty($row['news_id']);

        // Fetch images for this content
        $images    = $this->getImages($contentId);
        $imageUrls = array_map(fn($img) => $img['image_url'], $images);

        return [
            'id'          => (string) $contentId,
            'title'       => $row['title'],
            'body'        => $row['description'] ?? '',
            'label'       => strtolower($row['label_name'] ?? 'tourism'),
            'postType'    => $isNews ? 'news' : 'place',
            'status'      => strtolower($row['status']),
            'image'       => $imageUrls,
            'isFeatured'  => (bool) ($row['is_featured'] ?? false),
            // Place fields
            'location'    => $row['location'] ?? null,
            'hours'       => $row['hours'] ?? null,
            'contact'     => $row['contact'] ?? null,
            'established' => $row['established'] ?? null,
            'category'    => $row['place_category'] ?? ($row['label_name'] ?? null),
            'story'       => $row['story'] ?? null,
            'highlights'  => [],   // Not stored in DB; managed in frontend for now
            // News fields
            'newsDate'    => $row['news_date'] ?? null,
            // Meta
            'createdAt'   => $row['created_at'],
            'updatedAt'   => $row['updated_at'],
        ];
    }
}
