<?php
/**
 * Inquiry Model — Schema v5 (hybrid + reply thread + assignment).
 * Real sortable columns: date_of_visit, number_of_pax.
 * Contextual extras stored in additional_details JSON:
 *   school_name, company_name, referral_source, dietary_needs, etc.
 *
 * inquiry_type is VARCHAR (general_contact, tour_booking, partnership, …).
 * status ENUM: unread, in_progress, assigned, archived, spam, trash.
 *   - assigned  → marked as assigned to a tourist guide (replaces 'resolved')
 *   - spam      → flagged as spam, hidden from main inbox
 *   - trash     → soft-deleted, shown in Trash tab, can be permanently removed
 * reply_text / replied_at / replied_by → in-app reply thread.
 * assigned_to → tourist guide name/ID handling this inquiry.
 */

class Inquiry
{
    private PDO $conn;

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    // ── Shared SELECT ──────────────────────────────────────────────

    private function baseSelect(): string
    {
        return "
            SELECT inquiry_id, inquiry_type, full_name, email_address,
                   contact_number, date_of_visit, number_of_pax,
                   message, additional_details, status,
                   assigned_to, reply_text, replied_at, replied_by,
                   created_at
            FROM inquiries
        ";
    }

    /** Fetch all inquiries, newest first. */
    public function readAll(): array
    {
        $stmt = $this->conn->prepare($this->baseSelect() . " ORDER BY created_at DESC");
        $stmt->execute();
        return array_map([$this, 'formatRow'], $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /** Fetch inquiries filtered by status. */
    public function readByStatus(string $status): array
    {
        $stmt = $this->conn->prepare($this->baseSelect() . " WHERE status = :status ORDER BY created_at DESC");
        $stmt->execute([':status' => $status]);
        return array_map([$this, 'formatRow'], $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /** Fetch a single inquiry. */
    public function readOne(int $id): array|false
    {
        $stmt = $this->conn->prepare($this->baseSelect() . " WHERE inquiry_id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $this->formatRow($row) : false;
    }

    /**
     * Create a new inquiry.
     *
     * @param array $data Keys:
     *   name, email, contactNumber?, inquiryType?, dateOfVisit?, numberOfPax?,
     *   message, additionalDetails? (assoc array → JSON)
     */
    public function create(array $data): bool
    {
        try {
            $query = "
                INSERT INTO inquiries
                  (inquiry_type, full_name, email_address, contact_number,
                   date_of_visit, number_of_pax, message, additional_details)
                VALUES
                  (:inquiry_type, :full_name, :email, :contact_number,
                   :date_of_visit, :number_of_pax, :message, :additional_details)
            ";

            $extras = $data['additionalDetails'] ?? null;
            $extrasJson = $extras ? json_encode($extras, JSON_UNESCAPED_UNICODE) : null;

            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                ':inquiry_type'       => $data['inquiryType'] ?? 'general_contact',
                ':full_name'          => $data['name'],
                ':email'              => $data['email'],
                ':contact_number'     => $data['contactNumber'] ?? null,
                ':date_of_visit'      => $data['dateOfVisit'] ?? null,
                ':number_of_pax'      => !empty($data['numberOfPax']) ? (int) $data['numberOfPax'] : null,
                ':message'            => $data['message'] ?? null,
                ':additional_details' => $extrasJson,
            ]);

            return true;
        } catch (PDOException $e) {
            error_log("Inquiry::create error: " . $e->getMessage());
            return false;
        }
    }

    /** Update inquiry — status, assignment, or save a reply. */
    public function update(int $id, array $data): bool
    {
        $fields = [];
        $params = [':id' => $id];

        if (array_key_exists('status', $data)) {
            $fields[] = "status = :status";
            $params[':status'] = $data['status'];
        }

        if (array_key_exists('assigned_to', $data)) {
            $fields[] = "assigned_to = :assigned_to";
            $params[':assigned_to'] = $data['assigned_to'];
        }

        if (array_key_exists('reply_text', $data)) {
            $fields[] = "reply_text = :reply_text";
            $params[':reply_text'] = $data['reply_text'];
        }

        if (array_key_exists('replied_at', $data)) {
            $fields[] = "replied_at = :replied_at";
            $params[':replied_at'] = $data['replied_at'];
        }

        if (array_key_exists('replied_by', $data)) {
            $fields[] = "replied_by = :replied_by";
            $params[':replied_by'] = $data['replied_by'];
        }

        if (empty($fields)) return true;

        $query = "UPDATE inquiries SET " . implode(', ', $fields) . " WHERE inquiry_id = :id";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute($params);
    }

    /** Permanently delete an inquiry. */
    public function delete(int $id): bool
    {
        $stmt = $this->conn->prepare("DELETE FROM inquiries WHERE inquiry_id = :id");
        return $stmt->execute([':id' => $id]);
    }

    // ── Format ─────────────────────────────────────────────────────

    private function formatRow(array $row): array
    {
        $extras = null;
        if (!empty($row['additional_details'])) {
            $extras = json_decode($row['additional_details'], true);
        }

        return [
            'id'                => (string) $row['inquiry_id'],
            'inquiryType'       => $row['inquiry_type'],
            'name'              => $row['full_name'] ?? '',
            'email'             => $row['email_address'] ?? '',
            'contactNumber'     => $row['contact_number'] ?? null,
            'dateOfVisit'       => $row['date_of_visit'] ?? null,
            'numberOfPax'       => $row['number_of_pax'] ? (int) $row['number_of_pax'] : null,
            'message'           => $row['message'] ?? '',
            'additionalDetails' => $extras,
            'status'            => $row['status'],
            'assignedTo'        => $row['assigned_to'] ?? null,
            'replyText'         => $row['reply_text'] ?? null,
            'repliedAt'         => $row['replied_at'] ?? null,
            'repliedBy'         => $row['replied_by'] ?? null,
            'createdAt'         => $row['created_at'],
        ];
    }
}
