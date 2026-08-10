import React, { useState, useEffect } from 'react';
import { RegistrationRecord } from '../types';
import { getRegistrations, fetchRegistrationsFromDB } from '../data/registrationStore';
import { InvoiceModal } from './InvoiceModal';
import { 
  Search, X, CheckCircle2, Clock, GraduationCap, ShieldCheck, Printer, 
  FileText, ExternalLink, MessageSquare, AlertCircle, RefreshCw, Award, CheckSquare 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PublicStatusCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialNik?: string;
}

export const PublicStatusCheckModal: React.FC<PublicStatusCheckModalProps> = ({
  isOpen,
  onClose,
  initialNik = ''
}) => {
  const [searchNik, setSearchNik] = useState(initialNik);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [foundRecord, setFoundRecord] = useState<RegistrationRecord | null>(null);
  const [selectedInvoiceRecord, setSelectedInvoiceRecord] = useState<RegistrationRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (initialNik) {
      setSearchNik(initialNik);
      handleSearchByNik(initialNik);
    }
  }, [initialNik]);

  const handleSearchByNik = async (nikToSearch?: string) => {
    const targetNik = (nikToSearch !== undefined ? nikToSearch : searchNik).trim().replace(/\D/g, '');
    
    if (!targetNik) {
      setErrorMessage('Mohon masukkan 16 Digit NIK KTP Anda.');
      return;
    }

    if (targetNik.length !== 16) {
      setErrorMessage(`⚠️ NIK KTP harus terdiri dari 16 digit angka. (Saat ini: ${targetNik.length} digit).`);
      return;
    }

    setErrorMessage('');
    setIsSearching(true);
    setSearchPerformed(true);

    try {
      // 1. Check in-memory / local storage cache
      const localData = getRegistrations();
      let match = localData.find(r => r.nikKtp.replace(/\D/g, '') === targetNik);

      // 2. Fetch fresh live data from Supabase DB to ensure up-to-the-second status
      const liveData = await fetchRegistrationsFromDB();
      if (Array.isArray(liveData) && liveData.length > 0) {
        const liveMatch = liveData.find(r => r.nikKtp.replace(/\D/g, '') === targetNik);
        if (liveMatch) {
          match = liveMatch;
        }
      }

      setFoundRecord(match || null);
    } catch (err) {
      console.error('Failed to search status by NIK:', err);
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen) return null;

  const isPending = foundRecord?.status === 'pending';
  const isValid = foundRecord?.status === 'valid';
  const isApprovedDiklat = foundRecord?.status === 'approved_diklat';
  const isRejected = foundRecord?.status === 'rejected';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-slate-900/80 backdrop-blur-sm">
        
        {/* Backdrop Click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-200 my-auto max-h-[92vh] flex flex-col"
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 text-white p-4 sm:p-6 relative shrink-0 border-b border-cyan-800">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Portal Mandiri Peserta (Tanpa Login)</span>
            </div>

            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight pr-8">
              Cek Status Pendaftaran & Unduh Invoice
            </h2>
            <p className="text-xs text-slate-300 font-medium mt-1">
              Masukkan 16 digit NIK KTP Anda untuk melihat garis waktu status verifikasi & mencetak kuitansi resmi PPNI.
            </p>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-slate-800 space-y-6">
            
            {/* Search Box Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchByNik();
              }}
              className="space-y-3"
            >
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Cari Berdasarkan NIK KTP (16 Digit):
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="Masukkan 16 digit NIK KTP pendaftaran Anda..."
                    value={searchNik}
                    onChange={(e) => setSearchNik(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 font-mono font-bold text-sm text-slate-900 transition-all"
                  />
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                </div>

                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full sm:w-auto px-6 py-3 bg-cyan-700 hover:bg-cyan-800 active:bg-cyan-900 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shrink-0"
                >
                  {isSearching ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>MENCARI...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>CEK STATUS & INVOICE</span>
                    </>
                  )}
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </form>

            {/* Search Results Display */}
            {searchPerformed && (
              <div className="space-y-5 animate-fadeIn">
                {!foundRecord ? (
                  /* Not Found State */
                  <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h4 className="font-extrabold text-base text-slate-900">
                      Data Pendaftaran Tidak Ditemukan
                    </h4>
                    <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                      NIK KTP <span className="font-mono font-bold text-slate-900">{searchNik}</span> belum terdaftar di sistem. Mohon periksa kembali digit NIK KTP Anda atau lakukan pendaftaran terlebih dahulu.
                    </p>
                  </div>
                ) : (
                  /* Found Record Detail & Live Timeline */
                  <div className="space-y-6">
                    
                    {/* Participant Summary Header Card */}
                    <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-3xl space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-800 block">
                            HASIL PENCARIAN DATA PESERTA:
                          </span>
                          <h3 className="text-lg font-black text-slate-900">{foundRecord.fullName}</h3>
                          <p className="text-xs text-slate-500 font-medium">
                            {foundRecord.installation} ({foundRecord.city})
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">ID REGISTRASI:</span>
                          <span className="font-mono font-black text-cyan-900 text-sm">{foundRecord.id}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <p><span className="text-slate-500 font-semibold">NIK KTP:</span> <span className="font-mono font-bold text-slate-900">{foundRecord.nikKtp}</span></p>
                        <p><span className="text-slate-500 font-semibold">Kategori Tarif:</span> <span className="font-bold text-slate-900">{foundRecord.categoryName}</span></p>
                        <p><span className="text-slate-500 font-semibold">Seri Webinar:</span> <span className="font-bold text-slate-900">{foundRecord.series.join(', ')}</span></p>
                        <p><span className="text-slate-500 font-semibold">Total Nominal:</span> <span className="font-mono font-black text-emerald-700">Rp {foundRecord.totalAmount.toLocaleString('id-ID')}</span></p>
                      </div>
                    </div>

                    {/* LIVE MULTI-STAGE STATUS TIMELINE */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-700" />
                        <span>Garis Waktu (Timeline) Status Pendaftaran:</span>
                      </h4>

                      <div className="space-y-3 relative before:absolute before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                        
                        {/* TAHAP 1: Terkirim & Menunggu Verifikasi Admin */}
                        <div className={`relative pl-10 transition-all ${
                          isPending || isValid || isApprovedDiklat ? 'opacity-100' : 'opacity-40'
                        }`}>
                          <div className={`absolute left-0 top-0.5 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-sm z-10 ${
                            isValid || isApprovedDiklat
                              ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                              : isPending
                              ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                              : 'bg-slate-200 text-slate-500'
                          }`}>
                            {isValid || isApprovedDiklat ? '✓' : '1'}
                          </div>

                          <div className={`p-3.5 rounded-2xl border ${
                            isPending 
                              ? 'bg-amber-50/90 border-amber-300 text-amber-950 ring-1 ring-amber-200' 
                              : isValid || isApprovedDiklat
                              ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}>
                            <div className="flex items-center justify-between gap-2">
                              <h5 className="font-extrabold text-xs sm:text-sm">
                                1. Pendaftaran Terkirim & Menunggu Verifikasi Admin
                              </h5>
                              {isPending && (
                                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-200 text-amber-900 rounded-full shrink-0">
                                  SEDANG DIVERIFIKASI
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                              {isPending 
                                ? 'Pendaftaran & bukti transfer Anda telah tersimpan di database. Tim Admin sedang memverifikasi nominal & kecocokan data Anda.'
                                : 'Data pendaftaran & bukti transfer awal telah berhasil diterima di database.'}
                            </p>
                          </div>
                        </div>

                        {/* TAHAP 2: Pembayaran Terverifikasi LUNAS */}
                        <div className={`relative pl-10 transition-all ${
                          isValid || isApprovedDiklat ? 'opacity-100' : 'opacity-50'
                        }`}>
                          <div className={`absolute left-0 top-0.5 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-sm z-10 ${
                            isValid || isApprovedDiklat
                              ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                              : 'bg-slate-200 text-slate-500'
                          }`}>
                            {isValid || isApprovedDiklat ? '✓' : '2'}
                          </div>

                          <div className={`p-3.5 rounded-2xl border ${
                            isValid
                              ? 'bg-emerald-50/90 border-emerald-300 text-slate-900 ring-1 ring-emerald-300'
                              : isApprovedDiklat
                              ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                              : 'bg-slate-50 border-slate-200 text-slate-500'
                          }`}>
                            <div className="flex items-center justify-between gap-2">
                              <h5 className="font-extrabold text-xs sm:text-sm">
                                2. Pembayaran Terverifikasi LUNAS (Valid)
                              </h5>
                              {(isValid || isApprovedDiklat) && (
                                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-600 text-white rounded-full shrink-0">
                                  LUNAS / VERIFIED
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                              {(isValid || isApprovedDiklat)
                                ? 'Pembayaran Anda telah dinyatakan LUNAS oleh Tim Admin DPK PPNI. Anda kini dapat mencetak Invoice resmi dan bergabung ke grup WhatsApp.'
                                : 'Menunggu verifikasi pembayaran selesai dari Tim Admin.'}
                            </p>
                          </div>
                        </div>

                        {/* TAHAP 3: Diproses di Plataran Sehat & Diklat ACC */}
                        <div className={`relative pl-10 transition-all ${
                          isApprovedDiklat ? 'opacity-100' : 'opacity-50'
                        }`}>
                          <div className={`absolute left-0 top-0.5 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-sm z-10 ${
                            isApprovedDiklat
                              ? 'bg-indigo-700 text-white ring-4 ring-indigo-100'
                              : 'bg-slate-200 text-slate-500'
                          }`}>
                            {isApprovedDiklat ? '🎓' : '3'}
                          </div>

                          <div className={`p-3.5 rounded-2xl border ${
                            isApprovedDiklat
                              ? 'bg-indigo-50/90 border-indigo-300 text-indigo-950 ring-1 ring-indigo-300'
                              : 'bg-slate-50 border-slate-200 text-slate-500'
                          }`}>
                            <div className="flex items-center justify-between gap-2">
                              <h5 className="font-extrabold text-xs sm:text-sm">
                                3. Diproses di Plataran Sehat & Diklat ACC
                              </h5>
                              {isApprovedDiklat && (
                                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-indigo-700 text-white rounded-full shrink-0">
                                  PROSES PLATARAN SEHAT 🎓
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                              {isApprovedDiklat
                                ? 'Seri webinar Anda telah disetujui Tim Diklat RSUP Dr. Kariadi dan sedang dalam proses penginputan SKP di portal Plataran Sehat Kemenkes RI.'
                                : 'Tahap akhir pelaporan SKP Kemenkes RI setelah acara berlangsung.'}
                            </p>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* ACTION BOX: CETAK INVOICE MANDIRI & WA GROUPS */}
                    {(isValid || isApprovedDiklat) ? (
                      <div className="p-4 sm:p-5 bg-emerald-50/90 border border-emerald-300 rounded-3xl space-y-4 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Printer className="w-5 h-5 text-emerald-700" />
                            <h4 className="font-black text-sm text-slate-900">
                              Cetak Bukti Invoice Pembayaran Mandiri
                            </h4>
                          </div>
                          <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-2.5 py-1 rounded-full">
                            SIAP DICETAK
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                          Pembayaran Anda telah diverifikasi LUNAS oleh Bendahara DPK PPNI RSUP Dr. Kariadi Semarang (Sumarsih, S.Kep, Ners). Silakan klik tombol di bawah untuk mencetak atau mengunduh invoice resmi.
                        </p>

                        <button
                          type="button"
                          onClick={() => setSelectedInvoiceRecord(foundRecord)}
                          className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                          <span>CETAK / DOWNLOAD INVOICE RESMI PPNI 📄</span>
                        </button>
                      </div>
                    ) : isPending ? (
                      <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-2 text-xs text-amber-950 font-medium">
                        <div className="flex items-center gap-2 font-bold text-amber-900">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span>Invoice Belum Aktif (Dalam Proses Verifikasi Admin)</span>
                        </div>
                        <p className="text-slate-700">
                          Invoice resmi ber-tanda tangan Bendahara DPK PPNI akan **otomatis aktif** dan dapat dicetak mandiri di halaman ini begitu Tim Admin selesai memverifikasi pembayaran Anda.
                        </p>
                      </div>
                    ) : isRejected ? (
                      <div className="p-4 bg-red-50 border border-red-300 rounded-2xl space-y-2 text-xs text-red-950 font-medium">
                        <div className="flex items-center gap-2 font-bold text-red-900">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span>Bukti Transfer Perlu Konfirmasi Ulang</span>
                        </div>
                        <p className="text-slate-700">
                          Bukti transfer Anda belum dapat disetujui. Silakan hubungi Tim Admin via WhatsApp untuk melakukan penyesuaian data atau mengunggah ulang bukti pembayaran.
                        </p>
                      </div>
                    ) : null}

                  </div>
                )}
              </div>
            )}

          </div>

          {/* Modal Footer */}
          <div className="bg-slate-100 border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
              DPK PPNI RSUP Dr. Kariadi Semarang © 2026
            </span>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
            >
              Tutup
            </button>
          </div>

        </motion.div>
      </div>

      {/* POPUP INVOICE MODAL FOR SELF PRINT */}
      {selectedInvoiceRecord && (
        <InvoiceModal
          record={selectedInvoiceRecord}
          onClose={() => setSelectedInvoiceRecord(null)}
        />
      )}
    </AnimatePresence>
  );
};
