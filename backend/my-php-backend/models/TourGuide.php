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

    // ── Read ───────────────────────────────────────────────────────

    /** Fetch all active guides ordered by name. */
    public function readAll(bool $activeOnly = false): array
    {
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

    /** Fetch a single guide. */
    public function readOne(int $id): array|false
    {
        $stmt = $this->conn->prepare(
            "SELECT guide_id, full_name, phone_number, availability, is_active, created_at, updated_at
               FROM tour_guides
              WHERE guide_id = :id LIMIT 1"
        );
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $this->formatRow($row) : false;
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
}
