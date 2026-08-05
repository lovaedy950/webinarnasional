<?php
require_once __DIR__ . '/config.php';

$input = file_get_contents('php://input');
$payload = json_decode($input, true);

$id = isset($payload['id']) ? $payload['id'] : null;
if (!$id && isset($_GET['id'])) {
    $id = $_GET['id'];
}

if (!$id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID log wajib diisi.']);
    exit();
}

$pdo = getDbConnection();
if (!$pdo) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Gagal terhubung ke MySQL Hostinger.']);
    exit();
}

try {
    // Fetch log entry from submission_logs
    $stmt = $pdo->prepare("SELECT * FROM submission_logs WHERE id = ?");
    $stmt->execute([$id]);
    $log = $stmt->fetch();

    if (!$log) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Log submisi tidak ditemukan di database.']);
        exit();
    }

    $rawPayload = json_decode($log['payload_json'], true);
    if (!$rawPayload) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Format payload JSON dalam log tidak valid.']);
        exit();
    }

    $fullName = trim($rawPayload['fullName'] ?? '');
    $email = trim($rawPayload['email'] ?? '');
    $nikKtp = trim($rawPayload['nikKtp'] ?? '');
    $installation = trim($rawPayload['installation'] ?? '');
    $phone = trim($rawPayload['phone'] ?? '');
    $city = trim($rawPayload['city'] ?? '');

    $regId = $log['registration_id'] ?? ('REG-101-' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT));
    $cleanPhone = preg_replace('/\D/', '', $phone);
    if (strpos($cleanPhone, '0') === 0) {
        $cleanPhone = '62' . substr($cleanPhone, 1);
    }

    $seriesArr = $rawPayload['series'] ?? [];
    $seriesJson = is_array($seriesArr) ? json_encode($seriesArr) : $seriesArr;

    $sqlInsert = "INSERT INTO registrations 
                  (id, created_at, full_name, email, nik_ktp, installation, phone, clean_phone, city, category_id, category_name, series, total_amount, payment_proof_name, payment_proof_url, status)
                  VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')";

    $stmtInsert = $pdo->prepare($sqlInsert);
    $stmtInsert->execute([
        $regId,
        $fullName,
        $email,
        $nikKtp,
        $installation,
        $phone,
        $cleanPhone,
        $city,
        $rawPayload['categoryId'] ?? 'perawat',
        $rawPayload['categoryName'] ?? 'Perawat',
        $seriesJson,
        $rawPayload['totalAmount'] ?? 0,
        $rawPayload['paymentProofName'] ?? '',
        $rawPayload['paymentProofUrl'] ?? null
    ]);

    // Mark log as resolved
    $updateLog = $pdo->prepare("UPDATE submission_logs SET is_resolved = 1, status = 'success', resolved_at = NOW() WHERE id = ?");
    $updateLog->execute([$id]);

    echo json_encode([
        'success' => true,
        'message' => "Pendaftaran $fullName ($regId) berhasil dipulihkan & dimasukkan ke database MySQL!"
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Gagal retry submisi ke MySQL: ' . $e->getMessage()]);
}
