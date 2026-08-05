<?php
// Hostinger Native PHP Database Connection Configuration
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db_host = 'localhost';
$db_user = 'u701755284_ppni_user';
$db_pass = '@Keroppi27';
$db_name = 'u701755284_ppni_webinar';
$db_port = '3306';
$GLOBALS['db_last_error'] = '';
$GLOBALS['db_connected_name'] = $db_name;

// Read .env file if present
$env_path = __DIR__ . '/../.env';
if (file_exists($env_path)) {
    $lines = file($env_path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $key = trim($parts[0]);
            $val = trim($parts[1]);
            $val = trim($val, '"\'');
            if ($key === 'DB_HOST') $db_host = $val;
            if ($key === 'DB_USER') $db_user = $val;
            if ($key === 'DB_PASSWORD') $db_pass = $val;
            if ($key === 'DB_NAME') $db_name = $val;
            if ($key === 'DB_PORT') $db_port = $val;
        }
    }
}

function getDbConnection() {
    global $db_host, $db_user, $db_pass, $db_name, $db_port;
    
    // Candidates for database name on Hostinger
    $db_candidates = array_unique([
        $db_name,
        'u701755284_ppni_webinar_db',
        'u701755284_ppni_webinar',
        'ppni_webinar_db'
    ]);

    $hosts = array_unique([$db_host, '127.0.0.1']);
    $errors = [];

    foreach ($hosts as $h) {
        foreach ($db_candidates as $dbname) {
            try {
                $dsn = "mysql:host=$h;port=$db_port;dbname=$dbname;charset=utf8mb4";
                $pdo = new PDO($dsn, $db_user, $db_pass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]);
                $GLOBALS['db_connected_name'] = $dbname;
                $GLOBALS['db_last_error'] = null;
                return $pdo;
            } catch (PDOException $e) {
                $errors[] = "[$h / $dbname]: " . $e->getMessage();
            }
        }
    }

    $GLOBALS['db_last_error'] = implode(' | ', array_slice($errors, 0, 3));
    return null;
}
