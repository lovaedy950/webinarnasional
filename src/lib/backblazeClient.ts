export const uploadProofToBackblaze = async (
  fileName: string,
  base64OrBuffer: string | Uint8Array,
  regId: string
): Promise<{ key: string; presignedUrl: string }> => {
  let base64Str = '';
  if (typeof base64OrBuffer === 'string') {
    base64Str = base64OrBuffer;
  } else {
    let binary = '';
    const bytes = base64OrBuffer;
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    base64Str = btoa(binary);
  }

  try {
    const res = await fetch('/api/upload_proof', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName,
        regId,
        base64Data: base64Str
      })
    });

    const data = await res.json();
    if (data.success && data.presignedUrl) {
      return {
        key: data.key,
        presignedUrl: data.presignedUrl
      };
    }
  } catch (err) {
    console.warn('Backblaze B2 Upload API Notice:', err);
  }

  return {
    key: `proofs/${regId}_${Date.now()}.png`,
    presignedUrl: base64Str
  };
};

export const getProofPresignedUrl = async (objectKeyOrUrl: string): Promise<string> => {
  if (!objectKeyOrUrl) return '';
  if (objectKeyOrUrl.startsWith('http://') || objectKeyOrUrl.startsWith('https://') || objectKeyOrUrl.startsWith('data:')) {
    return objectKeyOrUrl;
  }

  try {
    const res = await fetch('/api/upload_proof?key=' + encodeURIComponent(objectKeyOrUrl));
    const data = await res.json();
    if (data.success && data.url) {
      return data.url;
    }
  } catch (e) {
    console.warn('Failed to resolve B2 presigned URL:', e);
  }

  return objectKeyOrUrl;
};
