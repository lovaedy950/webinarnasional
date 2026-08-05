# Panduan Lengkap Instalasi Backend & Database di Hostinger
**Proyek**: Parade Webinar Nasional HUT Ke-101 RSUP Dr. Kariadi & DPK PPNI

---

## 🛠️ Persiapan & Struktur File Backend
Aplikasi ini mendukung deployment ke **Hostinger Shared Hosting / VPS / Cloud Hosting**.

### File Kunci Deployment:
1. `database/schema.sql` → Schema MySQL (Tabel `registrations` & `submission_logs`).
2. `server.js` → Express API backend dengan **System Tracking Submisi Error**.
3. `.env.example` → Template konfigurasi koneksi MySQL Hostinger.
4. `.htaccess` → Konfigurasi routing SPA & keamanan Hostinger.

---

## 📊 Langkah 1: Buat & Import Database MySQL di Hostinger (hPanel)

1. Login ke **hPanel Hostinger** (`hpanel.hostinger.com`).
2. Masuk ke menu **Databases** > **MySQL Databases**.
3. Buat database baru:
   - **Database Name**: contoh `u123456789_ppni_webinar`
   - **MySQL Username**: contoh `u123456789_ppni`
   - **Password**: `PasswordKuatAnda123!`
4. Klik **Create / Buat**.
5. Buka **phpMyAdmin** untuk database yang baru dibuat.
6. Klik tab **Import** pada phpMyAdmin.
7. Pilih file [`database/schema.sql`](file:///E:/Workspace_Visualcode/seminarNasionalPPNI/database/schema.sql) lalu klik **Go / Kirim**.
8. Struktur tabel `registrations` dan `submission_logs` beserta data sampel akan otomatis terbuat.

---

## 🚀 Langkah 2: Deploy Backend Node.js / Express di Hostinger

### Opsi A: Menggunakan Node.js App Manager Hostinger (Rekomendasi)
1. Di hPanel Hostinger, masuk ke menu **Node.js** (Websites > Manage > Node.js).
2. Buat aplikasi Node.js baru:
   - **Node.js version**: 18.x atau 20.x
   - **Application Root**: `public_html` (atau subfolder sesuai domain)
   - **Application Startup File**: `server.js`
3. Upload seluruh file proyek (kecuali `node_modules`) menggunakan **File Manager** atau **Git Deployment**.
4. Buat file `.env` di server berdasarkan file `.env.example`:
   ```env
   PORT=3000
   NODE_ENV=production
   DB_HOST=localhost
   DB_USER=u123456789_ppni
   DB_PASSWORD=PasswordKuatAnda123!
   DB_NAME=u123456789_ppni_webinar
   DB_PORT=3306
   ```
5. Di hPanel Node.js Manager, klik **Run Npm Install** untuk memasang dependency `mysql2`, `express`, `cors`, `dotenv`.
6. Klik **Start App** atau **Restart App**.

### Opsi B: Build Static Single Bundle (Shared Web Hosting Standar)
Jika menggunakan paket Shared Hosting standar tanpa Node.js Manager:
1. Jalankan `npm run build` di lokal.
2. Upload seluruh isi folder `dist/` ke folder `public_html` di Hostinger.
3. Upload file `server.js` & `.htaccess` ke root `public_html`.

---

## 🔍 Langkah 3: Sistem Tracking & Recovery Submisi Gagal di Panel Admin

Sistem ini dilengkapi dengan **Error Submisi & Recovery Tracking**:

- **Akses Admin Portal**: `/admin` (Username: `adminwebinar` | Password: `hut101`).
- **Tab "Tracking & Error Submisi"**:
  - Jika terdapat kendala jaringan, koneksi MySQL Hostinger terputus, atau schema error saat peserta menekan tombol kirim pendaftaran, sistem akan **otomatis mencatat payload formulir** ke dalam menu tracking ini.
  - Admin dapat memantau diagnosis error MySQL secara detail (pesan error, IP address, timestamp, dan raw payload JSON).
  - Admin cukup menekan tombol **"Coba Kirim Ulang (Retry DB)"** di menu admin untuk memasukkan payload yang gagal tersebut secara otomatis ke database MySQL tanpa meminta peserta mengisi ulang formulir!

---

## 📞 Kontak Dukungan
Jika memerlukan penyesuaian kredensial atau bantuan instalasi tambahan, silakan hubungi tim pengembang.
