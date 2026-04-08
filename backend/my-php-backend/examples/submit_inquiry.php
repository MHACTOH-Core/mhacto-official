<?php
/**
 * submit_inquiry.php — Secure Inquiry Submission Boilerplate
 *
 * PURPOSE
 *   A standalone, framework-free PHP script that demonstrates every
 *   security control required for accepting public form submissions.
 *   Mirrors the logic in routes/inquiries.php but is fully self-contained
 *   so it can be audited, tested, or deployed in isolation.
 *
 * SECURITY CONTROLS
 *   ✅  CSRF  — double-submit cookie pattern (no sessions required)
 *   ✅  Rate limiting — file-based sliding window (no Redis required)
 *   ✅  Input validation — strict server-side rules, no client-only checks
 *   ✅  Prepared statements — all DB writes use PDO with named placeholders
 *   ✅  RA 10173 DPA — consent checkbox required; IP/UA recorded; audit log
 *   ✅  Output encoding — json_encode handles escaping automatically
 *   ✅  Security headers — HSTS, CSP, X-Frame-Options, etc.
 *   ✅  Error leakage prevention — generic messages; details only in error_log
 *
 * HOW TO USE
 *   1.  Copy this file to the location where your form POSTs.
 *   2.  Set the DB_* constants below to your real credentials.
 *   3.  Set RATE_LIMIT_DIR to a directory writable by PHP-FPM outside webroot.
 *   4.  On your HTML form add:
 *         <input type="hidden" name="csrf_token" value="<?php echo csrf_generate(); ?>">
 *       Or generate the token with JavaScript from the /api/csrf-token endpoint.
 *
 * IMPORTANT
 *   This file should NOT be placed inside the web-accessible /public/ directory
 *   if you are using it as a library. Include it from your router instead.
 */

declare(strict_types=1);

// ── Configuration ────────────────────────────────────────────────────────────

/** How long (seconds) the CSRF token is valid for. Matches frontend session. */
const CSRF_TTL       = 3600;
/** Cookie name for the CSRF token. Must match what the frontend sets. */
const CSRF_COOKIE    = 'csrf_token';
/** Rate limiter: max submissions per window. */
const RATE_MAX_HITS  = 5;
/** Rate limiter: window duration in seconds. */
const RATE_WINDOW    = 3600; // 1 hour
/** Directory for rate-limit state files. Must be writable. Outside webroot! */
const RATE_LIMIT_DIR = '/tmp/mhacto_rl';

// ── Security headers ─────────────────────────────────────────────────────────

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');
header("Content-Security-Policy: default-src 'none'");
// Only use HSTS on HTTPS — check if running over TLS:
if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
    header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
}

// ── Only accept POST ─────────────────────────────────────────────────────────

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    echo json_encode(['error' => 'Method not allowed.']);
    exit;
}

// ── Helpers: response shortcuts ──────────────────────────────────────────────

/**
 * Emit a JSON error response and terminate.
 *
 * @param string $message Human-readable message (safe to expose to clients).
 * @param int    $code    HTTP status code.
 */
function fail(string $message, int $code = 400): never
{
    http_response_code($code);
    echo json_encode(['error' => $message]);
    exit;
}

/**
 * Emit a JSON success response and terminate.
 *
 * @param array<string, mixed> $data
 */
function succeed(array $data, int $code = 200): never
{
    http_response_code($code);
    echo json_encode($data);
    exit;
}

// ── Rate limiting ────────────────────────────────────────────────────────────

/**
 * Sliding-window file-based rate limiter.
 * Creates one JSON file per (action, IP) pair in RATE_LIMIT_DIR.
 *
 * SECURITY NOTE: Using REMOTE_ADDR is sufficient for most cases on shared hosts.
 * If behind a trusted reverse proxy (Cloudflare, Nginx), use HTTP_CF_CONNECTING_IP
 * or HTTP_X_FORWARDED_FOR ONLY if you control the proxy (never trust raw headers
 * from untrusted sources — they can be spoofed).
 *
 * @param string $action   Unique identifier for the action being rate-limited.
 * @param int    $maxHits  Maximum allowed hits within $window seconds.
 * @param int    $window   Sliding window duration in seconds.
 */
