import { WebinarSeries, PricingCategory, RegistrationStep, FaqItem, ContactPerson } from '../types';

export interface MaintenanceConfig {
  isClosed: boolean;
  reopenTime: string;
  title: string;
  message: string;
}

export const DEFAULT_MAINTENANCE_CONFIG: MaintenanceConfig = {
  isClosed: false, // REGISTRATION NOW OPEN BY DEFAULT!
  reopenTime: 'Hari Ini, Pukul 18.00 WIB',
  title: 'Pendaftaran Ditutup Sementara',
  message: 'Mohon maaf atas ketidaknyamanannya. Saat ini sistem pendaftaran webinar sedang dalam pemeliharaan teknis. Pendaftaran akan dibuka kembali sesuai jadwal.'
};

export const getMaintenanceConfig = (): MaintenanceConfig => {
  try {
    const saved = localStorage.getItem('ppni_webinar_maintenance_config_v1');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {}
  return DEFAULT_MAINTENANCE_CONFIG;
};

export const saveMaintenanceConfig = (config: MaintenanceConfig): MaintenanceConfig => {
  try {
    localStorage.setItem('ppni_webinar_maintenance_config_v1', JSON.stringify(config));
  } catch (e) {}
  return config;
};

export const MAINTENANCE_CONFIG = getMaintenanceConfig();

export const CONTACT_PERSONS_UMUM: ContactPerson[] = [
  {
    name: 'Bu Venti',
    phone: '0812-2557-772',
    cleanPhone: '628122557772',
    role: 'Kementerian Kesehatan / Penyelenggara',
    category: 'Umum'
  },
  {
    name: 'Pak Heru',
    phone: '0813-9085-5571',
    cleanPhone: '628139085571',
    role: 'Kementerian Kesehatan / Penyelenggara',
    category: 'Umum'
  }
];

export const CONTACT_PERSONS_KHUSUS: ContactPerson[] = [
  {
    name: 'Mba Yanti',
    phone: '0858-0079-1993',
    cleanPhone: '6285800791993',
    topic: 'Onkologi',
    category: 'Khusus'
  },
  {
    name: 'Mba Anis',
    phone: '0823-4110-6296',
    cleanPhone: '6282341106296',
    topic: 'Jantung',
    category: 'Khusus'
  },
  {
    name: 'Mba Pratiwi Tandu',
    phone: '0895-6560-84',
    cleanPhone: '62895656084',
    topic: 'Stroke / Neurosains',
    category: 'Khusus'
  },
  {
    name: 'Mba Ariyatun',
    phone: '0812-2894-4446',
    cleanPhone: '6281228944446',
    topic: 'Uronefro',
    category: 'Khusus'
  }
];

export const CONTACT_PERSONS: ContactPerson[] = [
  ...CONTACT_PERSONS_UMUM,
  ...CONTACT_PERSONS_KHUSUS
];

export const WEBINAR_SERIES_DATA: WebinarSeries[] = [
  {
    id: 1,
    seriesNumber: 'SERI 1',
    badgeColor: 'teal',
    title: 'ONKOLOGI',
    fullTitle: 'Sinergi Interprofesi dalam Membangun Layanan Transplantasi Sumsum Tulang yang Aman, Terintegrasi, dan Berkelanjutan',
    date: '24 AGUSTUS 2026',
    day: 'SENIN',
    time: '08.00 – 14.00 WIB',
    description: 'Sinergi Interprofesi dalam Membangun Layanan Transplantasi Sumsum Tulang yang Aman, Terintegrasi, dan Berkelanjutan',
    speakersCount: 4,
    moderatorsCount: 1,
    contactPerson: CONTACT_PERSONS_KHUSUS[0],
    speakers: [
      { name: 'dr. Eko Adhi Pangarsa, Sp.PD-KHOM', role: 'Konsultan Hematologi Onkologi Medik', institution: 'RSUP Dr. Kariadi' },
      { name: 'dr. Muchlis, Sp.A(K)', role: 'Konsultan Hematologi Onkologi Anak', institution: 'RSUP Dr. Kariadi' },
      { name: 'Ns. Sri Mulyani, S.Kep, M.Kep', role: 'Perawat Spesialis Onkologi', institution: 'RSUP Dr. Kariadi' },
      { name: 'apt. Rina Rahmawati, S.Farm, M.Sc', role: 'Apoteker Kanker & Transpantasi', institution: 'RSUP Dr. Kariadi' },
    ],
    moderators: [
      { name: 'dr. Agnes Listya, Sp.PD', role: 'Dokter Spesialis Penyakit Dalam', institution: 'RSUP Dr. Kariadi' }
    ],
    agenda: [
      { time: '08.00 - 08.30', topic: 'Pembukaan & Keynote Speech Layanan Transplantasi Organ/Jaringan', speaker: 'Direktur Utama RSUP Dr. Kariadi' },
      { time: '08.30 - 09.45', topic: 'Indikasi dan Preparasi Pasien Transplantasi Sumsum Tulang', speaker: 'dr. Eko Adhi Pangarsa, Sp.PD-KHOM' },
      { time: '09.45 - 11.00', topic: 'Penatalaksanaan Komplikasi Graft Versus Host Disease (GVHD)', speaker: 'dr. Muchlis, Sp.A(K)' },
      { time: '11.00 - 12.15', topic: 'Manajemen Keperawatan Khusus Pasien Stem Cell Transplant', speaker: 'Ns. Sri Mulyani, S.Kep, M.Kep' },
      { time: '12.15 - 13.30', topic: 'Manajemen Farmakoterapi Imunosupresan Pasca Transplantasi', speaker: 'apt. Rina Rahmawati, S.Farm, M.Sc' },
      { time: '13.30 - 14.00', topic: 'Diskusi Interaktif & Tanya Jawab', speaker: 'Semua Pembicara & Moderator' }
    ]
  },
  {
    id: 2,
    seriesNumber: 'SERI 2',
    badgeColor: 'olive',
    title: 'JANTUNG',
    fullTitle: 'Beyond the Bypass: Strategi Terintegrasi dalam Optimalisasi Tata Laksana Pasien CABG Menuju Luaran Klinis Terbaik',
    date: '25 AGUSTUS 2026',
    day: 'SELASA',
    time: '08.00 – 14.00 WIB',
    description: 'Beyond the Bypass: Strategi Terintegrasi dalam Optimalisasi Tata Laksana Pasien CABG Menuju Luaran Klinis Terbaik',
    speakersCount: 4,
    moderatorsCount: 1,
    contactPerson: CONTACT_PERSONS_KHUSUS[1],
    speakers: [
      { name: 'dr. Aditya Rahman', role: 'Konsultan Bedah Toraks Kardiovaskular', institution: 'RSUP Dr. Kariadi' },
      { name: 'dr. Pipin Ardhianto, Sp.JP(K), FIHA', role: 'Konsultan Kardiologi & Pembuluh Darah', institution: 'RSUP Dr. Kariadi' },
      { name: 'Ns. Budi Santoso, S.Kep, M.Kep, Sp.KVP', role: 'Perawat Spesialis Kardiovaskular', institution: 'RSUP Dr. Kariadi' },
      { name: 'dr. Wahyu Hidayat, Sp.KFR(K)', role: 'Konsultan Rehabilitasi Medik Jantung', institution: 'RSUP Dr. Kariadi' },
    ],
    moderators: [
      { name: 'dr. Maya Puspita, Sp.JP', role: 'Dokter Spesialis Jantung', institution: 'RSUP Dr. Kariadi' }
    ],
    agenda: [
      { time: '08.00 - 08.30', topic: 'Pengantar: Perkembangan Layanan Bedah Jantung Terpadu', speaker: 'Tim Kardiovaskular RSUP Dr. Kariadi' },
      { time: '08.30 - 09.45', topic: 'Teknik Terkini CABG Off-Pump dan On-Pump Minimally Invasive', speaker: 'dr. Aditya Rahman' },
      { time: '09.45 - 11.00', topic: 'Optimalisasi Terapi Medikamentosa Pasca Operasi Bypass', speaker: 'dr. Pipin Ardhianto, Sp.JP(K), FIHA' },
      { time: '11.00 - 12.15', topic: 'Perawatan Intensif CVICU & Early Mobilization Pasca CABG', speaker: 'Ns. Budi Santoso, S.Kep, M.Kep, Sp.KVP' },
      { time: '12.15 - 13.30', topic: 'Program Rehabilitasi Jantung Fase I & II untuk Ketahanan Klinis', speaker: 'dr. Wahyu Hidayat, Sp.KFR(K)' },
      { time: '13.30 - 14.00', topic: 'Sesi Q&A dan Diskusi Kasus', speaker: 'Semua Panelis' }
    ]
  },
  {
    id: 3,
    seriesNumber: 'SERI 3',
    badgeColor: 'teal',
    title: 'NEUROSAINS',
    fullTitle: 'Akselerasi Revaskularisasi Pasien Stroke, Efisiensi Length of Stay (LoS), dan Peningkatan Kualitas Hidup Secara Komprehensif: Zero Delay and Zero Complication',
    date: '26 AGUSTUS 2026',
    day: 'RABU',
    time: '08.00 – 14.00 WIB',
    description: 'Akselerasi Revaskularisasi Pasien Stroke, Efisiensi Length of Stay (LoS), dan Peningkatan Kualitas Hidup Secara Komprehensif: Zero Delay and Zero Complication',
    speakersCount: 4,
    moderatorsCount: 1,
    contactPerson: CONTACT_PERSONS_KHUSUS[2],
    speakers: [
      { name: 'dr. Dodik Tugasworo, Sp.N(K)', role: 'Konsultan Neurologi & Stroke', institution: 'RSUP Dr. Kariadi' },
      { name: 'dr. Rahmi Ardhini, Sp.N(K)', role: 'Konsultan Neurointervensi', institution: 'RSUP Dr. Kariadi' },
      { name: 'Ns. Tri Wulandari, S.Kep, Sp.KMB', role: 'Perawat Spesialis Neuro-Vaskular', institution: 'RSUP Dr. Kariadi' },
      { name: 'dr. Retno Setianingrum, Sp.KFR(K)', role: 'Konsultan Neuro-Rehabilitasi', institution: 'RSUP Dr. Kariadi' },
    ],
    moderators: [
      { name: 'dr. Dwi Lestari, Sp.N', role: 'Dokter Spesialis Saraf', institution: 'RSUP Dr. Kariadi' }
    ],
    agenda: [
      { time: '08.00 - 08.30', topic: 'Akselerasi Code Stroke: Protokol Zero Delay di Rumah Sakit Rujukan', speaker: 'dr. Dodik Tugasworo, Sp.N(K)' },
      { time: '08.30 - 09.45', topic: 'Trombektomi Mekanik & Trombolisis Intravena pada Stroke Iskemik Akut', speaker: 'dr. Rahmi Ardhini, Sp.N(K)' },
      { time: '09.45 - 11.00', topic: 'Monitoring Komprehensif di Stroke Unit untuk Mencegah Sekuele', speaker: 'Ns. Tri Wulandari, S.Kep, Sp.KMB' },
      { time: '11.00 - 12.15', topic: 'Intervensi Dini Fisioterapi & Terapi Wicara Pasca Stroke', speaker: 'dr. Retno Setianingrum, Sp.KFR(K)' },
      { time: '12.15 - 13.30', topic: 'Strategi Efisiensi Length of Stay (LoS) tanpa Mengorbankan Safety', speaker: 'Tim Neuro-Vaskular RSUP Dr. Kariadi' },
      { time: '13.30 - 14.00', topic: 'Sesi Diskusi & Pemaparan Studi Kasus', speaker: 'Narasumber & Moderator' }
    ]
  },
  {
    id: 4,
    seriesNumber: 'SERI 4',
    badgeColor: 'olive',
    title: 'URONEFRO',
    fullTitle: 'Safe The Kidney, Safe The Life: Strategi Keperawatan Komprehensif Pasien Transplantasi Ginjal',
    date: '27 AGUSTUS 2026',
    day: 'KAMIS',
    time: '08.00 – 14.00 WIB',
    description: 'Safe The Kidney, Safe The Life: Strategi Keperawatan Komprehensif Pasien Transplantasi Ginjal',
    speakersCount: 5,
    moderatorsCount: 1,
    contactPerson: CONTACT_PERSONS_KHUSUS[3],
    speakers: [
      { name: 'dr. Zuhristiyan, Sp.PD-KGH', role: 'Konsultan Ginjal Hipertensi', institution: 'RSUP Dr. Kariadi' },
      { name: 'dr. Eriawan, Sp.U(K)', role: 'Konsultan Urologi Transplantasi', institution: 'RSUP Dr. Kariadi' },
      { name: 'Ns. Suparno, S.Kep, M.Kep', role: 'Perawat Spesialis Nefrologi & Dialisis', institution: 'RSUP Dr. Kariadi' },
      { name: 'Ns. Dewi Astuti, M.Kep, Sp.Kep.MB', role: 'Perawat Periklinis Transplantasi Ginjal', institution: 'RSUP Dr. Kariadi' },
      { name: 'dr. Nurul Aini, M.Gizi, Sp.GK', role: 'Dokter Spesialis Gizi Klinik', institution: 'RSUP Dr. Kariadi' },
    ],
    moderators: [
      { name: 'dr. Aris Supriyadi, Sp.PD', role: 'Dokter Spesialis Penyakit Dalam', institution: 'RSUP Dr. Kariadi' }
    ],
    agenda: [
      { time: '08.00 - 08.30', topic: 'Overview Layanan Transplantasi Ginjal Unggulan RSUP Dr. Kariadi', speaker: 'Tim Uronefrologi RSUP Dr. Kariadi' },
      { time: '08.30 - 09.30', topic: 'Evaluasi Donor dan Resipien pada Transplantasi Ginjal', speaker: 'dr. Zuhristiyan, Sp.PD-KGH' },
      { time: '09.30 - 10.30', topic: 'Teknik Bedah Vaskular & Urologi Transplantasi Ginjal', speaker: 'dr. Eriawan, Sp.U(K)' },
      { time: '10.30 - 11.30', topic: 'Manajemen Keperawatan Perioperatif & Ruang Isolasi Khusus', speaker: 'Ns. Suparno, S.Kep, M.Kep' },
      { time: '11.30 - 12.30', topic: 'Edukasi Pasien Pasca Transplantasi & Kepatuhan Obat Imunosupresif', speaker: 'Ns. Dewi Astuti, M.Kep' },
      { time: '12.30 - 13.30', topic: 'Dukungan Nutrisi & Pola Makan Pasien Ginjal Kronis', speaker: 'dr. Nurul Aini, M.Gizi, Sp.GK' },
      { time: '13.30 - 14.00', topic: 'Tanya Jawab & Penutupan Parade Webinar', speaker: 'Panitia & Pembicara' }
    ]
  }
];

export const PRICING_CATEGORIES: PricingCategory[] = [
  {
    id: 'perawat_rsdk',
    role: 'Perawat RSDK',
    price: 'Rp 10.000,-',
    rawPrice: 10000,
    iconType: 'perawat_rsdk',
    badgeColor: 'teal',
    note: 'Khusus Perawat RSUP Dr. Kariadi Semarang'
  },
  {
    id: 'medis',
    role: 'Medis (Dokter)',
    price: 'Rp 35.000,-',
    rawPrice: 35000,
    iconType: 'medis',
    badgeColor: 'teal'
  },
  {
    id: 'perawat',
    role: 'Perawat / Nakes Lainnya',
    price: 'Rp 25.000,-',
    rawPrice: 25000,
    iconType: 'perawat',
    badgeColor: 'olive'
  },
  {
    id: 'mahasiswa',
    role: 'Mahasiswa / Umum',
    price: 'Rp 15.000,-',
    rawPrice: 15000,
    iconType: 'mahasiswa',
    badgeColor: 'teal'
  }
];

export const REGISTRATION_STEPS: RegistrationStep[] = [
  {
    number: 1,
    title: 'Transfer Pembayaran',
    description: 'Lakukan pembayaran melalui transfer ke rekening yang tersedia',
    iconName: 'CreditCard'
  },
  {
    number: 2,
    title: 'Simpan Bukti',
    description: 'Simpan bukti transfer Anda (foto/PDF)',
    iconName: 'UploadCloud'
  },
  {
    number: 3,
    title: 'Isi Formulir',
    description: 'Isi formulir pendaftaran online',
    iconName: 'FileText'
  },
  {
    number: 4,
    title: 'Konfirmasi Email',
    description: 'Cek email Anda untuk konfirmasi dan link Zoom',
    iconName: 'Mail'
  },
  {
    number: 5,
    title: 'Ikuti Webinar',
    description: 'Ikuti webinar dan dapatkan sertifikat JEP',
    iconName: 'Award'
  }
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 1,
    question: 'Apakah saya boleh mengikuti lebih dari satu webinar?',
    answer: 'Ya! Anda dapat mendaftar untuk lebih dari satu seri webinar atau mengikuti seluruh 4 seri webinar. Setiap seri webinar memiliki sertifikat JEP tersendiri yang diterbitkan sesuai kehadiran Anda.'
  },
  {
    id: 2,
    question: 'Apakah webinar ini akan direkam?',
    answer: 'Ya, seluruh jalannya webinar direkam secara profesional. Rekaman video dan berkas materi presentasi narasumber akan dibagikan kepada peserta yang telah terdaftar melalui email dan portal materi.'
  },
  {
    id: 3,
    question: 'Kapan link Zoom akan dikirimkan?',
    answer: 'Link akses Zoom Meeting dan petunjuk bergabung akan dikirimkan ke email terdaftar serta grup WhatsApp peserta paling lambat H-1 sebelum pelaksanaan acara.'
  },
  {
    id: 4,
    question: 'Apakah mahasiswa boleh mengikuti webinar ini?',
    answer: 'Sangat boleh! Mahasiswa dari berbagai disiplin ilmu kesehatan (Kedokteran, Keperawatan, Kebidanan, Farmasi, Gizi, dll) maupun masyarakat umum dapat mendaftar dengan tarif spesial Rp 15.000,- per seri.'
  },
  {
    id: 5,
    question: 'Bagaimana cara mendapatkan sertifikat JEP?',
    answer: 'Sertifikat JEP elektrik akan dikirimkan langsung ke alamat email Anda dalam waktu 3-5 hari kerja setelah Anda mengisi formulir presensi dan evaluasi di akhir sesi webinar.'
  },
  {
    id: 6,
    question: 'Bagaimana jika salah transfer?',
    answer: 'Apabila terjadi kekeliruan nominal transfer atau butuh konfirmasi bukti pembayaran, Anda dapat segera mengontak tim panitia narahubung melalui nomor WhatsApp yang tertera di bagian footer.'
  }
];

export const BANK_DETAILS = {
  bankName: 'Bank Mandiri',
  accountNumber: '1350014782302',
  accountName: 'DPK PPNI RS Kariadi Semarang',
};
