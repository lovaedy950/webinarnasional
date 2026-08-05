<?php
require_once __DIR__ . '/config.php';

$input = file_get_contents('php://input');
$payload = json_decode($input, true);

if (!$payload || !isset($payload['id']) || !isset($payload['status'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID dan status wajib diisi.']);
    exit();
}

$id = trim($payload['id']);
$status = trim($payload['status']);
$notes = isset($payload['notes']) ? trim($payload['notes']) : null;

if (!in_array($status, ['pending', 'valid', 'rejected'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Status tidak valid.']);
    exit();
}

$pdo = getDbConnection();
if (!$pdo) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Gagal terhubung ke MySQL Hostinger.']);
    exit();
}

try {
    $verifiedAt = ($status === 'valid') ? date('Y-m-d H:i:s') : null;

    $sql = "UPDATE registrations SET status = ?, verified_at = ?, notes = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$status, $verifiedAt, $notes, $id]);

    if ($stmt->rowCount() === 0) {
        // Check if ID exists
        $checkStmt = $pdo->prepare("SELECT id FROM registrations WHERE id = ?");
        $checkStmt->execute([$id]);
        if (!$checkStmt->fetch()) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Data pendaftar tidak ditemukan.']);
            exit();
        }
    }

    echo json_encode([
        'success' => true,
        'message' => "Status pendaftaran $id berhasil diperbarui menjadi '$status'.",
        'data' => [
            'id' => $id,
            'status' => $status,
            'verifiedAt' => $verifiedAt,
            'notes' => $notes
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Gagal memperbarui status di MySQL: ' . $e->getMessage()]);
}
