export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const keyId = process.env.B2_KEY_ID || '005612fd9a2617a0000000001';
  const applicationKey = process.env.B2_APPLICATION_KEY || 'K005BOIBB37qknL+qSsW2SaFi7ojOnM';
  const bucketId = 'b691929fedc9da0296f1071a';
  const bucketName = process.env.B2_BUCKET_NAME || 'pendaftaran-screenshot';

  // Handle GET request to generate download URL for an object key
  if (req.method === 'GET') {
    const objectKey = req.query?.key || req.query?.file || '';
    if (!objectKey) {
      return res.status(400).json({ success: false, message: 'Query parameter key is required' });
    }

    try {
      const authHeader = 'Basic ' + Buffer.from(`${keyId}:${applicationKey}`).toString('base64');
      const authRes = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
        headers: { Authorization: authHeader }
      }).then(r => r.json());

      if (!authRes.authorizationToken) {
        throw new Error('Gagal mendatangkan token dari Backblaze B2');
      }

      const { apiUrl, downloadUrl, authorizationToken: accountAuthToken } = authRes;

      const dlAuthRes = await fetch(`${apiUrl}/b2api/v2/b2_get_download_authorization`, {
        method: 'POST',
        headers: {
          Authorization: accountAuthToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bucketId,
          fileNamePrefix: objectKey.startsWith('proofs/') ? 'proofs/' : objectKey,
          validDurationInSeconds: 7 * 86400
        })
      }).then(r => r.json());

      const downloadAuthToken = dlAuthRes.authorizationToken || '';
      const finalPresignedUrl = `${downloadUrl}/file/${bucketName}/${objectKey}${downloadAuthToken ? '?Authorization=' + encodeURIComponent(downloadAuthToken) : ''}`;

      return res.status(200).json({
        success: true,
        url: finalPresignedUrl
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  // Handle POST request to upload proof
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const fileName = body?.fileName || body?.paymentProofName || 'proof.png';
    const regId = body?.regId || body?.id || ('REG-' + Date.now());
    const base64Data = body?.base64Data || body?.paymentProofUrl;

    if (!base64Data) {
      return res.status(400).json({ success: false, message: 'Payload base64Data tidak boleh kosong.' });
    }

    // 1. Authorize B2 Account
    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${applicationKey}`).toString('base64');
    const authRes = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
      headers: { Authorization: authHeader }
    }).then(r => r.json());

    if (!authRes.authorizationToken) {
      throw new Error('Gagal mendatangkan token dari Backblaze B2');
    }

    const { apiUrl, downloadUrl, authorizationToken: accountAuthToken } = authRes;

    // 2. Get Upload URL
    const uploadUrlRes = await fetch(`${apiUrl}/b2api/v2/b2_get_upload_url`, {
      method: 'POST',
      headers: {
        Authorization: accountAuthToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bucketId })
    }).then(r => r.json());

    if (!uploadUrlRes.uploadUrl) {
      throw new Error('Gagal mendapatkan B2 Upload URL');
    }

    const { uploadUrl, authorizationToken: uploadAuthToken } = uploadUrlRes;

    // 3. Clean Base64 & Buffer
    let rawBase64 = base64Data;
    let mimeType = 'image/png';
    let ext = 'png';

    if (base64Data.startsWith('data:')) {
      const parts = base64Data.split(',');
      const meta = parts[0];
      if (meta.includes('jpeg') || meta.includes('jpg')) {
        mimeType = 'image/jpeg';
        ext = 'jpg';
      } else if (meta.includes('pdf')) {
        mimeType = 'application/pdf';
        ext = 'pdf';
      }
      rawBase64 = parts[1];
    }

    const fileBuffer = Buffer.from(rawBase64, 'base64');
    const objectKey = `proofs/${regId}_${Date.now()}.${ext}`;

    const crypto = await import('crypto');
    const sha1Hash = crypto.createHash('sha1').update(fileBuffer).digest('hex');

    // 4. Upload File to B2 Private Bucket
    await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: uploadAuthToken,
        'X-Bz-File-Name': encodeURIComponent(objectKey),
        'Content-Type': mimeType,
        'X-Bz-Content-Sha1': sha1Hash
      },
      body: fileBuffer
    }).then(r => r.json());

    // 5. Get Download Authorization (7 days)
    const dlAuthRes = await fetch(`${apiUrl}/b2api/v2/b2_get_download_authorization`, {
      method: 'POST',
      headers: {
        Authorization: accountAuthToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bucketId,
        fileNamePrefix: 'proofs/',
        validDurationInSeconds: 7 * 86400
      })
    }).then(r => r.json());

    const downloadAuthToken = dlAuthRes.authorizationToken || '';
    const finalPresignedUrl = `${downloadUrl}/file/${bucketName}/${objectKey}${downloadAuthToken ? '?Authorization=' + encodeURIComponent(downloadAuthToken) : ''}`;

    return res.status(200).json({
      success: true,
      key: objectKey,
      presignedUrl: finalPresignedUrl,
      fileName
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal Server Error'
    });
  }
}
