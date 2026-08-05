<?php
require_once __DIR__ . '/config.php';

$input = file_get_contents('php://input');
$payload = json_decode($input, true);

if (!$payload) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Format payload JSON tidak valid.']);
    exit();
}

$fullName = trim($payload['fullName'] ?? '');
$email = trim($payload['email'] ?? '');
$nikKtp = trim($payload['nikKtp'] ?? '');
$installation = trim($payload['installation'] ?? '');
$phone = trim($payload['phone'] ?? '');
$city = trim($payload['city'] ?? '');

if (!$fullName || !$email || !$nikKtp || !$installation || !$phone || !$city) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Mohon lengkapi seluruh 6 kolom formulir wajib.']);
    exit();
}

$pdo = getDbConnection();
if (!$pdo) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Gagal terhubung ke MySQL Hostinger. Periksa kredensial database.'
    ]);
    exit();
}

try {
    // Auto-generate Registration ID
    $stmt = $pdo->query("SELECT COUNT(*) as cnt FROM registrations");
    $row = $stmt->fetch();
    $count = ($row['cnt'] ?? 0) + 1;
    $regId = 'REG-101-' . str_pad($count, 3, '0', STR_PAD_LEFT);

    $cleanPhone = preg_replace('/\D/', '', $phone);
    if (strpos($cleanPhone, '0') === 0) {
        $cleanPhone = '62' . substr($cleanPhone, 1);
    }

    // Auto-migrate table column to LONGTEXT if needed to prevent string truncation
    try {
        $pdo->exec("ALTER TABLE registrations MODIFY COLUMN payment_proof_url LONGTEXT");
    } catch (Exception $alterEx) {}

    $proofUrl = $payload['paymentProofUrl'] ?? '';
    if (strpos($proofUrl, 'data:') === 0) {
        $uploadDir = __DIR__ . '/../uploads/';
        if (!file_exists($uploadDir)) {
            @mkdir($uploadDir, 0755, true);
        }
        $parts = explode(',', $proofUrl);
        if (count($parts) === 2) {
            $fileData = base64_decode($parts[1]);
            if ($fileData !== false) {
                $ext = 'png';
                if (strpos($parts[0], 'jpeg') !== false || strpos($parts[0], 'jpg') !== false) $ext = 'jpg';
                else if (strpos($parts[0], 'pdf') !== false) $ext = 'pdf';
                
                $savedFilename = 'proof_' . $regId . '_' . time() . '.' . $ext;
                if (@file_put_contents($uploadDir . $savedFilename, $fileData)) {
                    $proofUrl = '/uploads/' . $savedFilename;
                }
            }
        }
    }

    $seriesArr = $payload['series'] ?? [];
    $seriesJson = is_array($seriesArr) ? json_encode($seriesArr) : $seriesArr;

    $sql = "INSERT INTO registrations 
            (id, created_at, full_name, email, nik_ktp, installation, phone, clean_phone, city, category_id, category_name, series, total_amount, payment_proof_name, payment_proof_url, status)
            VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $regId,
        $fullName,
        $email,
        $nikKtp,
        $installation,
        $phone,
        $cleanPhone,
        $city,
        $payload['categoryId'] ?? 'perawat',
        $payload['categoryName'] ?? 'Perawat',
        $seriesJson,
        $payload['totalAmount'] ?? 0,
        $payload['paymentProofName'] ?? '',
        $proofUrl
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Pendaftaran Anda berhasil disimpan ke database MySQL Hostinger!',
        'registrationId' => $regId
    ]);

} catch (PDOException $e) {
    // Log submission error to submission_logs table if registration fails
    try {
        $logSql = "INSERT INTO submission_logs 
                   (full_name, email, phone, payload_json, status, error_message, ip_address, user_agent)
                   VALUES (?, ?, ?, ?, 'db_error', ?, ?, ?)";
        $logStmt = $pdo->prepare($logSql);
        $logStmt->execute([
            $fullName,
            $email,
            $phone,
            json_encode($payload),
            $e->getMessage(),
            $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
            $_SERVER['HTTP_USER_AGENT'] ?? ''
        ]);
    } catch (Exception $logEx) {}

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Gagal menyimpan data pendaftaran ke MySQL: ' . $e->getMessage()
    ]);
}
