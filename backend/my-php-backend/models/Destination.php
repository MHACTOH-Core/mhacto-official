<?php
/**
 * Destination Model — Schema v2.
 * Now reads from `content` + `content_fields` (location, hours, contact as meta keys).
 * Uses the unified CMS schema instead of old `cms` + `place` join.
 */

class Destination
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    /**
     * Read all published places with their meta (location, hours, contact).
     */
    public function readAll()
    {
        $query = "
            SELECT c.content_id, c.title, c.description, c.status,
                   loc.meta_value AS location,
                   hrs.meta_value AS hours,
                   con.meta_value AS contact
            FROM content c
            LEFT JOIN content_fields loc ON c.content_id = loc.content_id AND loc.meta_key = 'location'
            LEFT JOIN content_fields hrs ON c.content_id = hrs.content_id AND hrs.meta_key = 'hours'
            LEFT JOIN content_fields con ON c.content_id = con.content_id AND con.meta_key = 'contact'
            WHERE c.status = 'published' AND c.post_type = 'place'
            ORDER BY c.created_at DESC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    /**
     * Create a new place destination.
     */
    public function create($user_id, $title, $description, $location, $hours, $contact)
    {
        try {
            $this->conn->beginTransaction();

            // Insert into content table
            $query_content = "INSERT INTO content (user_id, title, description, status, post_type)
                              VALUES (:user_id, :title, :description, 'published', 'place')";
            $stmt_content = $this->conn->prepare($query_content);

            $title = htmlspecialchars(strip_tags($title));
            $description = htmlspecialchars(strip_tags($description));

            $stmt_content->bindParam(':user_id', $user_id);
            $stmt_content->bindParam(':title', $title);
            $stmt_content->bindParam(':description', $description);
            $stmt_content->execute();

            $new_content_id = $this->conn->lastInsertId();

            // Insert meta keys for place-specific data
            $metaStmt = $this->conn->prepare(
                "INSERT INTO content_fields (content_id, meta_key, meta_value) VALUES (:cid, :mk, :mv)"
            );

            $location = htmlspecialchars(strip_tags($location));
            $hours = htmlspecialchars(strip_tags($hours));
            $contact = htmlspecialchars(strip_tags($contact));

            $metaStmt->execute([':cid' => $new_content_id, ':mk' => 'location', ':mv' => $location]);
            $metaStmt->execute([':cid' => $new_content_id, ':mk' => 'hours',    ':mv' => $hours]);
            $metaStmt->execute([':cid' => $new_content_id, ':mk' => 'contact',  ':mv' => $contact]);

            $this->conn->commit();
            return true;

        } catch (PDOException $exception) {
            $this->conn->rollBack();
            error_log("Destination::create error: " . $exception->getMessage());
            return false;
        }
    }
}
