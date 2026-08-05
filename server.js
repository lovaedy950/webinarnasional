import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static frontend files if built for Hostinger static hosting
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// ----------------------------------------------------
// Hostinger MySQL Connection Pool & Fallback Storage
// ----------------------------------------------------
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'u701755284_ppni_webinar',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool = null;

const getPool = () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
};

// Fallback JSON log file for tracking failed submissions if MySQL is offline/erroring
const FALLBACK_LOG_FILE = path.join(__dirname, 'failed_submissions_log.json');

const getFallbackLogs = () => {
  if (!fs.existsSync(FALLBACK_LOG_FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(FALLBACK_LOG_FILE, 'utf-8'));
  } catch (e) {
    return [];
  }
};

const saveFallbackLog = (logEntry) => {
  const current = getFallbackLogs();
  const updated = [logEntry, ...current];
  try {
    fs.writeFileSync(FALLBACK_LOG_FILE, JSON.stringify(updated, null, 2));
  } catch (e) {
    console.error('Failed to write fallback log file:', e);
  }
  return updated;
};

// ----------------------------------------------------
// API ENDPOINTS
// ----------------------------------------------------

// Health Check & Hostinger Diagnostic Status
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let dbError = null;

  try {
    const connection = await getPool().getConnection();
    await connection.ping();
    connection.release();
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'error';
    dbError = err.message;
  }

  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    hostinger: true,
    database: {
      status: dbStatus,
      host: dbConfig.host,
      database: dbConfig.database,
      user: dbConfig.user,
      error: dbError
    }
  });
});

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'adminwebinar' && password === 'hut101') {
    return res.json({ success: true, token: 'auth-token-hut101-rsdk' });
  }
  return res.status(401).json({ success: false, message: 'Username atau password admin salah.' });
});

// POST /api/register - Main Registration & Error Tracking Endpoint
app.post('/api/register', async (req, res) => {
  const payload = req.body;
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || '';

  const {
    fullName,
    email,
    nikKtp,
    installation,
    phone,
    city,
    categoryId,
    categoryName,
    series,
    totalAmount,
    paymentProofName,
    paymentProofUrl
  } = payload;

  // 1. Basic Validation
  if (!fullName || !email || !nikKtp || !installation || !phone || !city) {
    const errorLog = {
      id: Date.now(),
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      fullName: fullName || 'Kosong',
      email: email || 'Kosong',
      phone: phone || 'Kosong',
      payloadJson: JSON.stringify(payload),
      status: 'validation_error',
      errorMessage: 'Formulir pendaftaran tidak lengkap (6 kolom wajib).',
      ipAddress,
      userAgent,
      isResolved: false
    };

    saveFallbackLog(errorLog);
    return res.status(400).json({
      success: false,
      message: 'Mohon lengkapi seluruh 6 kolom formulir pendaftaran.',
      log: errorLog
    });
  }

  // NIK KTP 16-digit validation
  const cleanNik = String(nikKtp).replace(/\D/g, '');
  if (cleanNik.length !== 16) {
    const errorLog = {
      id: Date.now(),
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      fullName: fullName || 'Kosong',
      email: email || 'Kosong',
      phone: phone || 'Kosong',
      payloadJson: JSON.stringify(payload),
      status: 'validation_error',
      errorMessage: `NIK KTP tidak sesuai standar 16 digit (Diinput: ${cleanNik.length} digit).`,
      ipAddress,
      userAgent,
      isResolved: false
    };

    saveFallbackLog(errorLog);
    return res.status(400).json({
      success: false,
      message: `No. KTP / NIK KTP harus terdiri dari tepat 16 digit angka (Diinput: ${cleanNik.length} digit).`,
      log: errorLog
    });
  }

  const cleanPhone = phone.replace(/\D/g, '').replace(/^0/, '62');
  const regId = `REG-101-${Math.floor(100 + Math.random() * 900)}`;
  const createdAt = new Date().toISOString().replace('T', ' ').slice(0, 19);

  // 2. Attempt MySQL Insert
  try {
    const connection = await getPool().getConnection();
    
    // Insert into registrations table (including payment_proof_url)
    const sqlInsert = `
      INSERT INTO registrations 
      (id, created_at, full_name, email, nik_ktp, installation, phone, clean_phone, city, category_id, category_name, series, total_amount, payment_proof_name, payment_proof_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `;

    await connection.query(sqlInsert, [
      regId,
      createdAt,
      fullName,
      email,
      nikKtp,
      installation,
      phone,
      cleanPhone,
      city,
      categoryId || 'medis',
      categoryName || 'Peserta',
      JSON.stringify(series || []),
      totalAmount || 0,
      paymentProofName || '',
      paymentProofUrl || null
    ]);

    // Log success into submission_logs table
    const sqlLog = `
      INSERT INTO submission_logs 
      (created_at, registration_id, full_name, email, phone, payload_json, status, error_message, ip_address, user_agent, is_resolved)
      VALUES (?, ?, ?, ?, ?, ?, 'success', NULL, ?, ?, 1)
    `;
    await connection.query(sqlLog, [createdAt, regId, fullName, email, phone, JSON.stringify(payload), ipAddress, userAgent]);

    connection.release();

    return res.json({
      success: true,
      message: 'Pendaftaran berhasil dikirimkan ke database!',
      data: {
        id: regId,
        createdAt,
        fullName,
        email,
        totalAmount,
        status: 'pending'
      }
    });

  } catch (err) {
    console.error('DATABASE INSERT ERROR:', err.message);

    // 3. DATABASE ERROR TRACKING SYSTEM: Record error to fallback log & submission_logs
    const errorLog = {
      id: Date.now(),
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      registrationId: regId,
      fullName,
      email,
      phone,
      payloadJson: JSON.stringify(payload),
      status: 'db_error',
      errorMessage: `Database MySQL Error: ${err.message}`,
      ipAddress,
      userAgent,
      isResolved: false
    };

    // Save locally so Admin Menu can inspect and retry even when DB fails!
    saveFallbackLog(errorLog);

    return res.status(500).json({
      success: false,
      message: 'Pendaftaran gagal masuk ke database MySQL, namun data telah dicatat dalam Tracking System Admin untuk dipulihkan.',
      error: err.message,
      trackingLog: errorLog
    });
  }
});