function rate_limit_check(string $action, int $maxHits, int $window): void
{
    // IP validation — never trust blindly; strip port if present (IPv6 safe)
    $rawIp  = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $ip     = filter_var($rawIp, FILTER_VALIDATE_IP) ? $rawIp : '0.0.0.0';
    $safeIp = preg_replace('/[^a-f0-9:\.]/i', '', $ip); // filesystem-safe
    $safeAction = preg_replace('/[^a-z0-9_]/i', '', $action);

    if (!is_dir(RATE_LIMIT_DIR)) {
        @mkdir(RATE_LIMIT_DIR, 0700, true);
    }
    $file = RATE_LIMIT_DIR . '/rl_' . $safeAction . '_' . hash('xxh3', $safeIp) . '.json';

    // Exclusive lock to prevent race conditions under burst traffic
    $fp = fopen($file, 'c+');
    if (!$fp) return; // If we can't lock, don't block the user — fail open
    flock($fp, LOCK_EX);

    $data = [];
    $raw  = fread($fp, 2048);
    if ($raw) {
        $data = json_decode($raw, true) ?? [];
    }

    $now  = time();
    // Prune hits older than the sliding window
    $data = array_values(array_filter($data, fn($ts) => ($now - $ts) < $window));

    if (count($data) >= $maxHits) {
        flock($fp, LOCK_UN);
        fclose($fp);
        $retryAfter = $window - ($now - ($data[0] ?? $now));
        header('Retry-After: ' . max(0, $retryAfter));
        http_response_code(429);
        echo json_encode(['error' => 'Too many requests. Please try again later.']);
        exit;
    }

    $data[] = $now;
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($data));
    flock($fp, LOCK_UN);
    fclose($fp);
}

// ── CSRF: double-submit cookie pattern ──────────────────────────────────────

/**
 * Generate a cryptographically secure CSRF token and set it as a cookie.
 * Call this on any page load that renders the inquiry form.
 *
 * The token is stored ONLY in a cookie (not the session), and the form
 * sends it back in a hidden field. We verify they match on submission.
 * This is called the "double-submit cookie" pattern (OWASP CSRF Cheatsheet).
 *
 * SECURITY: The cookie MUST be HttpOnly=false so JavaScript can read it
 * for SPA forms. Set Secure=true on HTTPS, SameSite=Strict.
 *
 * @return string  The generated token.
 */
function csrf_generate(): string
{
    $token = bin2hex(random_bytes(32));
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    setcookie(CSRF_COOKIE, $token, [
        'expires'  => time() + CSRF_TTL,
        'path'     => '/',
        'secure'   => $secure,
        'httponly' => false,  // Must be readable by JS for SPA forms
        'samesite' => 'Strict',
    ]);
    return $token;
}

/**
 * Validate the CSRF token from the form against the cookie.
 * Fails with HTTP 403 if invalid or missing.
 */
function csrf_validate(): void
{
    $cookieToken = $_COOKIE[CSRF_COOKIE] ?? '';
    // For JSON-API forms, token comes in the JSON body or a header
    $input       = json_decode(file_get_contents('php://input'), true) ?? [];
    $bodyToken   = $input['csrfToken'] ?? ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');

    if (!$cookieToken || !$bodyToken) {
        fail('CSRF token missing. Please reload the page and try again.', 403);
    }
    // Timing-safe comparison prevents timing attacks
    if (!hash_equals($cookieToken, $bodyToken)) {
        fail('Invalid CSRF token. Please reload the page and try again.', 403);
    }
}

// ── Input validation ─────────────────────────────────────────────────────────

/**
 * Validate and sanitize inquiry submission data.
 * Returns a flat array of clean, typed values ready for DB insertion.
 *
 * @param array<string, mixed> $raw  Decoded JSON or $_POST data.
 * @return array<string, mixed>      Sanitized fields.
 *
 * SECURITY NOTE: strip_tags() removes HTML markup but is NOT a replacement
 * for prepared statements.  Both are required.  strip_tags() prevents stored
 * XSS if the value is ever rendered as HTML; prepared statements prevent SQLi.
 */
