import React from 'react';
import { Calendar, Award, CheckCircle2, ArrowRight, ShieldCheck, Users, Video, Check, AlertTriangle, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { getMaintenanceConfig } from '../data/webinarData';
import logo101Corpo from '../assets/images/101 corpo acc.png';
import logoKariadi from '../assets/images/Logo_RS_Kariadi_Resmi.png';
import logoPpni from '../assets/images/logo ppni.png';
import qrCodeImg from '../assets/images/qrcode_hut101_webinar.png';

interface HeroSectionProps {
  onOpenRegister: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenRegister }) => {
  const maintenanceConfig = getMaintenanceConfig();

  const scrollToJadwal = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector('#webinar');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const featureCheckpoints = [
    "4 Seri Kepakaran Utama (Kardiovaskular, Neurosains, Uronefro, Onkologi)",
    "Sertifikat ber-JEP (Jam Efektif Pembelajaran)",
    "Narasumber Pakar Multidisiplin (Dokter Spesialis, Perawat Ahli, Apoteker, & Ahli Gizi)",
    "Full Daring (Online)"
  ];

  return (
    <section className="relative bg-slate-900 text-white overflow-hidden pt-8 pb-14 lg:pt-14 lg:pb-20">
      {/* Background Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/60 via-slate-900 to-slate-900 pointer-events-none"></div>
      
      {/* Glowing Ambient Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-600/15 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-[400px] h-[250px] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Main Headline & User Directives */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            {/* Top Badge */}
            <div className="flex flex-wrap items-center gap-2">
              {maintenanceConfig.isClosed ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-500/25 text-amber-200 border border-amber-400/40 backdrop-blur-md animate-pulse">
                  <AlertTriangle className="w-4 h-4 text-amber-300" />
                  ⚠️ PENDAFTARAN DITUTUP SEMENTARA (BUKA {maintenanceConfig.reopenTime})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 backdrop-blur-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  WEBINAR MEDIS NASIONAL KEMENKES
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ✔ JEP PPNI RESMI
              </span>
            </div>

            {/* User Requested Main Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
                PARADE WEBINAR NASIONAL <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300">
                  HUT KE-101 RS KARIADI
                </span>
              </h1>
              
              {/* User Requested Organizer Subheadline */}
              <p className="text-xs sm:text-sm md:text-base font-extrabold text-cyan-200 bg-white/10 p-3 sm:p-4 rounded-2xl border border-white/15 backdrop-blur-sm leading-relaxed">
                Diselenggarakan oleh RSUP Dr. Kariadi bekerjasama dengan DPK PPNI RSUP Dr. Kariadi Semarang
              </p>
            </div>

            {/* User Requested 4 Checkpoint Bullet Points */}
            <div className="space-y-2.5 pt-1">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block">
                Keunggulan Kegiatan:
              </span>
              <div className="space-y-2">
                {featureCheckpoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 bg-white/5 p-2.5 sm:p-3 rounded-xl border border-white/10 backdrop-blur-sm text-xs sm:text-sm font-semibold text-slate-100">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold mt-0.5 text-xs">
                      ✔
                    </span>
                    <span className="leading-snug">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              {maintenanceConfig.isClosed ? (
                <button
                  onClick={onOpenRegister}
                  className="px-6 py-4 text-sm sm:text-base font-black text-white bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 rounded-2xl shadow-xl shadow-amber-600/30 hover:shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-2 group"
                >
                  <AlertTriangle className="w-5 h-5 text-amber-200 shrink-0" />
                  <span>PENDAFTARAN DITUTUP SEMENTARA (BUKA {maintenanceConfig.reopenTime})</span>
                </button>
              ) : (
                <button
                  onClick={onOpenRegister}
                  className="px-8 py-4 text-base font-extrabold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-2xl shadow-xl shadow-red-600/30 hover:shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-2 group"
                >
                  <span>DAFTAR WEBINAR SEKARANG</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              <a
                href="#webinar"
                onClick={scrollToJadwal}
                className="px-6 py-4 text-sm font-bold text-cyan-200 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 rounded-2xl transition-all text-center"
              >
                LIHAT 4 SERI WEBINAR
              </a>
            </div>
          </motion.div>

          {/* Right Column: Emblem 101 & QR Code */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="lg:col-span-5"
          >
            <div className="bg-gradient-to-br from-cyan-900 via-teal-900 to-slate-900 p-5 sm:p-8 rounded-3xl text-white shadow-2xl border border-cyan-700/40 relative overflow-hidden space-y-4 sm:space-y-5">
              
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400"></div>

              {/* Logo 101 Corpo ACC Banner */}
              <div className="text-center bg-white/10 p-4 sm:p-5 rounded-2xl backdrop-blur-md border border-white/15 flex flex-col items-center justify-center">
                <img
                  src={logo101Corpo}
                  alt="HUT Ke-101 RS Kariadi Logo"
                  className="max-h-20 sm:max-h-28 object-contain drop-shadow-md mb-2"
                />
                <span className="text-[10px] sm:text-xs font-black tracking-widest text-emerald-300 uppercase">
                  SEHAT BERSAMA, MELAYANI SEPENUH HATI
                </span>
              </div>

              {/* Organizer Logos Side-by-Side */}
              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-2">
                <span className="text-[11px] font-bold text-cyan-200 uppercase tracking-wider block text-center">
                  Penyelenggara Resmi:
                </span>
                <div className="flex items-center justify-center gap-3 sm:gap-4 bg-white/90 p-2.5 sm:p-3 rounded-xl">
                  <img src={logoKariadi} alt="RSUP Dr. Kariadi" className="h-8 sm:h-9 object-contain" />
                  <div className="h-6 w-[1px] bg-slate-300"></div>
                  <img src={logoPpni} alt="DPK PPNI RSUP Dr. Kariadi" className="h-10 sm:h-11 object-contain scale-110 transform-gpu" />
                </div>
              </div>

              {/* QR Code Scan Card */}
              <div className="bg-white/10 p-3 sm:p-3.5 rounded-2xl border border-white/15 flex items-center gap-3 backdrop-blur-md">
                <div className="bg-white p-1 rounded-xl shrink-0 shadow-md">
                  <img src={qrCodeImg} alt="QR Code webinarnasional.dpkppnirsdk.id" className="w-14 h-14 sm:w-16 sm:h-16 object-contain" />
                </div>
                <div className="space-y-0.5 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                    Scan QR Link Website:
                  </span>
                  <span className="text-xs font-extrabold text-white font-mono block">
                    webinarnasional.dpkppnirsdk.id
                  </span>
                  <span className="text-[10px] text-cyan-200/80 block">
                    Scan kamera HP untuk membuka situs pendaftaran.
                  </span>
                </div>
              </div>

              {/* Target Audience Badges */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-cyan-200 uppercase tracking-wider block">
                  Sasaran Peserta:
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
                  <span className="bg-white/15 px-2.5 py-1 rounded-lg">Dokter Spesialis</span>
                  <span className="bg-white/15 px-2.5 py-1 rounded-lg">Dokter Umum</span>
                  <span className="bg-white/15 px-2.5 py-1 rounded-lg">Perawat</span>
                  <span className="bg-white/15 px-2.5 py-1 rounded-lg">Nakes Lainnya</span>
                  <span className="bg-white/15 px-2.5 py-1 rounded-lg">Mahasiswa</span>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
