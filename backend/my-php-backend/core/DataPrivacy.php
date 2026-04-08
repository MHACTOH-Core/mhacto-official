<?php
namespace App\Core;

use PDO;

/**
 * DataPrivacy — RA 10173 (Philippines Data Privacy Act of 2012) utilities.
 *
 * Covers three mandatory requirements for government PICs (Personal
 * Information Controllers):
 *
 *  §7  — Lawful processing requires documented, freely-given consent.
 *         Use: DataPrivacy::verifyConsent($input) before storing PII.
 *
 *  §11 — Proportionality: only collect what is necessary.
 *         Use: DataPrivacy::sanitizePii($row) to strip unnecessary fields
 *         before returning data to API consumers.
 *
 *  §16 — Data subjects have the right to access and erasure.
 *         Use: DataPrivacy::anonymizeInquiry($db, $id) for erasure requests.
 *
 *  §20 — Breach notification within 72 hours.
 *         Use: DataPrivacy::logBreach($db, $data) to record incidents.
 *
 * Transit Security (§23):
 *   All API traffic MUST be served over HTTPS. Enforce via .htaccess:
 *     RewriteCond %{HTTPS} off
 *     RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
 *
 * Encryption at Rest (§23):
 *   Enable MariaDB TDE (Transparent Data Encryption) at the server level.
 *   For Hostinger shared hosting that does not support TDE, encrypt the
 *   contact_number field at the application layer using
 *   DataPrivacy::encryptField() / decryptField() with AES-256-CBC.
 */
class DataPrivacy
{
    // ── Consent verification ──────────────────────────────────────────

    /**
     * Verify that the request body contains explicit data-subject consent
     * (RA 10173 §7). Must be checked before storing any PII from a
     * public-facing form.
     *
     * @param object|array $input  Decoded JSON request body
     * @throws \InvalidArgumentException  Exits with 422 if consent is absent
     */
    public static function verifyConsent(object|array $input): void
    {
        $consent = is_array($input) ? ($input['consentGiven'] ?? false) : ($input->consentGiven ?? false);
        if (!$consent) {
            Response::error(
                'Data collection consent is required under the Philippines Data Privacy Act (RA 10173). ' .
                'Please confirm your consent before submitting.',
                422
            );
        }
    }

    // ── PII sanitization (§11 Proportionality) ───────────────────────

    /**
     * Strip or mask PII fields before returning inquiry data to the
     * frontend. Only super_admin and admin should receive full PII.
     *
     * @param array  $row       A single inquiry row
     * @param string $viewerRole  The role of the requesting admin
     * @return array  Row with PII masked or removed for lower roles
     */
    public static function sanitizePii(array $row, string $viewerRole): array
    {
        if (in_array($viewerRole, ['super_admin', 'admin'], true)) {
            return $row; // Full access
        }

        // content_manager: mask personal contact details
        if (isset($row['email_address'])) {
            $row['email_address'] = self::maskEmail($row['email_address']);
        }
        if (isset($row['contact_number'])) {
            $row['contact_number'] = self::maskPhone($row['contact_number']);
        }
        if (isset($row['submitter_ip'])) {
            // Mask last octet of IPv4 or last segment of IPv6
            $row['submitter_ip'] = preg_replace('/\.\d+$/', '.***', $row['submitter_ip']);
        }

        return $row;
    }

    // ── Right to Erasure (§16) ────────────────────────────────────────

    /**
     * Anonymize all PII from a single inquiry record in-place.
     * The row is preserved for statistical/audit purposes but no longer
     * contains identifiable data (RA 10173 §16 erasure right).
     *
     * @param PDO $db
     * @param int $inquiryId
     * @return bool  True on success
     */
    public static function anonymizeInquiry(PDO $db, int $inquiryId): bool
    {
        $stmt = $db->prepare(
            "UPDATE inquiries SET
                full_name      = '[Anonymized]',
                tourist_name   = NULL,
                email_address  = CONCAT('anon', :id, '@redacted.invalid'),
                contact_number = NULL,
                message        = '[Content removed per data subject erasure request]',
                additional_details = NULL,
                submitter_ip   = NULL
             WHERE inquiry_id = :id"
        );
        return $stmt->execute([':id' => $inquiryId]);
    }

    // ── Breach Notification (§20) ─────────────────────────────────────

    /**
     * Log a personal data breach incident.
     * Under RA 10173 §20, government PICs must notify the NPC within
     * 72 hours of discovery. This creates the internal record that
     * drives that notification process.
     *
     * @param PDO   $db
     * @param array $data  Keys: reported_by, affected_table, affected_rows, nature, cause
     * @return int|false  breach_id on success
     */
    public static function logBreach(PDO $db, array $data): int|false
    {
        $stmt = $db->prepare(
            "INSERT INTO data_breach_log
               (reported_by, affected_table, affected_rows, nature, cause)
             VALUES
               (:reported_by, :affected_table, :affected_rows, :nature, :cause)"
        );
        try {
            $stmt->execute([
                ':reported_by'    => $data['reported_by'] ?? null,
                ':affected_table' => $data['affected_table'] ?? null,
                ':affected_rows'  => $data['affected_rows'] ?? null,
                ':nature'         => $data['nature'] ?? null,
                ':cause'          => $data['cause'] ?? null,
            ]);
            return (int) $db->lastInsertId();
        } catch (\PDOException $e) {
            error_log("DataPrivacy::logBreach error: " . $e->getMessage());
            return false;
        }
    }

    // ── Application-layer encryption (§23, for shared hosting) ───────

    /**
     * Encrypt a sensitive field value with AES-256-CBC.
     * Use when the hosting provider does not support MariaDB TDE.
     * Store the returned base64 string in place of the plaintext.
     *
     * Requires APP_ENCRYPTION_KEY in .env (min 32 bytes, hex-encoded).
     */
    public static function encryptField(string $plaintext): string
    {
        $key = self::getEncryptionKey();
        $iv  = random_bytes(16);
        $ciphertext = openssl_encrypt($plaintext, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv);
        // Prepend IV so decrypt() can recover it: base64(iv + ciphertext)
        return base64_encode($iv . $ciphertext);
    }

    /**
     * Decrypt a value previously encrypted with encryptField().
     */
    public static function decryptField(string $encoded): string
    {
        $key  = self::getEncryptionKey();
        $raw  = base64_decode($encoded);
        $iv   = substr($raw, 0, 16);
        $data = substr($raw, 16);
        return openssl_decrypt($data, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv) ?: '';
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private static function maskEmail(string $email): string
    {
        [$local, $domain] = explode('@', $email, 2) + ['', ''];
        return mb_substr($local, 0, 2) . '***@' . $domain;
    }

    private static function maskPhone(string $phone): string
    {
        return substr($phone, 0, 3) . '****' . substr($phone, -2);
    }

    private static function getEncryptionKey(): string
    {
        $hex = $_ENV['APP_ENCRYPTION_KEY'] ?? '';
        if (strlen($hex) < 32) {
            throw new \RuntimeException('APP_ENCRYPTION_KEY must be at least 32 bytes in .env');
        }
        return hex2bin(str_pad($hex, 64, '0')) ?: $hex;
    }
}
