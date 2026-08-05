import React from 'react';
import { PRICING_CATEGORIES, BANK_DETAILS } from '../data/webinarData';
import { Stethoscope, UserCheck, GraduationCap, CheckCircle, CreditCard, Upload, FileText, Mail, Award, ArrowRight, Copy, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface PricingAndStepsSectionProps {
  onOpenRegister: () => void;
  onCopyAccount: () => void;
}

export const PricingAndStepsSection: React.FC<PricingAndStepsSectionProps> = ({
  onOpenRegister,
  onCopyAccount,
}) => {
  const getPricingIcon = (type: string) => {
    switch (type) {
      case 'perawat_rsdk':
        return <UserCheck className="w-6 h-6 text-emerald-700" />;
      case 'medis':
        return <Stethoscope className="w-6 h-6 text-cyan-700" />;
      case 'perawat':
        return <UserCheck className="w-6 h-6 text-lime-700" />;
      case 'mahasiswa':
        return <GraduationCap className="w-6 h-6 text-cyan-700" />;
      default:
        return <Stethoscope className="w-6 h-6 text-cyan-700" />;
    }
  };

  const steps = [
    {
      num: 1,
      icon: CreditCard,
      text: 'Lakukan pembayaran melalui transfer ke rekening yang tersedia',
    },
    {
      num: 2,
      icon: Upload,
      text: 'Simpan bukti transfer Anda (foto/PDF)',
    },
    {
      num: 3,
      icon: FileText,
      text: 'Isi formulir pendaftaran online',
    },
    {
      num: 4,
      icon: Mail,
      text: 'Cek email Anda untuk konfirmasi dan link Zoom',
    },
    {
      num: 5,
      icon: Award,
      text: 'Ikuti webinar dan dapatkan sertifikat JEP',
    },
  ];

  return (
    <section id="pembayaran" className="py-16 bg-white">
      <div id="cara-daftar" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Investasi (Per Seri Webinar) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 bg-slate-100/80 p-6 sm:p-8 rounded-3xl border border-slate-200 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-6 tracking-tight">
                Investasi (Per Seri Webinar)
              </h2>

              <div className="space-y-4 mb-6">
                {PRICING_CATEGORIES.map((cat) => {
                  const isTeal = cat.badgeColor === 'teal';
                  return (
                    <div
                      key={cat.id}
                      className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:border-cyan-300 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isTeal ? 'bg-cyan-100/70' : 'bg-lime-100/70'
                          }`}
                        >
                          {getPricingIcon(cat.iconType)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 text-sm sm:text-base block">
                            {cat.role}
                          </span>
                          {cat.note && (
                            <span className="text-[11px] font-semibold text-emerald-700 block">
                              {cat.note}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-black text-slate-900 text-base sm:text-lg">
                        {cat.price}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Included Box */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm font-semibold text-emerald-900">
                <span className="font-bold">Include:</span> Sertifikat JEP, Akses Zoom, Materi, Diskusi Interaktif
              </div>
            </div>
          </motion.div>

          {/* Right Column: Langkah Pendaftaran */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 bg-slate-100/80 p-6 sm:p-8 rounded-3xl border border-slate-200 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-6 tracking-tight">
                Langkah Pendaftaran
              </h2>

              {/* Steps Horizontal Sequence */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-8">
                {steps.map((step, index) => {
                  const IconComp = step.icon;
                  return (
                    <div key={step.num} className="flex flex-col items-center text-center relative group">
                      
                      {/* Icon Circle */}
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-cyan-700 mb-2 group-hover:scale-110 group-hover:bg-cyan-50 transition-all">
                        <IconComp className="w-5 h-5" />
                      </div>

                      {/* Step Number Badge */}
                      <span className="font-extrabold text-xs text-slate-800 mb-1">
                        {step.num}
                      </span>

                      {/* Step Text */}
                      <p className="text-[11px] text-slate-600 leading-snug font-medium">
                        {step.text}
                      </p>

                      {/* Arrow Connector (for desktop) */}
                      {index < steps.length - 1 && (
                        <div className="hidden sm:block absolute top-6 -right-3 text-slate-300 font-bold text-xs">
                          →
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bank Account Details Box */}
              <div className="bg-cyan-50/80 border border-cyan-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-start gap-2.5">
                  <Info className="w-5 h-5 text-cyan-700 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm font-semibold text-slate-800">
                    <span className="text-cyan-800 font-bold">Rekening Transfer:</span>{' '}
                    <span className="font-mono text-slate-900 font-extrabold text-sm sm:text-base">{BANK_DETAILS.accountNumber}</span>{' '}
                    a.n {BANK_DETAILS.accountName}
                  </div>
                </div>

                <button
                  onClick={onCopyAccount}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-cyan-800 bg-white hover:bg-cyan-100 border border-cyan-300 rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin No. Rek</span>
                </button>
              </div>
            </div>

            {/* Big Action Button */}
            <div className="pt-2">
              <button
                onClick={onOpenRegister}
                className="w-full flex items-center justify-center gap-2.5 py-4 px-6 text-base font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-2xl shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <span>DAFTAR WEBINAR SEKARANG</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
};
