<?php
/**
 * Router for PHP built-in server.
 * Usage: php -S localhost:8000 index.php
 *
 * Replicates the .htaccess rule: if the request maps to a real file,
 * serve it directly; otherwise append .php and include it.
 */

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Strip query string and leading slash
$path = ltrim(strtok($uri, '?'), '/');

// Resolve to an absolute file path inside this directory
$base    = __DIR__;
$absPath = $base . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $path);

// 1. Exact file exists → serve it (built-in server handles static files itself,
//    but returning false here tells the server to do the same).
if ($path !== '' && is_file($absPath)) {
    return false;
}

// 2. Try with .php extension appended
$phpFile = $absPath . '.php';
if (is_file($phpFile)) {
    require $phpFile;
    return true;
}

// 3. Directory → look for index.php inside it
if (is_dir($absPath)) {
    $dirIndex = rtrim($absPath, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'index.php';
    if (is_file($dirIndex)) {
        require $dirIndex;
        return true;
    }
}

// 4. Nothing matched → 404
http_response_code(404);
header('Content-Type: application/json');
echo json_encode(['error' => 'Not found', 'path' => $uri]);