// GET /api/registrations - Retrieve All Registrations
app.get('/api/registrations', async (req, res) => {
  try {
    const connection = await getPool().getConnection();
    const [rows] = await connection.query('SELECT * FROM registrations ORDER BY created_at DESC');
    connection.release();

    const formatted = rows.map(r => ({
      id: r.id,
      createdAt: r.created_at,
      fullName: r.full_name,
      email: r.email,
      nikKtp: r.nik_ktp,
      installation: r.installation,
      phone: r.phone,
      cleanPhone: r.clean_phone,
      city: r.city,
      categoryId: r.category_id,
      categoryName: r.category_name,
      series: typeof r.series === 'string' ? JSON.parse(r.series) : r.series,
      totalAmount: Number(r.total_amount),
      paymentProofName: r.payment_proof_name,
      paymentProofUrl: r.payment_proof_url,
      status: r.status,
      verifiedAt: r.verified_at,
      notes: r.notes
    }));

    return res.json({ success: true, data: formatted });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data dari database MySQL',
      error: err.message
    });
  }
});

// DELETE /api/registrations/:id - Admin Delete Participant with Audit Log
app.delete('/api/registrations/:id', async (req, res) => {
  const { id } = req.params;
  const { confirmationWord } = req.body || {};

  if (!confirmationWord || confirmationWord.trim().toLowerCase() !== 'hapus') {
    return res.status(400).json({
      success: false,
      message: 'Konfirmasi tidak valid. Harap ketik kata "hapus".'
    });
  }

  try {
    const connection = await getPool().getConnection();
    
    // Select record first for audit log
    const [rows] = await connection.query('SELECT * FROM registrations WHERE id = ?', [id]);
    if (rows.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Data pendaftar tidak ditemukan.' });
    }

    const target = rows[0];

    // Audit Log Insert
    const createdAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const auditMsg = `[AUDIT DELETE] Data pendaftar ID ${target.id} (${target.full_name}) telah DIHAPUS PERMANEN oleh Admin.`;
    
    await connection.query(
      `INSERT INTO submission_logs 
      (created_at, registration_id, full_name, email, phone, payload_json, status, error_message, is_resolved)
      VALUES (?, ?, ?, ?, ?, ?, 'validation_error', ?, 1)`,
      [createdAt, target.id, target.full_name, target.email, target.phone, JSON.stringify(target), auditMsg]
    );

    // Delete record
    await connection.query('DELETE FROM registrations WHERE id = ?', [id]);
    connection.release();

    return res.json({
      success: true,
      message: `Data pendaftar ${target.full_name} (${target.id}) berhasil dihapus dan dicatat dalam System Audit Log.`
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus data dari database MySQL',
      error: err.message
    });
  }
});

