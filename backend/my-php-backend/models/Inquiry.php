<?php
/**
 * Inquiry Model — Optimized schema.
 * Reads from flat `inquiries` table (sender + student fields inlined).
 * JOINs only `visit_purposes` for purpose name lookup.
 */

class Inquiry
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
                i.inquiry_id, i.full_name, i.email_address, i.contact_number,
                i.inquiry_type, i.subject, i.purpose_id, i.date_of_visit, i.number_of_pax,
                i.message, i.is_read, i.is_assigned, i.folder,
                i.reply_message, i.replied_at,
                i.student_number, i.school_name,
                i.created_at, i.deleted_at,
                vp.purpose_name
            FROM inquiries i
            LEFT JOIN visit_purposes vp ON i.purpose_id = vp.purpose_id
        ";
    }

    /** Fetch all inquiries, newest first. */
    public function readAll(): array
    {
        $stmt = $this->conn->prepare($this->baseSelect() . " ORDER BY i.created_at DESC");
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
        $stmt = $this->conn->prepare($this->baseSelect() . " WHERE i.inquiry_id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $this->formatRow($row) : false;
    }

    /** Create a new inquiry (from the public contact/inquire form). */
    public function create(array $data): bool
    {
        try {
            $query = "
                INSERT INTO inquiries
                  (full_name, email_address, contact_number,
                   inquiry_type, purpose_id, date_of_visit, number_of_pax, message,
                   student_number, school_name)
                VALUES
                  (:name, :email, :contact,
                   :type, :purpose_id, :date_of_visit, :number_of_pax, :message,
                   :student_number, :school_name)
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                ':name'           => $data['name'],
                ':email'          => $data['email'],
                ':contact'        => $data['contactNumber'] ?? null,
                ':type'           => $data['type'] ?? 1,
                ':purpose_id'     => $data['purposeId'] ?? null,
                ':date_of_visit'  => $data['dateOfVisit'] ?? null,
                ':number_of_pax'  => $data['numberOfPax'] ?? null,
                ':message'        => $data['message'],
                ':student_number' => $data['studentNumber'] ?? null,
                ':school_name'    => $data['schoolName'] ?? null,
            ]);

            return true;
        } catch (PDOException $e) {
            error_log("Inquiry::create error: " . $e->getMessage());
            return false;
        }
    }

    /** Update inquiry flags (is_read, is_assigned, folder, reply, status). */
    public function update(int $id, array $data): bool
    {
        $fields = [];
        $params = [':id' => $id];

        if (array_key_exists('isRead', $data)) {
            $fields[] = "is_read = :is_read";
            $params[':is_read'] = $data['isRead'] ? 1 : 0;
        }
        if (array_key_exists('isAssigned', $data)) {
            $fields[] = "is_assigned = :is_assigned";
            $params[':is_assigned'] = $data['isAssigned'] ? 1 : 0;
        }
        if (array_key_exists('folder', $data)) {
            $fields[] = "folder = :folder";
            $params[':folder'] = $data['folder'];
        }
        if (array_key_exists('deletedAt', $data)) {
            $fields[] = "deleted_at = :deleted_at";
            $params[':deleted_at'] = $data['deletedAt'];
        }
        if (array_key_exists('replyMessage', $data)) {
            $fields[] = "reply_message = :reply_message";
            $params[':reply_message'] = $data['replyMessage'];
        }
        if (array_key_exists('repliedAt', $data)) {
            $fields[] = "replied_at = :replied_at";
            $params[':replied_at'] = $data['repliedAt'];
        }

        // Handle frontend status → DB fields mapping
        if (array_key_exists('status', $data)) {
            $status = $data['status'];
            switch ($status) {
                case 'unread':
                    $fields[] = "is_read = 0";
                    $fields[] = "folder = 'inbox'";
                    break;
                case 'read':
                    $fields[] = "is_read = 1";
                    $fields[] = "folder = 'inbox'";
                    break;
                case 'replied':
                    $fields[] = "is_read = 1";
                    $fields[] = "folder = 'inbox'";
                    break;
                case 'archived':
                    $fields[] = "folder = 'archive'";
                    break;
                case 'spam':
                    $fields[] = "folder = 'spam'";
                    break;
                case 'trash':
                    $fields[] = "folder = 'trash'";
                    if (!array_key_exists('deletedAt', $data)) {
                        $fields[] = "deleted_at = NOW()";
                    }
                    break;
            }
        }

        if (empty($fields)) return true;

        $query = "UPDATE inquiries SET " . implode(', ', $fields) . " WHERE inquiry_id = :id";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute($params);
    }

    /** Reply to an inquiry — set reply message + mark as replied. */
    public function reply(int $id, string $message): bool
    {
        $query = "UPDATE inquiries SET reply_message = :msg, replied_at = NOW(), is_read = 1 WHERE inquiry_id = :id";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([':msg' => $message, ':id' => $id]);
    }

    /** Permanently delete an inquiry. */
    public function delete(int $id): bool
    {
        $stmt = $this->conn->prepare("DELETE FROM inquiries WHERE inquiry_id = :id");
        return $stmt->execute([':id' => $id]);
    }

    // ── Format ─────────────────────────────────────────────────────

    /**
     * Derive a single status string from DB flags for the frontend.
     * Priority: trash > spam > archived > replied > read > unread
     * isAssigned is a separate boolean flag, not a status.
     */
    private function formatRow(array $row): array
    {
        $folder     = strtolower($row['folder'] ?? 'inbox');
        $isRead     = (bool) $row['is_read'];
        $isAssigned = (bool) $row['is_assigned'];
        $deleted    = !empty($row['deleted_at']);

        $hasReply    = !empty($row['reply_message']);

        if ($deleted || $folder === 'trash')     $status = 'trash';
        elseif ($folder === 'spam')              $status = 'spam';
        elseif ($folder === 'archive')           $status = 'archived';
        elseif ($hasReply)                       $status = 'replied';
        elseif ($isRead)                         $status = 'read';
        else                                     $status = 'unread';

        // Map inquiry_type int to string
        $typeInt = (int) ($row['inquiry_type'] ?? 1);
        $inquiryType = $typeInt === 2 ? 'student' : 'general';

        return [
            'id'            => (string) $row['inquiry_id'],
            'name'          => $row['full_name'] ?? '',
            'email'         => $row['email_address'] ?? '',
            'contactNumber' => $row['contact_number'] ?? null,
            'subject'       => $row['subject'] ?? $row['purpose_name'] ?? 'General Inquiry',
            'message'       => $row['message'] ?? '',
            'status'        => $status,
            'inquiryType'   => $inquiryType,
            'isAssigned'    => $isAssigned,
            'purposeName'   => $row['purpose_name'] ?? null,
            'dateOfVisit'   => $row['date_of_visit'] ?? null,
            'numberOfPax'   => $row['number_of_pax'] ? (int) $row['number_of_pax'] : null,
            'studentNumber' => $row['student_number'] ?? null,
            'schoolName'    => $row['school_name'] ?? null,
            'replyMessage'  => $row['reply_message'] ?? null,
            'repliedAt'     => $row['replied_at'] ?? null,
            'trashedAt'     => $row['deleted_at'] ?? null,
            'createdAt'     => $row['created_at'],
        ];
    }
}
