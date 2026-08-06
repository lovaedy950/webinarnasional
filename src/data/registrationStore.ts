import { RegistrationRecord } from '../types';
import { supabase } from '../lib/supabaseClient';
import { uploadProofToBackblaze, getProofPresignedUrl } from '../lib/backblazeClient';

const STORAGE_KEY = 'ppni_webinar_registrations_v1';
const LOGS_STORAGE_KEY = 'ppni_webinar_submission_logs_v1';

export interface SubmissionLog {
  id: number | string;
  createdAt: string;
  registrationId?: string;
  fullName: string;
  email: string;
  phone: string;
  payloadJson: string;
  status: 'success' | 'db_error' | 'validation_error' | 'network_error';
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  isResolved: boolean;
}

export const INITIAL_MOCK_REGISTRATIONS: RegistrationRecord[] = [
  {
    id: 'REG-101-001',
    createdAt: '2026-08-03 09:15',
    fullName: 'Ns. Hendra Wijaya, S.Kep',
    email: 'hendra.wijaya@kariadi.co.id',
    nikKtp: '3374011208920003',
    installation: 'Ruang ICU RSUP Dr. Kariadi',
    phone: '0812-3456-7891',
    cleanPhone: '6281234567891',
    city: 'Kota Semarang',
    categoryId: 'perawat_rsdk',
    categoryName: 'Perawat RSDK',
    series: ['ONKOLOGI', 'JANTUNG'],
    totalAmount: 20000,
    paymentProofName: 'bukti_tf_hendra_kariadi.jpg',
    status: 'valid',
    verifiedAt: '2026-08-03 09:40'
  }
];

export const INITIAL_MOCK_LOGS: SubmissionLog[] = [];

export const getRegistrations = (): RegistrationRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_REGISTRATIONS));
      return INITIAL_MOCK_REGISTRATIONS;
    }
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse registrations from localStorage', e);
  }
  return INITIAL_MOCK_REGISTRATIONS;
};

// Fetch all registrations from Supabase Database
export const fetchRegistrationsFromDB = async (): Promise<RegistrationRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      const records: RegistrationRecord[] = await Promise.all(
        data.map(async (row) => {
          let proofUrl = row.payment_proof_url || '';
          if (proofUrl && !proofUrl.startsWith('data:')) {
            try {
              proofUrl = await getProofPresignedUrl(proofUrl);
            } catch (err) {}
          }
          return {
            id: row.id,
            createdAt: row.created_at ? new Date(row.created_at).toISOString().replace('T', ' ').slice(0, 16) : '',
            fullName: row.full_name,
            email: row.email,
            nikKtp: row.nik_ktp,
            installation: row.installation,
            phone: row.phone,
            cleanPhone: row.clean_phone,
            city: row.city,
            categoryId: row.category_id,
            categoryName: row.category_name,
            series: Array.isArray(row.series) ? row.series : (typeof row.series === 'string' ? JSON.parse(row.series) : []),
            totalAmount: Number(row.total_amount || 0),
            paymentProofName: row.payment_proof_name || '',
            paymentProofUrl: proofUrl,
            status: row.status || 'pending'
          };
        })
      );

      if (records.length > 0) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
        } catch (stErr) {}
        return records;
      }
    }
  } catch (e) {
    console.warn('Failed to fetch registrations from Supabase Database:', e);
  }

  // Fallback to MySQL Hostinger API if Supabase fails
  try {
    const res = await fetch('/api/registrations.php?t=' + Date.now());
    const resData = await res.json();
    if (resData.success && Array.isArray(resData.data)) {
      if (resData.data.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resData.data));
        return resData.data;
      }
    }
  } catch (mysqlErr) {}

  return getRegistrations();
};

export const getSubmissionLogs = (): SubmissionLog[] => {
  try {
    const data = localStorage.getItem(LOGS_STORAGE_KEY);
    if (!data) {
      return INITIAL_MOCK_LOGS;
    }
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_MOCK_LOGS;
  }
};

export const recordSubmissionLog = async (log: Omit<SubmissionLog, 'id' | 'createdAt'>): Promise<SubmissionLog> => {
  const currentLogs = getSubmissionLogs();
  const newLog: SubmissionLog = {
    ...log,
    id: Date.now(),
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
  };

  const updated = [newLog, ...currentLogs];
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {}

  // Sync to Supabase submission_logs
  try {
    await supabase.from('submission_logs').insert([{
      registration_id: log.registrationId,
      full_name: log.fullName,
      email: log.email,
      phone: log.phone,
      payload_json: log.payloadJson,
      status: log.status,
      error_message: log.errorMessage,
      is_resolved: log.isResolved
    }]);
  } catch (sbLogErr) {}

  return newLog;
};

