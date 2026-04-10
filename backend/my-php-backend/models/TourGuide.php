<?php
namespace App\Models;

use PDO;
use PDOException;

/**
 * TourGuide Model — non-account roster of tourist guides.
 * availability ENUM: available | unavailable | on_tour
 * is_active TINYINT: soft-delete flag (1 = active, 0 = archived)
 */

class TourGuide
{
    private PDO $conn;

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    // ── Lazy sync ──────────────────────────────────────────────────

    /**
     * Flip availability based on active appointments — no cron needed.
     * Only guides not manually set to 'unavailable' are auto-managed.
     * Called before every read so the data is always fresh.
     */
    public function syncAvailability(): void
    {
        $now = date('Y-m-d H:i:s');

        // Flip to on_tour if currently inside an appointment window
        $this->conn->prepare(
            "UPDATE tour_guides tg
                SET tg.availability = 'on_tour'
              WHERE tg.is_active = 1
                AND tg.availability != 'unavailable'
                AND EXISTS (
                    SELECT 1 FROM tour_appointments ta
                     WHERE ta.guide_id = tg.guide_id
                       AND ta.start_datetime <= :now1
                       AND ta.end_datetime   >= :now2
                )"
        )->execute([':now1' => $now, ':now2' => $now]);

        // Flip back to available when no active appointment window remains
        $this->conn->prepare(
            "UPDATE tour_guides tg
                SET tg.availability = 'available'
              WHERE tg.is_active = 1
                AND tg.availability = 'on_tour'
                AND NOT EXISTS (
                    SELECT 1 FROM tour_appointments ta
                     WHERE ta.guide_id = tg.guide_id
                       AND ta.start_datetime <= :now1
                       AND ta.end_datetime   >= :now2
                )"
        )->execute([':now1' => $now, ':now2' => $now]);
    }

    // ── Read ───────────────────────────────────────────────────────