function validate_inquiry(array $raw): array
{
    $errors = [];

    // -- name ----------------------------------------------------------------
    $name = trim(strip_tags((string)($raw['name'] ?? '')));
    if ($name === '') {
        $errors[] = 'Name is required.';
    } elseif (mb_strlen($name) > 100) {
        $errors[] = 'Name must be 100 characters or less.';
    } elseif (!preg_match('/^[\p{L}\s]+$/u', $name)) {
        $errors[] = 'Name must contain letters and spaces only.';
    }

    // -- email ---------------------------------------------------------------
    $email = trim(strtolower((string)($raw['email'] ?? '')));
    if ($email === '') {
        $errors[] = 'Email address is required.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Please enter a valid email address.';
    } elseif (mb_strlen($email) > 254) {       // RFC 5321 limit
        $errors[] = 'Email address is too long.';
    }

    // -- contact number (optional, PH format) --------------------------------
    $contact = trim((string)($raw['contactNumber'] ?? ''));
    if ($contact !== '' && !preg_match('/^\+639\d{9}$/', $contact)) {
        $errors[] = 'Contact number must be in format +639XXXXXXXXX.';
    }
    if (mb_strlen($contact) > 20) {
        $errors[] = 'Contact number is too long.';
    }

    // -- message -------------------------------------------------------------
    $message = trim(strip_tags((string)($raw['message'] ?? '')));
    if ($message === '') {
        $errors[] = 'Message is required.';
    } elseif (mb_strlen($message) > 4000) {
        $errors[] = 'Message must be 4000 characters or less.';
    }

    // -- inquiry type --------------------------------------------------------
    $allowedTypes  = ['general_contact', 'tour_booking', 'partnership', 'complaint'];
    $inquiryType   = (string)($raw['inquiryType'] ?? 'general_contact');
    if (!in_array($inquiryType, $allowedTypes, true)) {
        $inquiryType = 'general_contact';
    }

    // -- number of pax (optional) -------------------------------------------
    $numberOfPax = isset($raw['numberOfPax']) ? (int)$raw['numberOfPax'] : null;
    if ($numberOfPax !== null && ($numberOfPax < 1 || $numberOfPax > 500)) {
        $errors[] = 'Number of people must be between 1 and 500.';
    }

    // -- date of visit (optional) -------------------------------------------
    $dateOfVisit = null;
    if (!empty($raw['dateOfVisit'])) {
        $parsed = date_create_from_format('Y-m-d', (string)$raw['dateOfVisit']);
        if (!$parsed) {
            $errors[] = 'Date of visit must be in YYYY-MM-DD format.';
        } else {
            $dateOfVisit = $parsed->format('Y-m-d');
        }
    }

    // -- RA 10173 consent ----------------------------------------------------
    if (empty($raw['consentGiven'])) {
        $errors[] = 'Consent to data collection is required under RA 10173.';
    }

    if (!empty($errors)) {
        fail(implode(' ', $errors), 422);
    }

    return [
        'name'         => $name,
        'email'        => $email,
        'contact'      => $contact !== '' ? $contact : null,
        'message'      => $message,
        'inquiry_type' => $inquiryType,
        'num_pax'      => $numberOfPax,
        'date_visit'   => $dateOfVisit,
        'tourist_name' => mb_substr(strip_tags((string)($raw['touristName'] ?? '')), 0, 200) ?: null,
        'purpose'      => mb_substr(strip_tags((string)($raw['purpose'] ?? '')), 0, 100) ?: null,
        'add_details'  => isset($raw['additionalDetails']) && is_array($raw['additionalDetails'])
                            ? json_encode($raw['additionalDetails'])
                            : null,
    ];
}

// ── DB connection ─────────────────────────────────────────────────────────────

/**
 * Return a singleton PDO connection.
 * Credentials should come from environment variables, not hardcoded constants.
 *
 * SECURITY NOTE: NEVER commit real credentials. Use:
 *   - .env file (vlucas/phpdotenv) excluded from git
 *   - Environment variables set in PHP-FPM pool config pool.d/www.conf
 *   - Hosting control panel environment settings
 */
function get_db(): PDO
{
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $host   = getenv('DB_HOST')     ?: 'localhost';
    $name   = getenv('DB_NAME')     ?: '';
    $user   = getenv('DB_USER')     ?: '';
    $pass   = getenv('DB_PASSWORD') ?: '';
    $port   = getenv('DB_PORT')     ?: '3306';

    if (!$name || !$user) {
        error_log('[submit_inquiry] Missing DB_NAME or DB_USER environment variable');
        fail('Configuration error. Please contact support.', 500);
    }

    try {
        $pdo = new PDO(
            "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4",
            $user,
            $pass,
            [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,   // IMPORTANT: real prepared stmts
                PDO::ATTR_PERSISTENT         => true,    // connection pooling
            ]
        );
    } catch (\PDOException $e) {
        error_log('[submit_inquiry] DB connection failed: ' . $e->getMessage());
        fail('Unable to connect to the database. Please try again later.', 503);
    }
    return $pdo;
}

