<?php
require_once __DIR__ . '/config.php';

$input = file_get_contents('php://input');
$payload = json_decode($input, true);

if (!$payload || !isset($payload['id']) || !isset($payload['confirmationWord'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID dan konfirmasi hapus wajib diisi.']);
    exit();
}

$id = trim($payload['id']);
$confirm = strtolower(trim($payload['confirmationWord']));

if ($confirm !== 'hapus') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Konfirmasi tidak valid. Harap ketik kata "hapus".']);
    exit();
}

$pdo = getDbConnection();
if (!$pdo) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Gagal terhubung ke MySQL Hostinger.']);
    exit();
}

try {
    // 1. Fetch record for audit log
    $stmt = $pdo->prepare("SELECT * FROM registrations WHERE id = ?");
    $stmt->execute([$id]);
    $target = $stmt->fetch();

    if (!$target) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Data pendaftar tidak ditemukan.']);
        exit();
    }

    // 2. Insert Audit Log into submission_logs
    $auditMsg = "[AUDIT DELETE] Data pendaftar ID " . $target['id'] . " (" . $target['full_name'] . ") telah DIHAPUS PERMANEN dari MySQL oleh Admin.";
    $logSql = "INSERT INTO submission_logs 
               (created_at, registration_id, full_name, email, phone, payload_json, status, error_message, ip_address, user_agent, is_resolved)
               VALUES (NOW(), ?, ?, ?, ?, ?, 'validation_error', ?, ?, ?, 1)";
    
    $logStmt = $pdo->prepare($logSql);
    $logStmt->execute([
        $target['id'],
        $target['full_name'],
        $target['email'],
        $target['phone'],
        json_encode($target),
        $auditMsg,
        $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
        $_SERVER['HTTP_USER_AGENT'] ?? ''
    ]);

    // 3. Delete record from registrations
    $delStmt = $pdo->prepare("DELETE FROM registrations WHERE id = ?");
    $delStmt->execute([$id]);

    echo json_encode([
        'success' => true,
        'message' => "Data pendaftar " . $target['full_name'] . " (" . $target['id'] . ") berhasil dihapus dan dicatat dalam System Audit Log."
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Gagal menghapus data dari MySQL: ' . $e->getMessage()]);
}
