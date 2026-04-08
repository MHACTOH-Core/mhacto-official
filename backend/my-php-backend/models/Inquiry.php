<?php
namespace App\Models;

use PDO;
use PDOException;

/**
 * Inquiry Model — Schema v6 (tour scheduling + walk-in support).
 * Real sortable columns: date_of_visit, confirmed_date, number_of_pax.
 * Contextual extras stored in additional_details JSON:
 *   school_name, company_name, referral_source, dietary_needs, etc.
 *
 * inquiry_type VARCHAR: general_contact | tour_booking | partnership | walk_in
 * status ENUM: unread, read, assigned, confirmed, completed,
 *              cancelled, expired, archived, spam, trash.
 *   - confirmed → admin set a tour date (confirmed_date + confirmed_by filled)
 *   - completed → tour done
 *   - cancelled → admin cancelled
 *   - expired   → set by autoExpire() when confirmed_date has passed and not completed
 * tourist_name → actual tour attendee (may differ from form submitter)
 * confirmed_date / confirmed_by → tour date + admin who confirmed
 * reply_text / replied_at / replied_by → in-app reply thread.
 * assigned_to → tourist guide name handling this inquiry.
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
            SELECT inquiry_id, inquiry_type, full_name, tourist_name, email_address,
                   contact_number, date_of_visit, number_of_pax,
                   message, additional_details, status,
                   assigned_to, confirmed_date, confirmed_by,
                   reply_text, replied_at, replied_by,
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
     * @return int|false New inquiry ID on success, false on failure.
     */
    public function create(array $data): int|false
    {
        try {
            $query = "
                INSERT INTO inquiries
                  (inquiry_type, full_name, tourist_name, email_address, contact_number,
                   date_of_visit, number_of_pax, message, additional_details,
                   consent_given, consent_text, submitter_ip, data_purge_date)
                VALUES
                  (:inquiry_type, :full_name, :tourist_name, :email, :contact_number,
                   :date_of_visit, :number_of_pax, :message, :additional_details,
                   :consent_given, :consent_text, :submitter_ip,
                   DATE_ADD(CURDATE(), INTERVAL 10 YEAR))
            ";

            $extras = $data['additionalDetails'] ?? null;
            $extrasJson = $extras ? json_encode($extras, JSON_UNESCAPED_UNICODE) : null;

            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                ':inquiry_type'       => $data['inquiryType'] ?? 'general_contact',
                ':full_name'          => $data['name'],
                ':tourist_name'       => $data['touristName'] ?? null,
                ':email'              => $data['email'],
                ':contact_number'     => $data['contactNumber'] ?? null,
                ':date_of_visit'      => $data['dateOfVisit'] ?? null,
                ':number_of_pax'      => !empty($data['numberOfPax']) ? (int) $data['numberOfPax'] : null,
                ':message'            => $data['message'] ?? null,
                ':additional_details' => $extrasJson,
                // RA 10173 §7: store consent evidence
                ':consent_given'      => $data['consentGiven'] ? 1 : 0,
                ':consent_text'       => $data['consentText'] ?? null,
                ':submitter_ip'       => $data['submitterIp'] ?? null,
            ]);

            return (int) $this->conn->lastInsertId();
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

        if (array_key_exists('tourist_name', $data)) {
            $fields[] = "tourist_name = :tourist_name";
            $params[':tourist_name'] = $data['tourist_name'] ? trim($data['tourist_name']) : null;
        }

        if (array_key_exists('assigned_to', $data)) {
            $fields[] = "assigned_to = :assigned_to";
            $params[':assigned_to'] = $data['assigned_to'];
        }

        if (array_key_exists('confirmed_date', $data)) {
            $fields[] = "confirmed_date = :confirmed_date";
            $params[':confirmed_date'] = $data['confirmed_date'];
        }

        if (array_key_exists('confirmed_by', $data)) {
            $fields[] = "confirmed_by = :confirmed_by";
            $params[':confirmed_by'] = $data['confirmed_by'];
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

    /**
     * Auto-expire confirmed inquiries whose confirmed_date is in the past
     * and status is still 'confirmed'. Run on each admin GET.
     */
    public function autoExpire(): void
    {
        $this->conn->exec("
            UPDATE inquiries
               SET status = 'expired'
             WHERE status = 'confirmed'
               AND confirmed_date < CURDATE()
        ");
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
            'touristName'       => $row['tourist_name'] ?? null,
            'email'             => $row['email_address'] ?? '',
            'contactNumber'     => $row['contact_number'] ?? null,
            'dateOfVisit'       => $row['date_of_visit'] ?? null,
            'numberOfPax'       => $row['number_of_pax'] ? (int) $row['number_of_pax'] : null,
            'message'           => $row['message'] ?? '',
            'additionalDetails' => $extras,
            'status'            => $row['status'],
            'assignedTo'        => $row['assigned_to'] ?? null,
            'confirmedDate'     => $row['confirmed_date'] ?? null,
            'confirmedBy'       => $row['confirmed_by'] ?? null,
            'replyText'         => $row['reply_text'] ?? null,
            'repliedAt'         => $row['replied_at'] ?? null,
            'repliedBy'         => $row['replied_by'] ?? null,
            'createdAt'         => $row['created_at'],
        ];
    }
}
