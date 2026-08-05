export interface ContactPerson {
  name: string;
  phone: string;
  cleanPhone: string;
  role?: string;
  category?: 'Umum' | 'Khusus';
  topic?: string;
}

export interface Speaker {
  name: string;
  role: string;
  institution?: string;
  avatar?: string;
}

export interface WebinarSeries {
  id: number;
  seriesNumber: string; // e.g. "SERI 1"
  badgeColor: 'teal' | 'olive';
  title: string; // e.g. "ONKOLOGI"
  fullTitle: string;
  date: string; // e.g. "24 AGUSTUS 2026"
  day: string; // e.g. "SENIN"
  time: string; // e.g. "08.00 – 14.00 WIB"
  description: string;
  speakersCount: number;
  moderatorsCount: number;
  speakers: Speaker[];
  moderators: Speaker[];
  contactPerson?: ContactPerson;
  agenda: {
    time: string;
    topic: string;
    speaker: string;
  }[];
}

export interface PricingCategory {
  id: string;
  role: string;
  price: string;
  rawPrice: number;
  iconType: 'medis' | 'perawat' | 'mahasiswa' | 'perawat_rsdk';
  badgeColor: 'teal' | 'olive';
  note?: string;
}

export interface RegistrationStep {
  number: number;
  title: string;
  description: string;
  iconName: string;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export interface RegistrationFormData {
  fullName: string; // Nama lengkap (Sesuai LMS)
  email: string; // alamat email (Sesuai LMS)
  nikKtp: string; // No KTP / NIK KTP
  installation: string; // Asal Instalansi Peserta
  phone: string; // No. Hp Peserta
  city: string; // Kab/Kota
  category: string;
  series: string[];
  paymentProofName?: string;
}

export interface RegistrationRecord {
  id: string;
  createdAt: string;
  fullName: string;
  email: string;
  nikKtp: string;
  installation: string;
  phone: string;
  cleanPhone: string;
  city: string;
  categoryId: string;
  categoryName: string;
  series: string[];
  totalAmount: number;
  paymentProofName?: string;
  paymentProofUrl?: string;
  status: 'pending' | 'valid' | 'rejected';
  verifiedAt?: string;
  notes?: string;
}
