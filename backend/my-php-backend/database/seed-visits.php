<?php
/**
 * Seed historical website visit data into activity_logs.
 * Inserts page_view rows from Jan 1 – Apr 13, 2026 with realistic
 * ups/downs so the dashboard graph shows an interesting curve.
 *
 * Run from project root:
 *   php backend/my-php-backend/database/seed-visits.php
 */

require_once __DIR__ . '/../vendor/autoload.php';
$cfg = require __DIR__ . '/../config/database.local.php';

$dsn = "mysql:host={$cfg['host']};dbname={$cfg['db']};charset={$cfg['charset']}";
$pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

// Content IDs to rotate through for variety
$contentIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Daily visit targets — designed to produce clear hills & valleys across months
// Format: 'YYYY-MM-DD' => visit_count
$schedule = [
    // ── January 2026: opens high, peaks mid-month, dips late ──────────────
    '2026-01-01' => 22, '2026-01-02' => 28, '2026-01-03' => 35,
    '2026-01-04' => 42, '2026-01-05' => 50, '2026-01-06' => 55, '2026-01-07' => 52,
    '2026-01-08' => 48, '2026-01-09' => 44, '2026-01-10' => 50,
    '2026-01-11' => 58, '2026-01-12' => 62, '2026-01-13' => 65, '2026-01-14' => 60,
    '2026-01-15' => 55, '2026-01-16' => 50, '2026-01-17' => 45,
    '2026-01-18' => 40, '2026-01-19' => 35, '2026-01-20' => 28, '2026-01-21' => 22,
    '2026-01-22' => 18, '2026-01-23' => 20, '2026-01-24' => 25,
    '2026-01-25' => 30, '2026-01-26' => 35, '2026-01-27' => 38, '2026-01-28' => 36,
    '2026-01-29' => 32, '2026-01-30' => 28, '2026-01-31' => 25,

    // ── February 2026: drops to trough then climbs ──────────────────────────
    '2026-02-01' => 22, '2026-02-02' => 18, '2026-02-03' => 15,
    '2026-02-04' => 12, '2026-02-05' =>  8, '2026-02-06' => 10, '2026-02-07' => 14,
    '2026-02-08' => 18, '2026-02-09' => 22, '2026-02-10' => 28,
    '2026-02-11' => 32, '2026-02-12' => 38, '2026-02-13' => 42, '2026-02-14' => 48,
    '2026-02-15' => 45, '2026-02-16' => 40, '2026-02-17' => 35,
    '2026-02-18' => 30, '2026-02-19' => 25, '2026-02-20' => 20, '2026-02-21' => 16,
    '2026-02-22' => 14, '2026-02-23' => 18, '2026-02-24' => 24,
    '2026-02-25' => 30, '2026-02-26' => 36, '2026-02-27' => 40, '2026-02-28' => 44,

    // ── March 2026: big peak (heritage week / pagoda prep) ─────────────────
    '2026-03-01' => 48, '2026-03-02' => 52, '2026-03-03' => 58,
    '2026-03-04' => 62, '2026-03-05' => 68, '2026-03-06' => 72, '2026-03-07' => 75,
    '2026-03-08' => 70, '2026-03-09' => 65, '2026-03-10' => 60,
    '2026-03-11' => 55, '2026-03-12' => 52, '2026-03-13' => 58, '2026-03-14' => 65,
    '2026-03-15' => 72, '2026-03-16' => 78, '2026-03-17' => 74, // row exists (6) – adds more
    '2026-03-18' => 68, '2026-03-19' => 62, '2026-03-20' => 55, '2026-03-21' => 48,
    '2026-03-22' => 42, '2026-03-23' => 36, '2026-03-24' => 30,
    '2026-03-25' => 26, '2026-03-26' => 22, '2026-03-27' => 18, '2026-03-28' => 15,
    '2026-03-29' => 18, '2026-03-30' => 22, '2026-03-31' => 26,

    // ── April 2026 (1–13): recovers with visible dips ─────────────────────
    '2026-04-01' => 30, '2026-04-02' => 36, '2026-04-03' => 42,
    '2026-04-04' => 48, '2026-04-05' => 52, '2026-04-06' => 55,
    '2026-04-07' => 38, // existing 3 rows + 35 more = ~38 total
    '2026-04-08' => 45, '2026-04-09' => 50, '2026-04-10' => 46,
    '2026-04-11' => 40, '2026-04-12' =>  4, // low dip — existing 2 + 2 more
    '2026-04-13' => 20,
    // Apr 14 (today) — skip, let real traffic accumulate
];

$stmt = $pdo->prepare(
    "INSERT INTO activity_logs (content_id, action, details, page_path, created_at)
     VALUES (:cid, 'page_view', :details, :path, :ts)"
);

$pagePaths = [
    '/destinations', '/destinations/[id]', '/news', '/news/[id]',
    '/events', '/history', '/culture', '/pagoda', '/bocaue-wonders',
];

$total = 0;

foreach ($schedule as $date => $count) {
    $pdo->beginTransaction();
    for ($i = 0; $i < $count; $i++) {
        $cid     = $contentIds[$i % count($contentIds)];
        $hour    = str_pad((int) ($i / 4) % 24, 2, '0', STR_PAD_LEFT);
        $min     = str_pad(($i * 3) % 60, 2, '0', STR_PAD_LEFT);
        $sec     = str_pad(($i * 7) % 60, 2, '0', STR_PAD_LEFT);
        $ts      = "{$date} {$hour}:{$min}:{$sec}";
        $path    = $pagePaths[$i % count($pagePaths)];
        $details = json_encode(['contentId' => $cid]);

        $stmt->execute([':cid' => $cid, ':details' => $details, ':path' => $path, ':ts' => $ts]);
    }
    $pdo->commit();
    $total += $count;
    echo "  {$date}: +{$count} views\n";
}

echo "\nDone. Inserted {$total} page_view records.\n";