// GET /api/submission-logs - Retrieve Tracking & Error Submisi Logs
app.get('/api/submission-logs', async (req, res) => {
  let dbLogs = [];
  try {
    const connection = await getPool().getConnection();
    const [rows] = await connection.query('SELECT * FROM submission_logs ORDER BY created_at DESC LIMIT 100');
    connection.release();
    dbLogs = rows.map(r => ({
      id: r.id,
      createdAt: r.created_at,
      registrationId: r.registration_id,
      fullName: r.full_name,
      email: r.email,
      phone: r.phone,
      payloadJson: r.payload_json,
      status: r.status,
      errorMessage: r.error_message,
      ipAddress: r.ip_address,
      userAgent: r.user_agent,
      isResolved: Boolean(r.is_resolved)
    }));
  } catch (err) {
    console.warn('Could not fetch logs from DB, using fallback logs:', err.message);
  }

  const fallbackLogs = getFallbackLogs();
  
  // Merge logs (fallback logs prioritized for DB errors)
  const combined = [...fallbackLogs, ...dbLogs];

  return res.json({
    success: true,
    data: combined
  });
});

// POST /api/submission-logs/:id/retry - Admin Retry Resubmit Failed Entry to DB
app.post('/api/submission-logs/:id/retry', async (req, res) => {
  const { id } = req.params;
  const fallbackLogs = getFallbackLogs();
  const targetLog = fallbackLogs.find(l => String(l.id) === String(id));

  if (!targetLog) {
    return res.status(404).json({ success: false, message: 'Log submisi gagal tidak ditemukan.' });
  }

  try {
    const payload = JSON.parse(targetLog.payloadJson);
    const connection = await getPool().getConnection();
    
    const regId = targetLog.registrationId || `REG-101-${Math.floor(100 + Math.random() * 900)}`;
    const createdAt = targetLog.createdAt || new Date().toISOString().replace('T', ' ').slice(0, 19);

    const sqlInsert = `
      INSERT INTO registrations 
      (id, created_at, full_name, email, nik_ktp, installation, phone, clean_phone, city, category_id, category_name, series, total_amount, payment_proof_name, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `;

    const cleanPhone = (payload.phone || '').replace(/\D/g, '').replace(/^0/, '62');

    await connection.query(sqlInsert, [
      regId,
      createdAt,
      payload.fullName,
      payload.email,
      payload.nikKtp,
      payload.installation,
      payload.phone,
      cleanPhone,
      payload.city,
      payload.categoryId || 'medis',
      payload.categoryName || 'Peserta',
      JSON.stringify(payload.series || []),
      payload.totalAmount || 0,
      payload.paymentProofName || ''
    ]);

    connection.release();

    // Mark log as resolved
    targetLog.isResolved = true;
    targetLog.resolvedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
    fs.writeFileSync(FALLBACK_LOG_FILE, JSON.stringify(fallbackLogs, null, 2));

    return res.json({
      success: true,
      message: `Pendaftaran ${payload.fullName} berhasil dikirim ulang ke database MySQL!`
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Gagal mengirim ulang ke database MySQL: ${err.message}`
    });
  }
});

// Fallback route for Single Page Application
app.get('*', (req, res) => {
  if (fs.existsSync(path.join(distPath, 'index.html'))) {
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    res.send('API Server Webinar HUT 101 RSUP Dr. Kariadi - Port 3000');
  }
});

app.listen(PORT, () => {
  console.log(`Server Express Hostinger berjalan di http://localhost:${PORT}`);
});
