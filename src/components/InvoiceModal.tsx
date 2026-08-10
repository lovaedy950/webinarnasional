import React, { useRef } from 'react';
import { RegistrationRecord } from '../types';
import { numberToWordsIndonesian, getRomanMonth } from '../utils/numberToWords';
import { X, Printer, MessageSquare, CheckCircle2, ShieldCheck, Download, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import logoDpkpPpni from '../assets/images/logo_dpkp_ppni.png';
import logoKariadi from '../assets/images/Logo_RS_Kariadi_Resmi.png';
import logoPpni from '../assets/images/logo ppni.png';
import ttdBendahara from '../assets/images/ttd_bendahara_ppni.png';

interface InvoiceModalProps {
  record: RegistrationRecord | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  const isPaid = record.status === 'valid' || record.status === 'approved_diklat';
  const createdDate = new Date(record.createdAt || Date.now());
  const year = createdDate.getFullYear() || 2026;
  const monthRoman = getRomanMonth(createdDate.getMonth());

  // Generate official invoice number e.g. "2/DPK.PPNI/webinarnasional/VIII/2026"
  const cleanIdNum = record.id.replace(/\D/g, '') || '1';
  const invoiceNumber = `${cleanIdNum}/DPK.PPNI/webinarnasional/${monthRoman}/${year}`;

  const formattedDate = record.verifiedAt 
    ? record.verifiedAt 
    : new Date().toISOString().replace('T', ' ').slice(0, 10);

  const terbilangText = numberToWordsIndonesian(record.totalAmount);

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    const message = `Yth. Bapak/Ibu Peserta *${record.fullName}*,

Berikut adalah *INVOICE / BUKTI PEMBAYARAN RESMI* pendaftaran Webinar Nasional DPK PPNI RSUP Dr. Kariadi Semarang:

📄 *No. Invoice*: ${invoiceNumber}
👤 *Nama Peserta*: ${record.fullName}
🏢 *Instansi*: ${record.installation}
💳 *Kategori*: ${record.categoryName}
📚 *Seri Webinar*: ${record.series.join(', ')}
💰 *Total Terbayar*: Rp ${record.totalAmount.toLocaleString('id-ID')} (${terbilangText})
✅ *Status*: LUNAS / VERIFIED
📅 *Tanggal*: ${formattedDate}

Terima kasih atas partisipasi Anda. Bukti pembayaran ini diterbitkan secara sah oleh *Bendahara DPK PPNI RSUP Dr. Kariadi Semarang (Sumarsih, S.Kep, Ners)*.

Salam hangat,
Panitia Pelaksana Webinar Nasional`;

    const cleanPhone = record.cleanPhone || record.phone.replace(/\D/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <AnimatePresence>
      <div 
        id="printable-invoice-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-slate-900/80 backdrop-blur-sm print:p-0 print:bg-white print:static print:inset-auto"
      >
        
        {/* Backdrop Click (Disabled in Print) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 print:hidden"
        />

        {/* Modal Invoice Window */}
        <motion.div
          id="printable-invoice"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-200 my-auto max-h-[92vh] flex flex-col print:shadow-none print:border-none print:max-h-none print:w-full print:max-w-none print:my-0 print:rounded-none"
        >
          {/* Top Bar Action Controls (Hidden in Print) */}
          <div className="bg-slate-900 text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between shrink-0 print:hidden">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="font-extrabold text-xs sm:text-sm tracking-wide">
                Invoice & Kuitansi Resmi Pembayaran
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {isPaid && (
                <>
                  <button
                    onClick={handleSendWhatsApp}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Kirim Invoice Ke WhatsApp Peserta"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">Kirim WA</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Cetak Cetakan PDF / Print"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak / PDF</span>
                  </button>
                </>
              )}

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Invoice Container */}
          <div className="p-6 sm:p-10 overflow-y-auto flex-1 text-slate-800 space-y-6 print:p-6 print:overflow-visible print:text-black">
            
            {/* Header Logos & Title Kop DPK PPNI */}
            <div className="border-b-2 border-slate-900 pb-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={logoDpkpPpni} 
                    alt="Logo DPKP PPNI" 
                    className="h-16 sm:h-20 w-auto object-contain shrink-0" 
                  />
                </div>
                
                <div className="text-center flex-1 px-2">
                  <h3 className="text-xs sm:text-sm font-black uppercase text-slate-900 tracking-wider">
                    PERSATUAN PERAWAT NASIONAL INDONESIA (PPNI)
                  </h3>
                  <h2 className="text-sm sm:text-base font-extrabold text-cyan-900">
                    DEWAN PENGURUS KOMISARIAT (DPK) RSUP DR. KARIADI
                  </h2>
                  <p className="text-[10px] sm:text-xs text-slate-600 mt-0.5">
                    Jl. Dr. Sutomo No. 16, Randusari, Semarang | Telp: (024) 8413476
                  </p>
                  <p className="text-[10px] font-mono text-emerald-800 font-bold mt-0.5">
                    Panitia Pelaksana Parade Webinar Nasional 2026
                  </p>
                </div>

                <div className="shrink-0">
                  <img 
                    src={logoKariadi} 
                    alt="Logo RSUP Dr Kariadi" 
                    className="h-14 sm:h-18 w-auto object-contain" 
                  />
                </div>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-4 rounded-2xl print:bg-white print:border-slate-300">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-800 block">
                  BUKTI PEMBAYARAN RESMI / INVOICE
                </span>
                <h1 className="text-base sm:text-lg font-mono font-black text-slate-900">
                  No: {invoiceNumber}
                </h1>
              </div>

              <div className="text-left sm:text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-black rounded-full border border-emerald-300 print:border-emerald-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>STATUS: LUNAS / VERIFIED</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  Tanggal Verifikasi: <span className="font-bold text-slate-800">{formattedDate}</span>
                </p>
              </div>
            </div>

            {/* Billed To / Data Peserta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-1.5 print:bg-white">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  DITERBITKAN UNTUK (PESERTA):
                </span>
                <p className="font-extrabold text-sm text-slate-900">{record.fullName}</p>
                <p><span className="text-slate-500 font-semibold">NIK KTP:</span> <span className="font-mono font-bold">{record.nikKtp}</span></p>
                <p><span className="text-slate-500 font-semibold">Email (LMS):</span> {record.email}</p>
                <p><span className="text-slate-500 font-semibold">Instansi:</span> {record.installation}</p>
              </div>

              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-1.5 print:bg-white">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  RINCIAN PENDAFTARAN:
                </span>
                <p><span className="text-slate-500 font-semibold">ID Registrasi:</span> <span className="font-mono font-bold text-cyan-900">{record.id}</span></p>
                <p><span className="text-slate-500 font-semibold">No. WhatsApp:</span> {record.phone}</p>
                <p><span className="text-slate-500 font-semibold">Kategori Tarif:</span> <span className="font-bold text-slate-900">{record.categoryName}</span></p>
                <p><span className="text-slate-500 font-semibold">Kota / Domisili:</span> {record.city}</p>
              </div>
            </div>

            {/* Table Line Items */}
            <div className="border border-slate-300 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-extrabold">
                    <th className="py-2.5 px-3 border-b border-slate-800">No</th>
                    <th className="py-2.5 px-4 border-b border-slate-800">Deskripsi Item / Seri Webinar</th>
                    <th className="py-2.5 px-4 border-b border-slate-800 text-center">Status</th>
                    <th className="py-2.5 px-4 border-b border-slate-800 text-right">Jumlah (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {record.series.map((seri, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-bold text-slate-500 text-center">{idx + 1}</td>
                      <td className="py-2.5 px-4">
                        <span className="font-bold text-slate-900 block">Webinar Nasional Seri {seri}</span>
                        <span className="text-[10px] text-slate-500">Parade Webinar DPK PPNI RSUP Dr. Kariadi Semarang</span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-100 text-emerald-800 rounded-md">
                          LUNAS
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-700">
                        Included
                      </td>
                    </tr>
                  ))}
                  
                  {/* Total Line */}
                  <tr className="bg-slate-100/80 font-bold print:bg-slate-100">
                    <td colSpan={3} className="py-3 px-4 text-right font-extrabold text-slate-900 text-sm">
                      TOTAL NOMINAL TERBAYAR:
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-base font-black text-emerald-700">
                      Rp {record.totalAmount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Terbilang Box */}
            <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-xl text-xs space-y-1 print:bg-white print:border-slate-300">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 block">
                TERBILANG:
              </span>
              <p className="font-serif italic font-extrabold text-sm text-emerald-950">
                "{terbilangText}"
              </p>
            </div>

            {/* Footer Signature & Stamp Block */}
            <div className="pt-4 grid grid-cols-2 gap-6 items-end">
              <div className="text-[10px] text-slate-500 space-y-1">
                <p className="font-bold text-slate-700">Catatan Keabsahan Dokumen:</p>
                <p>1. Bukti pembayaran ini diterbitkan secara resmi oleh DPK PPNI RSUP Dr. Kariadi Semarang.</p>
                <p>2. Kuitansi ini sah sebagai bukti pembayaran yang valid untuk verifikasi sertifikat & akses Zoom webinar.</p>
              </div>

              {/* Signature Block Bendahara DPK PPNI */}
              <div className="text-center flex flex-col items-center justify-end">
                <p className="text-xs font-semibold text-slate-700">
                  Semarang, {formattedDate}
                </p>
                <p className="text-xs font-extrabold text-slate-900 mt-0.5">
                  Bendahara DPK PPNI RSUP Dr. Kariadi,
                </p>

                {/* Stempel & Tanda Tangan Image */}
                <div className="my-1 relative w-56 h-28 flex items-center justify-center">
                  <img 
                    src={ttdBendahara} 
                    alt="Tanda Tangan & Stempel Bendahara DPK PPNI" 
                    className="max-h-28 w-auto object-contain mix-blend-multiply filter contrast-125 hover:scale-105 transition-transform"
                  />
                </div>

                <div className="space-y-0.5">
                  <p className="font-black text-xs text-slate-900 underline decoration-slate-900 decoration-1 underline-offset-2">
                    Sumarsih, S.Kep, Ners
                  </p>
                  <p className="font-mono text-[11px] font-extrabold text-slate-700">
                    NIRA. 33740053915
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Action Footer (Hidden in Print) */}
          <div className="bg-slate-100 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Invoice Terverifikasi & SIAP DICETAK / DIKIRIM</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
              >
                Tutup
              </button>

              {isPaid && (
                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full sm:w-auto px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Dokumen (Print/PDF)</span>
                </button>
              )}
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
