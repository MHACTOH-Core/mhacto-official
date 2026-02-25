<?php
/**
 * Inquiry Model — Reads from existing `customer_inquiries`,
 * `inquiry_sender`, and `visit_purposes` tables.
 */

class Inquiry
{
    private PDO $conn;

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    /** Fetch all inquiries with sender info, newest first. */
    public function readAll(): array
    {
        $query = "
            SELECT
                ci.inquiry_id, ci.sender_id, ci.Type, ci.purpose_id,
                ci.date_of_visit, ci.number_of_pax, ci.message,
                ci.is_read, ci.is_starred, ci.folder,
                ci.created_at, ci.deleted_at,
                s.full_name, s.email_address, s.contact_number,
                vp.purpose_name
            FROM customer_inquiries ci
            LEFT JOIN inquiry_sender s  ON ci.sender_id  = s.sender_id
            LEFT JOIN visit_purposes vp ON ci.purpose_id = vp.purpose_id
            ORDER BY ci.created_at DESC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return array_map([$this, 'formatRow'], $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /** Fetch inquiries by derived status. */
    public function readByStatus(string $status): array
    {
        $all = $this->readAll();
        return array_values(array_filter($all, fn($inq) => $inq['status'] === $status));
    }

    /** Fetch a single inquiry. */
    public function readOne(int $id): array|false
    {
        $query = "
            SELECT
                ci.inquiry_id, ci.sender_id, ci.Type, ci.purpose_id,
                ci.date_of_visit, ci.number_of_pax, ci.message,
                ci.is_read, ci.is_starred, ci.folder,
                ci.created_at, ci.deleted_at,
                s.full_name, s.email_address, s.contact_number,
                vp.purpose_name
            FROM customer_inquiries ci
            LEFT JOIN inquiry_sender s  ON ci.sender_id  = s.sender_id
            LEFT JOIN visit_purposes vp ON ci.purpose_id = vp.purpose_id
            WHERE ci.inquiry_id = :id
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $this->formatRow($row) : false;
    }

    /** Create a new inquiry (from the public contact/inquire form). */
    public function create(array $data): bool
    {
        try {
            $this->conn->beginTransaction();

            // 1. Upsert the sender
            $senderId = $this->upsertSender(
                $data['name'],
                $data['email'],
                $data['contactNumber'] ?? null
            );

            // 2. Insert the inquiry
            $query = "INSERT INTO customer_inquiries
                        (sender_id, Type, purpose_id, date_of_visit, number_of_pax, message)
                      VALUES
                        (:sender_id, :type, :purpose_id, :date_of_visit, :number_of_pax, :message)";

            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                ':sender_id'     => $senderId,
                ':type'          => $data['type'] ?? 1,
                ':purpose_id'    => $data['purposeId'] ?? null,
                ':date_of_visit' => $data['dateOfVisit'] ?? null,
                ':number_of_pax' => $data['numberOfPax'] ?? null,
                ':message'       => $data['message'],
            ]);

            $this->conn->commit();
            return true;
        } catch (PDOException $e) {
            $this->conn->rollBack();
            error_log("Inquiry::create error: " . $e->getMessage());
            return false;
        }
    }

    /** Update inquiry flags (is_read, is_starred, folder). */
    public function update(int $id, array $data): bool
    {
        $fields = [];
        $params = [':id' => $id];

        if (array_key_exists('isRead', $data)) {
            $fields[] = "is_read = :is_read";
            $params[':is_read'] = $data['isRead'] ? 1 : 0;
        }
        if (array_key_exists('isStarred', $data)) {
            $fields[] = "is_starred = :is_starred";
            $params[':is_starred'] = $data['isStarred'] ? 1 : 0;
        }
        if (array_key_exists('folder', $data)) {
            $fields[] = "folder = :folder";
            $params[':folder'] = $data['folder'];
        }
        if (array_key_exists('deletedAt', $data)) {
            $fields[] = "deleted_at = :deleted_at";
            $params[':deleted_at'] = $data['deletedAt'];
        }

        if (empty($fields)) return true;

        $query = "UPDATE customer_inquiries SET " . implode(', ', $fields) . " WHERE inquiry_id = :id";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute($params);
    }

    /** Permanently delete an inquiry. */
    public function delete(int $id): bool
    {
        $query = "DELETE FROM customer_inquiries WHERE inquiry_id = :id";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([':id' => $id]);
    }

    // ── Helpers ────────────────────────────────────────────────────

    /** Find or create sender, return sender_id. */
    private function upsertSender(string $name, string $email, ?string $contact): int
    {
        $stmt = $this->conn->prepare(
            "SELECT sender_id FROM inquiry_sender WHERE email_address = :email LIMIT 1"
        );
        $stmt->execute([':email' => $email]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) return (int) $row['sender_id'];

        $stmt = $this->conn->prepare(
            "INSERT INTO inquiry_sender (full_name, email_address, contact_number)
             VALUES (:name, :email, :contact)"
        );
        $stmt->execute([':name' => $name, ':email' => $email, ':contact' => $contact]);
        return (int) $this->conn->lastInsertId();
    }

    /**
     * Derive a single status string from DB flags for the frontend.
     * Priority: trash > spam > starred > replied > read > unread
     */
    private function formatRow(array $row): array
    {
        $folder    = strtolower($row['folder'] ?? 'inbox');
        $isRead    = (bool) $row['is_read'];
        $isStarred = (bool) $row['is_starred'];
        $deleted   = !empty($row['deleted_at']);

        if ($deleted || $folder === 'trash')     $status = 'trash';
        elseif ($folder === 'spam')              $status = 'spam';
        elseif ($folder === 'archived')          $status = 'archived';
        elseif ($isStarred)                      $status = 'starred';
        elseif ($isRead)                         $status = 'read';
        else                                     $status = 'unread';

        return [
            'id'            => (string) $row['inquiry_id'],
            'name'          => $row['full_name'] ?? '',
            'email'         => $row['email_address'] ?? '',
            'contactNumber' => $row['contact_number'] ?? null,
            'subject'       => $row['purpose_name'] ?? 'General Inquiry',
            'message'       => $row['message'] ?? '',
            'status'        => $status,
            'type'          => (int) ($row['Type'] ?? 1),
            'dateOfVisit'   => $row['date_of_visit'] ?? null,
            'numberOfPax'   => $row['number_of_pax'] ?? null,
            'replyMessage'  => null,  // Reply system not yet in DB
            'repliedAt'     => null,
            'trashedAt'     => $row['deleted_at'] ?? null,
            'createdAt'     => $row['created_at'],
        ];
    }
}