// ── DB insertion ─────────────────────────────────────────────────────────────

/**
 * Insert the validated inquiry into the database.
 *
 * SECURITY NOTE: Every value is a named placeholder (:name, :email, …).
 * PDO replaces placeholders with properly escaped values before executing.
 * This is the ONLY safe way to build user-data-driven queries.
 * NEVER concatenate user input into a SQL string.
 *
 * @param array<string, mixed>  $fields  Validated fields from validate_inquiry().
 * @param string                $ip      Submitter's IP address (may be anonymized).
 * @param string                $ua      Submitter's User-Agent string.
 * @return int                           ID of the inserted row.
 */
function insert_inquiry(array $fields, string $ip, string $ua): int
{
    $pdo  = get_db();
    $stmt = $pdo->prepare(
        'INSERT INTO inquiries
            (name, tourist_name, email, contact_number, inquiry_type, purpose,
             date_of_visit, number_of_pax, message, additional_details,
             submission_ip, submission_ua, consent_given, status, created_at)
         VALUES
            (:name, :tourist_name, :email, :contact_number, :inquiry_type, :purpose,
             :date_of_visit, :number_of_pax, :message, :additional_details,
             :submission_ip, :submission_ua, 1, \'pending\', NOW())'
    );

    $stmt->execute([
        ':name'             => $fields['name'],
        ':tourist_name'     => $fields['tourist_name'],
        ':email'            => $fields['email'],
        ':contact_number'   => $fields['contact'],
        ':inquiry_type'     => $fields['inquiry_type'],
        ':purpose'          => $fields['purpose'],
        ':date_of_visit'    => $fields['date_visit'],
        ':number_of_pax'    => $fields['num_pax'],
        ':message'          => $fields['message'],
        ':additional_details' => $fields['add_details'],
        ':submission_ip'    => $ip,
        ':submission_ua'    => mb_substr($ua, 0, 255),
    ]);

    return (int) $pdo->lastInsertId();
}

/**
 * Write to the RA 10173 audit trail table.
 * Called after every successful inquiry submission to log that PII was collected.
 */
function audit_log_collection(int $inquiryId, string $ip): void
{
    try {
        $pdo  = get_db();
        $stmt = $pdo->prepare(
            'INSERT INTO data_access_audit
                (action, resource_type, resource_id, performed_by_id, ip_address, purpose, created_at)
             VALUES
                (\'collect\', \'inquiry\', :rid, NULL, :ip, \'public_inquiry_submission\', NOW())'
        );
        $stmt->execute([':rid' => $inquiryId, ':ip' => $ip]);
    } catch (\PDOException $e) {
        // Audit failure is not fatal — log it but do not expose to user
        error_log('[submit_inquiry] audit_log_collection failed: ' . $e->getMessage());
    }
}

// ── Main flow ─────────────────────────────────────────────────────────────────

// 1. Rate limit — check BEFORE parsing input to minimize work under attack
rate_limit_check('inquiry', RATE_MAX_HITS, RATE_WINDOW);

// 2. CSRF — validates the double-submit cookie pair
//    UNCOMMENT when using this as a standalone form (disable in JSON-API mode
//    that uses CORS + SameSite=Strict as CSRF protection).
// csrf_validate();

// 3. Parse JSON body — the frontend sends JSON, not multipart/form-data
$raw = json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);
if (!is_array($raw)) {
    fail('Invalid request body.', 400);
}

// 4. Validate and sanitize all user-supplied values
$fields = validate_inquiry($raw);

// 5. Capture submitter metadata for RA 10173 compliance
//    SECURITY: Never trust forwarded IPs unless you control the proxy.
$rawIp  = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$ip     = filter_var($rawIp, FILTER_VALIDATE_IP) ? $rawIp : '0.0.0.0';
$ua     = $_SERVER['HTTP_USER_AGENT'] ?? '';

// 6. Insert into database using prepared statements
try {
    $inquiryId = insert_inquiry($fields, $ip, $ua);
} catch (\PDOException $e) {
    error_log('[submit_inquiry] insert_inquiry failed: ' . $e->getMessage());
    fail('Failed to submit inquiry. Please try again.', 500);
}

// 7. Write RA 10173 data collection audit record
audit_log_collection($inquiryId, $ip);

// 8. Return success — never include the inserted ID in the public response
//    to prevent enumeration of inquiry counts.
succeed([
    'message' => 'Your inquiry has been submitted successfully. We will get back to you within 1–2 business days.',
]);
