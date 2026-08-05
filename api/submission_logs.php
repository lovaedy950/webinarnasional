<?php
require_once __DIR__ . '/config.php';

$pdo = getDbConnection();
if (!$pdo) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection error']);
    exit();
}

try {
    $stmt = $pdo->query("SELECT * FROM submission_logs ORDER BY created_at DESC LIMIT 100");
    $rows = $stmt->fetchAll();

    $logs = array_map(function($r) {
        return [
            'id' => (int)$r['id'],
            'createdAt' => $r['created_at'],
            'registrationId' => $r['registration_id'],
            'fullName' => $r['full_name'],
            'email' => $r['email'],
            'phone' => $r['phone'],
            'payloadJson' => $r['payload_json'],
            'status' => $r['status'],
            'errorMessage' => $r['error_message'],
            'ipAddress' => $r['ip_address'],
            'userAgent' => $r['user_agent'],
            'isResolved' => (bool)$r['is_resolved']
        ];
    }, $rows);

    echo json_encode(['success' => true, 'data' => $logs]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
