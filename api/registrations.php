<?php
require_once __DIR__ . '/config.php';

$pdo = getDbConnection();
if (!$pdo) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection error']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM registrations ORDER BY created_at DESC");
        $rows = $stmt->fetchAll();
        $registrations = array_map(function($r) {
            return [
                'id' => $r['id'],
                'createdAt' => $r['created_at'],
                'fullName' => $r['full_name'],
                'email' => $r['email'],
                'nikKtp' => $r['nik_ktp'],
                'installation' => $r['installation'],
                'phone' => $r['phone'],
                'cleanPhone' => $r['clean_phone'],
                'city' => $r['city'],
                'categoryId' => $r['category_id'],
                'categoryName' => $r['category_name'],
                'series' => json_decode($r['series'] ?? '[]', true) ?: [],
                'totalAmount' => (float)$r['total_amount'],
                'paymentProofName' => $r['payment_proof_name'],
                'paymentProofUrl' => $r['payment_proof_url'],
                'status' => $r['status'],
                'verifiedAt' => $r['verified_at'],
                'notes' => $r['notes']
            ];
        }, $rows);

        echo json_encode(['success' => true, 'data' => $registrations]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}
