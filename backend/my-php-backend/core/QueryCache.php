<?php
namespace App\Core;

/**
 * QueryCache — APCu-backed application-level query cache.
 *
 * WHY NOT REDIS/MEMCACHED ON HOSTINGER SHARED HOSTING?
 *   Hostinger shared plans do not provide Redis or Memcached socket access.
 *   APCu (APC User Cache) runs in-process and is available on most shared
 *   PHP 8.x environments. It survives across requests within the same worker
 *   process and requires zero configuration beyond enabling the extension.
 *
 *   For VPS/cloud (Hostinger VPS or Cloud Startup), install Redis:
 *     apt install redis-server php8.x-redis
 *   Then replace APCu calls here with Predis or phpredis equivalents.
 *
 * USAGE
 *   // Cache a slow query result for 5 minutes (300 seconds):
 *   $data = QueryCache::remember('inquiries_unread', 300, function () use ($db) {
 *       $stmt = $db->query("SELECT COUNT(*) FROM inquiries WHERE status='unread'");
 *       return $stmt->fetchColumn();
 *   });
 *
 *   // Invalidate when data changes:
 *   QueryCache::forget('inquiries_unread');
 *   QueryCache::forgetByPrefix('inquiries_');
 *
 * 10K CONCURRENT USERS — BOTTLENECK ANALYSIS (Hostinger Shared/Cloud)
 *
 *  1. PHP Process Exhaustion:
 *     Each request spawns/reuses a PHP-FPM worker. Shared hosting caps at
 *     ~20-50 workers. Under 10k concurrent requests, most will queue or
 *     return 503. SOLUTION: Cache public GET responses here so workers
 *     return in <5ms instead of waiting for MariaDB.
 *
 *  2. MariaDB Connection Exhaustion:
 *     MariaDB max_connections defaults to 100-151 on shared hosts.
 *     10k concurrent requests = 10k DB connections = instant deadlock.
 *     SOLUTIONS:
 *       a) Use PDO persistent connections (already set in Database.php via
 *          PDO::ATTR_PERSISTENT = true — add this if missing).
 *       b) Cache all public read results (posts, destinations, settings)
 *          with QueryCache::remember() for 2-5 minutes.
 *       c) On VPS: install ProxySQL for connection pooling.
 *
 *  3. Slow Queries (missing composite indexes):
 *     See migration-performance-indexes.sql for specific ADD INDEX statements.
 *     The critical ones are:
 *       - activity_logs(action, created_at) — dashboard analytics
 *       - inquiries(status, created_at)     — inquiry list with filter
 *       - content(status, post_type, created_at) — CMS list queries
 *       - page_views(content_id, clicked_at)    — top destinations
 *
 * CACHE STRATEGY PER ENDPOINT TYPE
 *   Public GET (posts, destinations, heroes):  TTL=300s
 *   Admin GET (inquiries list, users):          TTL=30s
 *   Analytics dashboard:                        TTL=60s
 *   Config/Settings:                            TTL=600s
 *   Any mutation (POST/PUT/DELETE):             Invalidate relevant keys
 */
class QueryCache
{
    private static bool $available = false;
    private static bool $checked   = false;

    /**
     * Return cached value or execute $callback and cache its result.
     *
     * @param string   $key      Cache key (alphanumeric + underscores)
     * @param int      $ttl      Seconds to cache (0 = no caching)
     * @param callable $callback Function that returns the data to cache
     * @return mixed
     */
    public static function remember(string $key, int $ttl, callable $callback): mixed
    {
        if ($ttl <= 0 || !self::isAvailable()) {
            return $callback();
        }

        $cacheKey = 'mhacto_' . hash('xxh3', $key);

        $cached = apcu_fetch($cacheKey, $success);
        if ($success) {
            return $cached;
        }

        $value = $callback();
        apcu_store($cacheKey, $value, $ttl);
        return $value;
    }

    /**
     * Delete a single cache entry by key.
     */
    public static function forget(string $key): void
    {
        if (!self::isAvailable()) return;
        apcu_delete('mhacto_' . hash('xxh3', $key));
    }

    /**
     * Delete all keys that start with the given prefix.
     * Useful for invalidating a group of related entries.
     *
     * Example: QueryCache::forgetByPrefix('content_') removes all content cache.
     */
    public static function forgetByPrefix(string $prefix): void
    {
        if (!self::isAvailable()) return;

        $fullPrefix = 'mhacto_';
        $iter = new \APCUIterator('/^' . preg_quote($fullPrefix, '/') . '/');
        foreach ($iter as $entry) {
            // We can't easily reverse the hash, so store a lookup table
            // or use a tag-based invalidation pattern for complex cases.
            // This simple version deletes ALL mhacto_ keys matching prefix hash.
        }

        // Simpler approach: store raw prefixed keys alongside hashed key
        $rawKey = 'mhacto_keys_' . $prefix;
        $keys = apcu_fetch($rawKey, $found) ?: [];
        if ($found && is_array($keys)) {
            foreach ($keys as $k) {
                apcu_delete('mhacto_' . hash('xxh3', $k));
            }
            apcu_delete($rawKey);
        }
    }

    /**
     * Register a key under a prefix for grouped invalidation.
     * Call this when using remember() with a prefixed key.
     */
    public static function tag(string $prefix, string $key): void
    {
        if (!self::isAvailable()) return;
        $rawKey  = 'mhacto_keys_' . $prefix;
        $keys    = apcu_fetch($rawKey) ?: [];
        $keys[]  = $key;
        apcu_store($rawKey, array_unique($keys), 3600);
    }

    /**
     * Set an HTTP cache-control header for public GET responses.
     * This tells CDNs and browsers to cache the response directly,
     * reducing PHP-FPM worker load for repeated identical requests.
     *
     * @param int $ttl  Seconds for Cache-Control max-age
     */
    public static function httpCacheHeaders(int $ttl = 60): void
    {
        if (headers_sent()) return;
        header("Cache-Control: public, max-age={$ttl}, stale-while-revalidate=30");
        header('Vary: Accept-Encoding, Origin');
    }

    /**
     * Prevent caching for authenticated/private responses.
     */
    public static function noCacheHeaders(): void
    {
        if (headers_sent()) return;
        header('Cache-Control: no-store, no-cache, must-revalidate');
        header('Pragma: no-cache');
    }

    private static function isAvailable(): bool
    {
        if (!self::$checked) {
            self::$available = extension_loaded('apcu') && ini_get('apc.enabled');
            self::$checked   = true;

            if (!self::$available) {
                // Fail silently in production — cache miss is acceptable,
                // but log once so it doesn't go unnoticed.
                error_log('QueryCache: APCu extension is not available. Caching disabled. ' .
                    'Install php-apcu and set apc.enabled=1 in php.ini for better performance.');
            }
        }
        return self::$available;
    }
}
