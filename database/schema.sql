-- MySQL / MariaDB Database Schema for Hostinger Web Hosting
-- Project: Parade Webinar Nasional HUT Ke-101 RSUP Dr. Kariadi & DPK PPNI

-- (Hapus/Komentar baris CREATE DATABASE & USE agar kompatibel dengan Hostinger)
-- CREATE DATABASE IF NOT EXISTS `ppni_webinar_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE `ppni_webinar_db`;

-- 1. Table: registrations (Data Pendaftar)
CREATE TABLE IF NOT EXISTS `registrations` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `full_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `nik_ktp` VARCHAR(20) NOT NULL,
  `installation` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `clean_phone` VARCHAR(50) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `category_id` VARCHAR(50) NOT NULL,
  `category_name` VARCHAR(100) NOT NULL,
  `series` TEXT NOT NULL, -- JSON formatted array string (e.g. ["ONKOLOGI", "JANTUNG"])
  `total_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `payment_proof_name` VARCHAR(255) NULL,
  `payment_proof_url` LONGTEXT NULL,
  `status` ENUM('pending', 'valid', 'rejected') NOT NULL DEFAULT 'pending',
  `verified_at` DATETIME NULL,
  `notes` TEXT NULL,
  INDEX `idx_email` (`email`),
  INDEX `idx_nik` (`nik_ktp`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table: submission_logs (Tracking & Error Submisi Gagal)
CREATE TABLE IF NOT EXISTS `submission_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `registration_id` VARCHAR(50) NULL,
  `full_name` VARCHAR(255) NULL,
  `email` VARCHAR(255) NULL,
  `phone` VARCHAR(50) NULL,
  `payload_json` LONGTEXT NOT NULL,
  `status` ENUM('success', 'db_error', 'validation_error', 'network_error') NOT NULL DEFAULT 'db_error',
  `error_message` TEXT NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `is_resolved` TINYINT(1) NOT NULL DEFAULT 0,
  `resolved_at` DATETIME NULL,
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_resolved` (`is_resolved`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Mock Data Initial Insertion for Testing on Hostinger
INSERT INTO `registrations` (`id`, `created_at`, `full_name`, `email`, `nik_ktp`, `installation`, `phone`, `clean_phone`, `city`, `category_id`, `category_name`, `series`, `total_amount`, `payment_proof_name`, `status`, `verified_at`) VALUES
('REG-101-001', '2026-08-03 09:15:00', 'Ns. Hendra Wijaya, S.Kep', 'hendra.wijaya@kariadi.co.id', '3374011208920003', 'Ruang ICU RSUP Dr. Kariadi', '0812-3456-7891', '6281234567891', 'Kota Semarang', 'perawat_rsdk', 'Perawat RSDK', '["ONKOLOGI", "JANTUNG"]', 20000.00, 'bukti_tf_hendra_kariadi.jpg', 'valid', '2026-08-03 09:40:00'),
('REG-101-002', '2026-08-03 10:30:00', 'dr. Rina Kartika, Sp.PD', 'rina.kartika@gmail.com', '3374024509880001', 'RSUD Tugurejo Semarang', '0856-9876-5432', '6285698765432', 'Kota Semarang', 'medis', 'Medis (Dokter)', '["JANTUNG"]', 35000.00, 'bukti_mandiri_rina.pdf', 'valid', '2026-08-03 10:50:00'),
('REG-101-003', '2026-08-03 11:45:00', 'Ns. Ahmad Subagyo, S.Kep', 'ahmad.subagyo@roemani.or.id', '3374051804910004', 'RS Roemani Muhammadiyah', '0813-9876-1234', '6281398761234', 'Kota Semarang', 'perawat', 'Perawat / Nakes Lainnya', '["NEUROSAINS"]', 25000.00, 'transfer_ahmad_subagyo.png', 'pending', NULL);
