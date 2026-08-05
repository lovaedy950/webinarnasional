<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$input = file_get_contents('php://input');
$payload = json_decode($input, true);

if (!$payload || (empty($payload['base64Data']) && empty($payload['paymentProofUrl']))) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Payload base64Data tidak boleh kosong.']);
    exit();
}

$fileName = $payload['fileName'] ?? $payload['paymentProofName'] ?? 'proof.png';
$regId = $payload['regId'] ?? $payload['id'] ?? ('REG-' . time());
$base64Data = $payload['base64Data'] ?? $payload['paymentProofUrl'];

// Clean base64 string
$mimeType = 'image/png';
$ext = 'png';
if (strpos($base64Data, 'data:') === 0) {
    $parts = explode(',', $base64Data);
    $meta = $parts[0];
    if (strpos($meta, 'jpeg') !== false || strpos($meta, 'jpg') !== false) {
        $mimeType = 'image/jpeg';
        $ext = 'jpg';
    } elseif (strpos($meta, 'pdf') !== false) {
        $mimeType = 'application/pdf';
        $ext = 'pdf';
    }
    $rawBase64 = $parts[1];
} else {
    $rawBase64 = $base64Data;
}

$fileBytes = base64_decode($rawBase64);
if ($fileBytes === false) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Format base64 file tidak valid.']);
    exit();
}

// Backblaze B2 Kredensial
$keyId = '005612fd9a2617a0000000001';
$applicationKey = 'K005BOIBB37qknL+qSsW2SaFi7ojOnM';
$bucketId = 'b691929fedc9da0296f1071a';
$bucketName = 'pendaftaran-screenshot';

try {
    // 1. Authorize Account
    $authHeader = "Authorization: Basic " . base64_encode($keyId . ":" . $applicationKey);
    $ch = curl_init('https://api.backblazeb2.com/b2api/v2/b2_authorize_account');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [$authHeader]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $authRes = json_decode(curl_exec($ch), true);
    curl_close($ch);

    if (empty($authRes['authorizationToken'])) {
        throw new Exception('Gagal melakukan otentikasi ke Backblaze B2 API.');
    }

    $apiUrl = $authRes['apiUrl'];
    $downloadUrl = $authRes['downloadUrl'];
    $accountAuthToken = $authRes['authorizationToken'];

    // 2. Get Upload URL
    $ch = curl_init($apiUrl . '/b2api/v2/b2_get_upload_url');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: " . $accountAuthToken,
        "Content-Type: application/json"
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['bucketId' => $bucketId]));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $uploadUrlRes = json_decode(curl_exec($ch), true);
    curl_close($ch);

    if (empty($uploadUrlRes['uploadUrl'])) {
        throw new Exception('Gagal mendapatkan Upload URL dari Backblaze B2.');
    }

    $uploadUrl = $uploadUrlRes['uploadUrl'];
    $uploadAuthToken = $uploadUrlRes['authorizationToken'];

    // 3. Upload File Bytes
    $objectKey = 'proofs/' . $regId . '_' . time() . '.' . $ext;
    $sha1Hash = sha1($fileBytes);

    $ch = curl_init($uploadUrl);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: " . $uploadAuthToken,
        "X-Bz-File-Name: " . urlencode($objectKey),
        "Content-Type: " . $mimeType,
        "X-Bz-Content-Sha1: " . $sha1Hash
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $fileBytes);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $uploadFileRes = json_decode(curl_exec($ch), true);
    curl_close($ch);

    // 4. Get Download Authorization (7 days)
    $ch = curl_init($apiUrl . '/b2api/v2/b2_get_download_authorization');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: " . $accountAuthToken,
        "Content-Type: application/json"
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'bucketId' => $bucketId,
        'fileNamePrefix' => 'proofs/',
        'validDurationInSeconds' => 7 * 86400
    ]));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $dlAuthRes = json_decode(curl_exec($ch), true);
    curl_close($ch);

    $downloadAuthToken = $dlAuthRes['authorizationToken'] ?? '';
    $finalPresignedUrl = $downloadUrl . '/file/' . $bucketName . '/' . $objectKey . ($downloadAuthToken ? ('?Authorization=' . urlencode($downloadAuthToken)) : '');

    echo json_encode([
        'success' => true,
        'key' => $objectKey,
        'presignedUrl' => $finalPresignedUrl,
        'fileName' => $fileName
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Terjadi kesalahan upload Backblaze B2: ' . $e->getMessage()
    ]);
}
