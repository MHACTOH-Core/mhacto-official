<?php
use App\Config\Database;
use App\Core\Response;

function handle_search(string $method, ?string $param1, ?string $param2): void
{
    Response::cors();
    Response::preflight();

    if ($method !== 'GET') {
        send_error('Method not allowed.', 405);
    }

    $query = trim((string) ($_GET['q'] ?? ''));

    if ($query === '') {
        send_json([]);
    }

    try {
        $db = (new Database())->getConnection();

        $results = searchContent($db, $query);

        usort($results, function (array $a, array $b): int {
            return $b['score'] <=> $a['score'];
        });

        $results = array_slice($results, 0, 50);
        $results = array_map(static function (array $item): array {
            return [
                'id' => $item['id'],
                'type' => $item['type'],
                'title' => $item['title'],
                'description' => $item['description'],
            ];
        }, $results);

        send_json($results);
    } catch (Throwable $e) {
        error_log('Search failed: ' . $e->getMessage());
        send_error('Unable to perform search.', 500);
    }
}

function send_json(mixed $payload, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

function send_error(string $message, int $code = 400): void
{
    http_response_code($code);
    echo json_encode(['error' => $message], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

function searchContent(PDO $db, string $query): array
{
    $term = '%' . $query . '%';

    $typeMap = [
        'place' => 'Tourist Spot',
        'news'  => 'News Article',
        'event' => 'Event',
    ];

    $sql = "
        SELECT
            content_id AS id,
            post_type,
            title,
            COALESCE(description, '') AS description
        FROM content
        WHERE status = 'published'
          AND (
                title LIKE ?
            OR  description LIKE ?
          )
        LIMIT 150
    ";

    try {
        $stmt = $db->prepare($sql);
        $stmt->execute([$term, $term]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        error_log('Search query failed: ' . $e->getMessage());
        return [];
    }

    $results = [];
    $queryLower = mb_strtolower($query, 'UTF-8');

    foreach ($rows as $row) {
        $title = trim((string) ($row['title'] ?? ''));
        $description = trim((string) ($row['description'] ?? ''));
        $titleLower = mb_strtolower($title, 'UTF-8');
        $descriptionLower = mb_strtolower($description, 'UTF-8');

        $score = 0;
        if ($titleLower === $queryLower) {
            $score += 30;
        }
        if (mb_strpos($titleLower, $queryLower) !== false) {
            $score += 20;
            if (mb_strpos($titleLower, $queryLower) === 0) {
                $score += 10;
            }
        }
        if (mb_strpos($descriptionLower, $queryLower) !== false) {
            $score += 8;
        }

        if ($score === 0) {
            continue;
        }

        $results[] = [
            'id'          => $row['id'],
            'type'        => $typeMap[$row['post_type']] ?? ucfirst($row['post_type']),
            'title'       => $title,
            'description' => mb_substr($description, 0, 200, 'UTF-8'),
            'score'       => $score,
        ];
    }

    return $results;
}
