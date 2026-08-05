import React, { useState } from 'react';
import { PRICING_CATEGORIES, BANK_DETAILS, WEBINAR_SERIES_DATA, getMaintenanceConfig } from '../data/webinarData';
import { saveRegistration } from '../data/registrationStore';
import { X, CheckCircle2, Copy, UploadCloud, AlertCircle, ArrowRight, ShieldCheck, CreditCard, Building2, User, Mail, Phone, MapPin, FileText, ArrowLeft, RefreshCw, AlertTriangle, Clock, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedSeriesTitle?: string;
  onCopyAccount: () => void;
  onSuccessToast: (msg: string) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  preselectedSeriesTitle,
  onCopyAccount,
  onSuccessToast,
}) => {
  // Step: 1 = Input Form Data, 2 = Payment & Upload Bukti Transfer, 3 = Completed
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Exact 6 Required Form Fields
  const [fullName, setFullName] = useState(''); // Nama lengkap (Sesuai LMS)
  const [email, setEmail] = useState(''); // alamat email (Sesuai LMS)
  const [nikKtp, setNikKtp] = useState(''); // No KTP.NIK KTP
  const [installation, setInstallation] = useState(''); // Asal Instalansi Peserta
  const [phone, setPhone] = useState(''); // No. Hp Peserta
  const [city, setCity] = useState(''); // Kab/Kota

  const [selectedCategory, setSelectedCategory] = useState<string>('perawat_rsdk');
  const [showRsdkConfirmModal, setShowRsdkConfirmModal] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<string[]>(
    preselectedSeriesTitle ? [preselectedSeriesTitle] : ['ONKOLOGI']
  );
  const [fileName, setFileName] = useState<string>('');
  const [proofUrl, setProofUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentConfig = getMaintenanceConfig();

  // Maintenance / Closed Registration Notice View
  if (currentConfig.isClosed) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-900/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-200 my-auto flex flex-col text-center"
          >
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white p-6 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center mx-auto mb-3 border border-white/20 shadow-lg">
                <Wrench className="w-8 h-8 text-amber-200 animate-bounce" />
              </div>

              <span className="inline-block px-3 py-1 bg-amber-950/50 text-amber-200 rounded-full text-xs font-black uppercase tracking-wider mb-2 border border-amber-400/30">
                ⚠️ PENDAFTARAN DITUTUP SEMENTARA
              </span>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {currentConfig.title}
              </h2>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-slate-800 text-xs sm:text-sm leading-relaxed font-bold">
                {currentConfig.message}
              </div>

              {/* Status Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-3 text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block font-bold uppercase">Waktu Akses Kembali:</span>
                    <span className="font-black text-amber-700 text-sm block">{currentConfig.reopenTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2.5 border-t border-slate-200">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block font-bold uppercase">Penyelenggara Resmi:</span>
                    <span className="font-bold text-slate-800 text-xs block">RSUP Dr. Kariadi & DPK PPNI RSUP Dr. Kariadi</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={onClose}
                className="w-full py-4 text-sm font-extrabold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-2xl shadow-lg transition-all cursor-pointer"
              >
                SAYA MENGERTI & TUTUP
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  const currentCat = PRICING_CATEGORIES.find((c) => c.id === selectedCategory) || PRICING_CATEGORIES[0];
  const totalAmount = currentCat.rawPrice * selectedSeries.length;

  const handleSeriesToggle = (title: string) => {
    if (selectedSeries.includes(title)) {
      if (selectedSeries.length > 1) {
        setSelectedSeries(selectedSeries.filter((t) => t !== title));
      }
    } else {
      setSelectedSeries([...selectedSeries, title]);
    }
  };

  const handleSelectAllSeries = () => {
    if (selectedSeries.length === WEBINAR_SERIES_DATA.length) {
      setSelectedSeries(['ONKOLOGI']);
    } else {
      setSelectedSeries(WEBINAR_SERIES_DATA.map((s) => s.title));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setErrorMsg('');

      const reader = new FileReader();
      reader.onloadend = () => {
        setProofUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Step 1 -> Step 2 Validation
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !nikKtp.trim() || !installation.trim() || !phone.trim() || !city.trim()) {
      setErrorMsg('Mohon lengkapi seluruh 6 kolom formulir wajib pendaftaran.');
      return;
    }

    // NIK KTP must be exactly 16 digits
    const cleanNik = nikKtp.replace(/\D/g, '');
    if (cleanNik.length !== 16) {
      setErrorMsg(`⚠️ No. KTP / NIK KTP harus terdiri dari tepat 16 digit angka. (Saat ini: ${cleanNik.length} digit).`);
      return;
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('⚠️ Format alamat email Anda tidak valid. Mohon periksa kembali.');
      return;
    }

    // Phone format check (min 10 digits)
    const cleanPhoneDigits = phone.replace(/\D/g, '');
    if (cleanPhoneDigits.length < 10) {
      setErrorMsg(`⚠️ Nomor HP / WhatsApp harus terdiri dari minimal 10 digit angka. (Saat ini: ${cleanPhoneDigits.length} digit).`);
      return;
    }

    if (selectedSeries.length === 0) {
      setErrorMsg('⚠️ Mohon pilih minimal 1 Seri Webinar yang ingin Anda ikuti.');
      return;
    }

    setErrorMsg('');
    setStep(2);
  };

  // Step 2 -> Step 3 Validation & Submit
  const handleConfirmPaymentAndUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) {
      setErrorMsg('Mohon unggah foto/PDF bukti transfer pembayaran Anda.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await saveRegistration({
        fullName,
        email,
        nikKtp,
        installation,
        phone,
        cleanPhone: phone.replace(/\D/g, '').replace(/^0/, '62'),
        city,
        categoryId: selectedCategory,
        categoryName: currentCat.role,
        series: selectedSeries,
        totalAmount,
        paymentProofName: fileName,
        paymentProofUrl: proofUrl
      });

      if (res.success) {
        setStep(3);
        onSuccessToast('✅ Pendaftaran & Bukti Transfer Anda berhasil dikirimkan ke database!');
      } else {
        const errorDetail = typeof res.message === 'string' ? res.message : JSON.stringify(res.message || res);
        setErrorMsg(`⚠️ Gagal menyimpan ke database MySQL Hostinger: ${errorDetail}`);
      }
    } catch (err: any) {
      const errorDetail = typeof err?.message === 'string' ? err.message : String(err);
      setErrorMsg(`⚠️ Terjadi kesalahan: ${errorDetail || 'Gagal mengirim data ke server database.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setStep(1);
    setFullName('');
    setEmail('');
    setNikKtp('');
    setInstallation('');
    setPhone('');
    setCity('');
    setFileName('');
    setErrorMsg('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-slate-900/70 backdrop-blur-sm">
        
        {/* Backdrop Click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleResetAndClose}
          className="fixed inset-0"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-200 my-auto max-h-[92vh] flex flex-col"
        >
          {/* Modal Header */}
          <div className="bg-slate-900 text-white p-4 sm:p-6 relative shrink-0">
            <button
              onClick={handleResetAndClose}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Formulir Pendaftaran Resmi Webinar</span>
            </div>

            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight pr-8">
              Parade Webinar Nasional RSUP Dr. Kariadi
            </h2>

            {/* Stepper Indicator Header Responsive */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-800 text-[10px] sm:text-xs font-bold">
              <span className={`px-2 py-0.5 rounded-md ${step === 1 ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                1. Data Diri & Seri
              </span>
              <span className="text-slate-600">→</span>
              <span className={`px-2 py-0.5 rounded-md ${step === 2 ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                2. Pembayaran & Upload
              </span>
              <span className="text-slate-600">→</span>
              <span className={`px-2 py-0.5 rounded-md ${step === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                3. Selesai
              </span>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-4 sm:p-8 overflow-y-auto flex-1">
            
            {/* STEP 1: Registration Form with 6 Required Fields */}
            {step === 1 && (
              <form onSubmit={handleProceedToPayment} className="space-y-6">
                
                {errorMsg && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2 animate-shake">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{String(errorMsg)}</span>
                  </div>
                )}

                {/* 6 Required Fields Box */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan-800 bg-cyan-50/80 p-2.5 rounded-lg border border-cyan-100 flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-600" />
                    <span>Isi Form Pendaftaran (6 Kolom Wajib)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    
                    {/* 1. Nama lengkap (Sesuai LMS) */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        1. Nama lengkap (Sesuai LMS) *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="Masukkan nama lengkap sesuai sistem LMS..."
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 text-sm font-medium transition-all"
                        />
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      </div>
                    </div>

                    {/* 2. alamat email (Sesuai LMS) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        2. Alamat email (Sesuai LMS) *
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          placeholder="email@lms-domain.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                            email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                              ? 'border-red-500 bg-red-50/50 text-red-900 focus:ring-2 focus:ring-red-200'
                              : 'border-slate-300 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100'
                          }`}
                        />
                        <Mail className={`w-4 h-4 absolute left-3 top-3 ${email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'text-red-500' : 'text-slate-400'}`} />
                      </div>
                      {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                        <span className="text-[10px] font-bold text-red-600 mt-1 block">
                           Format email tidak valid (contoh: nama@domain.com)
                        </span>
                      )}
                    </div>

                    {/* 3. No KTP.NIK KTP */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        3. No KTP / NIK KTP (Wajib 16 Digit) *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          maxLength={16}
                          placeholder="16 digit NIK KTP..."
                          value={nikKtp}
                          onChange={(e) => setNikKtp(e.target.value.replace(/\D/g, ''))}
                          className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all font-mono ${
                            nikKtp && nikKtp.length !== 16
                              ? 'border-red-500 bg-red-50/50 text-red-900 focus:ring-2 focus:ring-red-200 font-extrabold'
                              : 'border-slate-300 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100'
                          }`}
                        />
                        <FileText className={`w-4 h-4 absolute left-3 top-3 ${nikKtp && nikKtp.length !== 16 ? 'text-red-500' : 'text-slate-400'}`} />
                      </div>
                      {nikKtp && nikKtp.length !== 16 ? (
                        <span className="text-[10px] font-bold text-red-600 mt-1 block flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          NIK KTP harus 16 digit angka ({nikKtp.length}/16 digit)
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
                          Tepat 16 digit angka KTP
                        </span>
                      )}
                    </div>

                    {/* 4. Asal Instalansi Peserta */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        4. Asal Instalansi Peserta *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="contoh: RSUP Dr. Kariadi / Puskesmas / Klinik"
                          value={installation}
                          onChange={(e) => setInstallation(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 text-sm font-medium transition-all"
                        />
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      </div>
                    </div>

                    {/* 5. No. Hp Peserta */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        5. No. Hp Peserta (WhatsApp) *
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          placeholder="contoh: 08123456789"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                            phone && phone.replace(/\D/g, '').length < 10
                              ? 'border-red-500 bg-red-50/50 text-red-900 focus:ring-2 focus:ring-red-200'
                              : 'border-slate-300 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100'
                          }`}
                        />
                        <Phone className={`w-4 h-4 absolute left-3 top-3 ${phone && phone.replace(/\D/g, '').length < 10 ? 'text-red-500' : 'text-slate-400'}`} />
                      </div>
                      {phone && phone.replace(/\D/g, '').length < 10 && (
                        <span className="text-[10px] font-bold text-red-600 mt-1 block">
                          Nomor HP minimal 10 digit ({phone.replace(/\D/g, '').length}/10)
                        </span>
                      )}
                    </div>

                    {/* 6. Kab/Kota */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        6. Kab/Kota *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="contoh: Kota Semarang / Kab. Kendal"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 text-sm font-medium transition-all"
                        />
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                    Kategori Profesi Peserta
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                    {PRICING_CATEGORIES.map((cat) => {
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            if (cat.id === 'perawat_rsdk') {
                              setShowRsdkConfirmModal(true);
                            } else {
                              setSelectedCategory(cat.id);
                            }
                          }}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-cyan-600 bg-cyan-50/80 ring-2 ring-cyan-200'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-xs text-slate-800 block">{cat.role}</span>
                            {cat.note && (
                              <span className="text-[10px] font-bold text-emerald-700 block mt-0.5">
                                {cat.note}
                              </span>
                            )}
                          </div>
                          <span className="font-extrabold text-sm text-cyan-800 mt-2">{cat.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Series Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                      Pilih Seri Webinar
                    </h3>
                    <button
                      type="button"
                      onClick={handleSelectAllSeries}
                      className="text-xs font-bold text-cyan-700 hover:underline"
                    >
                      {selectedSeries.length === WEBINAR_SERIES_DATA.length ? 'Batal Pilih Semua' : 'Pilih Semua 4 Seri'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {WEBINAR_SERIES_DATA.map((s) => {
                      const isChecked = selectedSeries.includes(s.title);
                      return (
                        <label
                          key={s.id}
                          className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                            isChecked
                              ? 'border-cyan-600 bg-cyan-50/60'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleSeriesToggle(s.title)}
                              className="w-4 h-4 text-cyan-600 rounded border-slate-300 focus:ring-cyan-500"
                            />
                            <div>
                              <span className="font-extrabold text-xs text-slate-900 block">
                                {s.seriesNumber}: {s.title}
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium">
                                {s.date}
                              </span>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Action Button to Step 2 */}
                <button
                  type="submit"
                  className="w-full py-4 text-base font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-2xl shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>LANJUT KE PEMBAYARAN</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

              </form>
            )}

            {/* STEP 2: Total Payment, Copy Bank Account & Upload Proof */}
            {step === 2 && (
              <form onSubmit={handleConfirmPaymentAndUpload} className="space-y-6">
                
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-cyan-700 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali Edit Form</span>
                  </button>
                  <span className="text-xs font-bold text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-md">
                    Langkah 2 dari 2
                  </span>
                </div>

                {errorMsg && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{String(errorMsg)}</span>
                  </div>
                )}

                {/* Registration Data Briefing */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
                  <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                    <span className="text-slate-500">Nama (LMS):</span>
                    <span className="font-bold text-slate-900">{fullName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                    <span className="text-slate-500">NIK KTP:</span>
                    <span className="font-mono font-bold text-slate-900">{nikKtp}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                    <span className="text-slate-500">Asal Instalasi:</span>
                    <span className="font-bold text-slate-900">{installation} ({city})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Seri Terpilih:</span>
                    <span className="font-bold text-cyan-800">{selectedSeries.join(', ')}</span>
                  </div>
                </div>

                {/* Total Payment Amount Box */}
                <div className="p-5 bg-gradient-to-r from-slate-900 to-cyan-950 text-white rounded-2xl shadow-md border border-cyan-800 space-y-2">
                  <span className="text-xs text-cyan-300 font-extrabold uppercase tracking-wider block">
                    Total Yang Harus Dibayarkan:
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
                    Rp {totalAmount.toLocaleString('id-ID')}
                  </div>
                  <p className="text-[11px] text-cyan-100/80">
                    Tarif {currentCat.role} ({selectedSeries.length} seri webinar)
                  </p>
                </div>

                {/* Bank Account Copy Box */}
                <div className="p-4 bg-cyan-50/90 rounded-2xl border border-cyan-200 space-y-3">
                  <div className="flex items-center gap-2 text-cyan-900 font-extrabold text-xs uppercase tracking-wider">
                    <CreditCard className="w-4 h-4 text-cyan-700" />
                    <span>Transfer Ke Nomor Rekening Resmi:</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-cyan-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                    <div>
                      <span className="text-xs text-slate-500 block font-semibold">Bank Mandiri</span>
                      <span className="font-mono font-black text-slate-900 text-lg sm:text-xl tracking-wider block">
                        {BANK_DETAILS.accountNumber}
                      </span>
                      <span className="text-xs text-slate-600 font-bold block">
                        a.n {BANK_DETAILS.accountName}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={onCopyAccount}
                      className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                      <span>SALIN NO. REKENING</span>
                    </button>
                  </div>
                </div>

                {/* Upload Transfer Receipt Box */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Unggah Bukti Transfer Pembayaran *
                  </label>
                  <div className="relative border-2 border-dashed border-cyan-300 hover:border-cyan-500 rounded-2xl p-6 text-center transition-colors bg-slate-50/50 hover:bg-cyan-50/30">
                    <input
                      type="file"
                      required
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        {fileName ? (
                          <div className="space-y-1">
                            <span className="font-extrabold text-emerald-700 text-sm block">
                              ✓ {fileName}
                            </span>
                            <span className="text-xs text-slate-500">
                              Klik jika ingin mengganti berkas
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="font-bold text-slate-800 text-sm block">
                              Klik atau seret foto/PDF bukti transfer di sini
                            </span>
                            <span className="text-xs text-slate-500">
                              Format dukungan: JPG, PNG, atau PDF (Max 5MB)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confirm and Selesaikan Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-2xl shadow-lg shadow-emerald-600/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>MENGIRIMKAN KE DATABASE MYSQL SERVER...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>KONFIRMASI & SELESAIKAN PENDAFTARAN</span>
                    </>
                  )}
                </button>

              </form>
            )}

            {/* STEP 3: Success Screen */}
            {step === 3 && (
              <div className="text-center py-6 space-y-6">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-12 h-12" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-slate-900">
                    Pendaftaran & Pembayaran Berhasil!
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Terima kasih, <span className="font-bold text-slate-900">{fullName}</span>. Bukti transfer telah terverifikasi.
                  </p>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left max-w-md mx-auto space-y-2.5 text-xs sm:text-sm text-slate-700">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Nama (LMS):</span>
                    <span className="font-bold text-slate-900">{fullName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Email (LMS):</span>
                    <span className="font-bold text-slate-900">{email}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">NIK KTP:</span>
                    <span className="font-mono font-bold text-slate-900">{nikKtp}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Asal Instalasi:</span>
                    <span className="font-bold text-slate-900">{installation}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Kab/Kota:</span>
                    <span className="font-bold text-slate-900">{city}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Seri Terpilih:</span>
                    <span className="font-bold text-cyan-800">{selectedSeries.join(', ')}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-600 font-bold">Total Lunas:</span>
                    <span className="font-extrabold text-emerald-700 text-base">
                      Rp {totalAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 text-xs text-slate-500">
                    <span>Berkas Bukti:</span>
                    <span className="font-bold text-slate-700">{fileName}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Link Zoom dan petunjuk presensi LMS akan dikirimkan ke email <span className="font-semibold text-slate-700">{email}</span> dan WhatsApp <span className="font-semibold text-slate-700">{phone}</span>.
                </p>

                <div className="pt-2">
                  <button
                    onClick={handleResetAndClose}
                    className="w-full sm:w-auto px-10 py-3.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-2xl shadow-md transition-colors cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}

          </div>
        </motion.div>

        {/* Confirmation Modal Popup for Perawat RSDK */}
        {showRsdkConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
            <div className="bg-white rounded-3xl p-5 sm:p-8 max-w-md w-full my-auto max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 text-center space-y-4 sm:space-y-5 animate-scaleUp">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-md">
                <ShieldCheck className="w-8 h-8 sm:w-9 sm:h-9 text-emerald-600" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-slate-900 leading-snug">
                  Konfirmasi Status Perawat RSDK
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Tarif spesial <span className="font-extrabold text-emerald-700">Rp 10.000,-</span> ini khusus hanya berlaku untuk <span className="font-bold text-slate-900">Perawat yang aktif bekerja di RSUP Dr. Kariadi Semarang</span>.
                </p>
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-2xl text-xs font-semibold text-left space-y-1">
                  <p className="font-bold text-amber-900">⚠️ Catatan Verifikasi:</p>
                  <p>Apakah Anda mengonfirmasi bahwa Anda adalah Perawat yang bekerja di RSUP Dr. Kariadi Semarang?</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRsdkConfirmModal(false);
                    setSelectedCategory('perawat');
                  }}
                  className="w-full py-3.5 px-4 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors cursor-pointer"
                >
                  Bukan / Kategori Lain
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('perawat_rsdk');
                    setShowRsdkConfirmModal(false);
                  }}
                  className="w-full py-3.5 px-4 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-lg shadow-emerald-600/20 transition-colors cursor-pointer"
                >
                  Lanjutkan (Saya Perawat RSDK)
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AnimatePresence>
  );
};