// Save new Registration: Upload proof to Backblaze B2 -> Save record to Supabase
export const saveRegistration = async (record: Omit<RegistrationRecord, 'id' | 'createdAt' | 'status'>): Promise<{ success: boolean; message: string; data?: RegistrationRecord }> => {
  const current = getRegistrations();
  
  // 0. Fetch live DB records to ensure unique incremental REG ID
  let maxNum = 0;
  try {
    const dbRecords = await fetchRegistrationsFromDB();
    const recordsToScan = dbRecords && dbRecords.length > 0 ? dbRecords : current;
    recordsToScan.forEach(r => {
      const match = r.id.match(/\d+$/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (num > maxNum) maxNum = num;
      }
    });
  } catch (e) {
    maxNum = current.length;
  }

  const nextNum = maxNum > 0 ? maxNum + 1 : (current.length + 1);
  const regId = `REG-101-${String(nextNum).padStart(3, '0')}`;
  const createdAt = new Date().toISOString().replace('T', ' ').slice(0, 16);

  let b2ProofKey = '';
  let b2PresignedUrl = '';

  // 1. Upload Payment Proof to Backblaze B2 Private Storage
  if (record.paymentProofUrl) {
    try {
      const b2Res = await uploadProofToBackblaze(
        record.paymentProofName || 'proof.png',
        record.paymentProofUrl,
        regId
      );
      b2ProofKey = b2Res.key;
      b2PresignedUrl = b2Res.presignedUrl;
    } catch (b2Err: any) {
      console.warn('Backblaze B2 Upload Notice:', b2Err);
      b2ProofKey = record.paymentProofUrl;
    }
  }

  const newRecord: RegistrationRecord = {
    ...record,
    id: regId,
    createdAt,
    paymentProofUrl: b2PresignedUrl || b2ProofKey || record.paymentProofUrl,
    status: 'pending'
  };

  // 2. Insert Record into Supabase Database
  try {
    const { data, error } = await supabase.from('registrations').insert([{
      id: regId,
      full_name: record.fullName,
      email: record.email,
      nik_ktp: record.nikKtp,
      installation: record.installation,
      phone: record.phone,
      clean_phone: record.cleanPhone,
      city: record.city,
      category_id: record.categoryId,
      category_name: record.categoryName,
      series: record.series,
      total_amount: record.totalAmount,
      payment_proof_name: record.paymentProofName,
      payment_proof_url: b2PresignedUrl || b2ProofKey || record.paymentProofUrl,
      status: 'pending'
    }]).select();

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      const updated = [newRecord, ...current.filter(r => r.id !== regId)];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (stErr) {}

      await recordSubmissionLog({
        registrationId: regId,
        fullName: record.fullName,
        email: record.email,
        phone: record.phone,
        payloadJson: JSON.stringify(record),
        status: 'success',
        isResolved: true
      });

      return {
        success: true,
        message: 'Pendaftaran & Bukti Transfer Anda berhasil disimpan ke Supabase Database & Backblaze B2 Storage!',
        data: newRecord
      };
    } else {
      const dbErr = error ? error.message : 'Supabase insert error';
      await recordSubmissionLog({
        registrationId: regId,
        fullName: record.fullName,
        email: record.email,
        phone: record.phone,
        payloadJson: JSON.stringify(record),
        status: 'db_error',
        errorMessage: dbErr,
        isResolved: false
      });
      return {
        success: false,
        message: `Gagal menyimpan data ke Supabase: ${dbErr}`
      };
    }
  } catch (err: any) {
    const netErr = `Terjadi kesalahan koneksi Supabase: ${err.message || 'Koneksi ke database terputus.'}`;
    await recordSubmissionLog({
      registrationId: regId,
      fullName: record.fullName,
      email: record.email,
      phone: record.phone,
      payloadJson: JSON.stringify(record),
      status: 'network_error',
      errorMessage: netErr,
      isResolved: false
    });
    return {
      success: false,
      message: netErr
    };
  }
};

export const fetchSubmissionLogsFromDB = async (): Promise<SubmissionLog[]> => {
  try {
    const { data, error } = await supabase
      .from('submission_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      const logs: SubmissionLog[] = data.map((row) => ({
        id: row.id,
        createdAt: row.created_at ? new Date(row.created_at).toISOString().replace('T', ' ').slice(0, 19) : '',
        registrationId: row.registration_id,
        fullName: row.full_name,
        email: row.email,
        phone: row.phone,
        payloadJson: row.payload_json,
        status: row.status,
        errorMessage: row.error_message,
        isResolved: row.is_resolved
      }));
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
      return logs;
    }
  } catch (e) {
    console.warn('Failed to fetch submission logs from Supabase:', e);
  }
  return getSubmissionLogs();
};

