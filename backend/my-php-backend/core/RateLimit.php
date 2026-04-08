<?php
namespace App\Core;

/**
 * RateLimit — File-based sliding-window rate limiter.
 *
 * Uses the system's tmp directory to store per-IP request timestamps.
 * No Redis or database required — suitable for low-to-medium traffic.
 *
 * Usage:
 *   // Allow 10 login attempts per IP per 15 minutes
 *   RateLimit::check('login', 10, 900);
 *
 *   // Allow 30 inquiry submissions per IP per hour
 *   RateLimit::check('inquiry', 30, 3600);
 */
class RateLimit
{
    /**
     * Check and enforce a rate limit. Exits with 429 if exceeded.
     *
     * @param string $action    Logical action name (used as part of the storage key)
     * @param int    $maxHits   Maximum number of requests allowed in the window
     * @param int    $window    Time window in seconds
     */
    public static function check(string $action, int $maxHits, int $window): void
    {
        $ip  = self::getClientIp();
        $key = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $action . '_' . $ip);
        $file = sys_get_temp_dir() . '/rl_' . $key . '.json';

        $now  = time();
        $hits = [];

        if (is_file($file)) {
            $raw = @file_get_contents($file);
            if ($raw) {
                $decoded = json_decode($raw, true);
                if (is_array($decoded)) {
                    // Keep only hits within the current window
                    $hits = array_filter($decoded, fn($t) => ($now - $t) < $window);
                    $hits = array_values($hits);
                }
            }
        }

        if (count($hits) >= $maxHits) {
            // Calculate how many seconds until the oldest hit expires
            $retryAfter = $window - ($now - min($hits));
            header('Retry-After: ' . max(1, (int) $retryAfter));
            Response::error('Too many requests. Please try again later.', 429);
            // Response::error exits
        }

        $hits[] = $now;
        @file_put_contents($file, json_encode($hits), LOCK_EX);
    }

    /**
     * Derive the real client IP address, accounting for common reverse proxies.
     * Falls back to REMOTE_ADDR if no proxy headers are present.
     */
    private static function getClientIp(): string
    {
        // Only trust X-Forwarded-For if you know you're behind a trusted proxy.
        // For a direct Apache setup, REMOTE_ADDR is more reliable.
        $candidates = [
            $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '',  // Cloudflare
            $_SERVER['HTTP_X_REAL_IP']        ?? '',  // nginx proxy
            $_SERVER['REMOTE_ADDR']           ?? '0.0.0.0',
        ];

        foreach ($candidates as $ip) {
            $ip = trim($ip);
            if ($ip && filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return $ip;
            }
        }

        // Fallback — accept private-range IPs for local dev
        return trim($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
    }
}