    /** Fetch all active guides ordered by name. Runs availability sync first. */
    public function readAll(bool $activeOnly = false): array
    {
        $this->syncAvailability();
        $where = $activeOnly ? "WHERE is_active = 1" : "";
        $stmt  = $this->conn->prepare(
            "SELECT guide_id, full_name, phone_number, availability, is_active, created_at, updated_at
               FROM tour_guides
               $where
              ORDER BY full_name ASC"
        );
        $stmt->execute();
        return array_map([$this, 'formatRow'], $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /** Fetch a single guide. Runs availability sync first. */
    public function readOne(int $id): array|false
    {
        $this->syncAvailability();
        $stmt = $this->conn->prepare(
            "SELECT guide_id, full_name, phone_number, availability, is_active, created_at, updated_at
               FROM tour_guides
              WHERE guide_id = :id LIMIT 1"
        );
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $this->formatRow($row) : false;
    }

    // ── Appointments ───────────────────────────────────────────────

    /** Fetch all appointments for a guide, ordered by start time. */
    public function getAppointments(int $guideId): array
    {
        $stmt = $this->conn->prepare(
            "SELECT appointment_id, guide_id, title, start_datetime, end_datetime, notes, created_at, updated_at
               FROM tour_appointments
              WHERE guide_id = :guide_id
              ORDER BY start_datetime ASC"
        );
        $stmt->execute([':guide_id' => $guideId]);
        return array_map([$this, 'formatAppointmentRow'], $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /** Create a new appointment for a guide. Returns new appointment_id or false. */
    public function createAppointment(int $guideId, array $data): int|false
    {
        try {
            $stmt = $this->conn->prepare(
                "INSERT INTO tour_appointments (guide_id, title, start_datetime, end_datetime, notes)
                 VALUES (:guide_id, :title, :start_datetime, :end_datetime, :notes)"
            );
            $stmt->execute([
                ':guide_id'       => $guideId,
                ':title'          => substr(trim($data['title']), 0, 200),
                ':start_datetime' => $data['startDatetime'],
                ':end_datetime'   => $data['endDatetime'],
                ':notes'          => $data['notes'] ?? null,
            ]);
            return (int) $this->conn->lastInsertId();
        } catch (PDOException $e) {
            error_log("TourGuide::createAppointment error: " . $e->getMessage());
            return false;
        }
    }

    /** Update an existing appointment. Returns true on success. */
    public function updateAppointment(int $appointmentId, array $data): bool
    {
        $fields = [];
        $params = [':id' => $appointmentId];

        if (array_key_exists('title', $data)) {
            $fields[] = "title = :title";
            $params[':title'] = substr(trim($data['title']), 0, 200);
        }
        if (array_key_exists('startDatetime', $data)) {
            $fields[] = "start_datetime = :start_datetime";
            $params[':start_datetime'] = $data['startDatetime'];
        }
        if (array_key_exists('endDatetime', $data)) {
            $fields[] = "end_datetime = :end_datetime";
            $params[':end_datetime'] = $data['endDatetime'];
        }
        if (array_key_exists('notes', $data)) {
            $fields[] = "notes = :notes";
            $params[':notes'] = $data['notes'];
        }

        if (empty($fields)) return true;

        $stmt = $this->conn->prepare(
            "UPDATE tour_appointments SET " . implode(', ', $fields) . " WHERE appointment_id = :id"
        );
        return $stmt->execute($params);
    }

    /** Delete an appointment. */
    public function deleteAppointment(int $appointmentId): bool
    {
        $stmt = $this->conn->prepare(
            "DELETE FROM tour_appointments WHERE appointment_id = :id"
        );
        return $stmt->execute([':id' => $appointmentId]);
    }

    /** Fetch a single appointment row. */
    public function getAppointment(int $appointmentId): array|false
    {
        $stmt = $this->conn->prepare(
            "SELECT appointment_id, guide_id, title, start_datetime, end_datetime, notes, created_at, updated_at
               FROM tour_appointments
              WHERE appointment_id = :id LIMIT 1"
        );
        $stmt->execute([':id' => $appointmentId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $this->formatAppointmentRow($row) : false;
    }

    // ── Create ─────────────────────────────────────────────────────

    public function create(array $data): int|false
    {
        try {
            $stmt = $this->conn->prepare(
                "INSERT INTO tour_guides (full_name, phone_number, availability, is_active)
                 VALUES (:full_name, :phone_number, :availability, 1)"
            );
            $stmt->execute([
                ':full_name'    => trim($data['fullName']),
                ':phone_number' => $data['phoneNumber'] ?? null,
                ':availability' => $data['availability'] ?? 'available',
            ]);
            return (int) $this->conn->lastInsertId();
        } catch (PDOException $e) {
            error_log("TourGuide::create error: " . $e->getMessage());
            return false;
        }
    }

    // ── Update ─────────────────────────────────────────────────────

    public function update(int $id, array $data): bool
    {
        $fields = [];
        $params = [':id' => $id];

        if (array_key_exists('fullName', $data)) {
            $fields[] = "full_name = :full_name";
            $params[':full_name'] = trim($data['fullName']);
        }

        if (array_key_exists('phoneNumber', $data)) {
            $fields[] = "phone_number = :phone_number";
            $params[':phone_number'] = $data['phoneNumber'];
        }

        if (array_key_exists('availability', $data)) {
            $fields[] = "availability = :availability";
            $params[':availability'] = $data['availability'];
        }

        if (array_key_exists('isActive', $data)) {
            $fields[] = "is_active = :is_active";
            $params[':is_active'] = $data['isActive'] ? 1 : 0;
        }

        if (empty($fields)) return true;

        $stmt = $this->conn->prepare(
            "UPDATE tour_guides SET " . implode(', ', $fields) . " WHERE guide_id = :id"
        );
        return $stmt->execute($params);
    }

    // ── Delete ─────────────────────────────────────────────────────

    public function delete(int $id): bool
    {
        $stmt = $this->conn->prepare("DELETE FROM tour_guides WHERE guide_id = :id");
        return $stmt->execute([':id' => $id]);
    }

    // ── Format ─────────────────────────────────────────────────────

    private function formatRow(array $row): array
    {
        return [
            'id'           => (string) $row['guide_id'],
            'fullName'     => $row['full_name'],
            'phoneNumber'  => $row['phone_number'] ?? null,
            'availability' => $row['availability'],
            'isActive'     => (bool) $row['is_active'],
            'createdAt'    => $row['created_at'],
            'updatedAt'    => $row['updated_at'],
        ];
    }

    private function formatAppointmentRow(array $row): array
    {
        return [
            'id'            => (string) $row['appointment_id'],
            'guideId'       => (string) $row['guide_id'],
            'title'         => $row['title'],
            'startDatetime' => $row['start_datetime'],
            'endDatetime'   => $row['end_datetime'],
            'notes'         => $row['notes'] ?? null,
            'createdAt'     => $row['created_at'],
            'updatedAt'     => $row['updated_at'],
        ];
    }
}