export const deleteRegistration = async (id: string, confirmationWord: string): Promise<{ success: boolean; message: string }> => {
  if (confirmationWord.trim().toLowerCase() !== 'hapus') {
    return { success: false, message: 'Kata kunci konfirmasi tidak sesuai. Harap ketik tulisan "hapus".' };
  }

  const current = getRegistrations();
  const target = current.find(r => r.id === id);

  if (!target) {
    return { success: false, message: 'Data pendaftar tidak ditemukan.' };
  }

  const updated = current.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  await recordSubmissionLog({
    registrationId: target.id,
    fullName: target.fullName,
    email: target.email,
    phone: target.phone,
    payloadJson: JSON.stringify(target),
    status: 'validation_error',
    errorMessage: `[AUDIT DELETE] Data pendaftar ID ${target.id} (${target.fullName}) telah DIHAPUS PERMANEN dari sistem oleh Admin.`,
    isResolved: true
  });

  // Delete from Supabase
  try {
    await supabase.from('registrations').delete().eq('id', id);
  } catch (err) {}

  return {
    success: true,
    message: `Data pendaftar ${target.fullName} (${target.id}) berhasil dihapus dari sistem & dicatat dalam System Audit Log.`
  };
};

export const retrySubmissionToDB = async (logId: number | string): Promise<{ success: boolean; message: string }> => {
  const logs = getSubmissionLogs();
  const targetIndex = logs.findIndex(l => String(l.id) === String(logId));

  if (targetIndex === -1) {
    return { success: false, message: 'Log submisi tidak ditemukan.' };
  }

  const log = logs[targetIndex];

  try {
    const payload: Omit<RegistrationRecord, 'id' | 'createdAt' | 'status'> = JSON.parse(log.payloadJson);
    const saveRes = await saveRegistration(payload);

    if (saveRes.success) {
      logs[targetIndex].isResolved = true;
      logs[targetIndex].status = 'success';
      logs[targetIndex].errorMessage = undefined;
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));

      return {
        success: true,
        message: `Pendaftaran ${log.fullName} berhasil dipulihkan ke Supabase Database & Backblaze Storage!`
      };
    } else {
      return {
        success: false,
        message: saveRes.message
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal memproses ulang payload: ${err.message}`
    };
  }
};

export const updateRegistrationStatus = async (id: string, status: 'pending' | 'valid' | 'rejected', notes?: string): Promise<RegistrationRecord[]> => {
  const current = getRegistrations();
  const verifiedAt = status === 'valid' ? new Date().toISOString().replace('T', ' ').slice(0, 16) : undefined;

  const updated = current.map(item => {
    if (item.id === id) {
      return {
        ...item,
        status,
        verifiedAt: verifiedAt || item.verifiedAt,
        notes: notes !== undefined ? notes : item.notes
      };
    }
    return item;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Sync to Supabase
  try {
    await supabase.from('registrations').update({
      status,
      ...(notes !== undefined ? { notes } : {})
    }).eq('id', id);
  } catch (err) {}

  return updated;
};

export const exportToCSV = (data: RegistrationRecord[]) => {
  const headers = ['ID Reg', 'Tanggal', 'Nama (LMS)', 'Email (LMS)', 'NIK KTP', 'Asal Instalasi', 'No HP', 'Kab/Kota', 'Kategori', 'Seri Terpilih', 'Total (Rp)', 'Status Pembayaran', 'Tgl Verifikasi'];
  
  const rows = data.map(item => [
    item.id,
    item.createdAt,
    `"${item.fullName.replace(/"/g, '""')}"`,
    `"${item.email.replace(/"/g, '""')}"`,
    `'${item.nikKtp}`,
    `"${item.installation.replace(/"/g, '""')}"`,
    `'${item.phone}`,
    `"${item.city.replace(/"/g, '""')}"`,
    `"${item.categoryName.replace(/"/g, '""')}"`,
    `"${item.series.join(', ')}"`,
    item.totalAmount,
    item.status === 'valid' ? 'SUDAH MEMBAYAR (LUNAS)' : item.status === 'rejected' ? 'DITOLAK' : 'MENUNGGU VERIFIKASI',
    item.verifiedAt || '-'
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Pendaftar_Webinar_HUT101_RSKariadi_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
