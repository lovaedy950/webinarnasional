<?php
require_once __DIR__ . '/config.php';

$pdo = getDbConnection();
$lastErr = $GLOBALS['db_last_error'] ?? null;
$actualDb = $GLOBALS['db_connected_name'] ?? $db_name;

if ($pdo) {
    echo json_encode([
        'status' => 'online',
        'timestamp' => date('c'),
        'hostinger' => true,
        'engine' => 'PHP Native (Apache)',
        'database' => [
            'status' => 'connected',
            'host' => $db_host,
            'database' => $actualDb,
            'user' => $db_user,
            'error' => null
        ]
    ]);
} else {
    echo json_encode([
        'status' => 'online',
        'timestamp' => date('c'),
        'hostinger' => true,
        'engine' => 'PHP Native (Apache)',
        'database' => [
            'status' => 'error',
            'host' => $db_host,
            'database' => $db_name,
            'user' => $db_user,
            'error' => $lastErr ?: 'Gagal terhubung ke MySQL Hostinger.'
        ]
    ]);
}
