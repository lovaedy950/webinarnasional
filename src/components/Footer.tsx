import React from 'react';
import { Phone, Globe, Instagram, Youtube, UserCheck, Lock } from 'lucide-react';
import { CONTACT_PERSONS_UMUM, CONTACT_PERSONS_KHUSUS } from '../data/webinarData';
import logo101Corpo from '../assets/images/101 corpo acc.png';
import logoKemenkes from '../assets/images/logo kemenkes.png';
import logoKariadi from '../assets/images/Logo_RS_Kariadi_Resmi.png';
import logoPpni from '../assets/images/logo ppni.png';

interface FooterProps {
  onOpenAdmin?: () => void;
  onOpenCheckStatus?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onOpenCheckStatus }) => {
  return (
    <footer id="narahubung" className="bg-[#0a4d61] text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pb-10 border-b border-white/10">
          
          {/* Left Column: Hospital & Organizer Brand */}
          <div className="md:col-span-3 space-y-4">
            <div className="flex items-center gap-2 bg-white/95 p-2 rounded-xl shadow-md">
              <img src={logoKemenkes} alt="Logo Kemenkes" className="h-7 object-contain" />
              <div className="h-5 w-[1px] bg-slate-300"></div>
              <img src={logoKariadi} alt="Logo RSUP Dr. Kariadi" className="h-7 object-contain" />
              <div className="h-5 w-[1px] bg-slate-300"></div>
              <img src={logoPpni} alt="Logo PPNI" className="h-9 object-contain scale-110 transform-gpu" />
            </div>

            <div className="text-xs sm:text-sm text-cyan-100/90 space-y-1">
              <p className="font-bold text-white">RSUP Dr. Kariadi Semarang</p>
              <p className="text-cyan-200/80">bekerjasama dengan DPK PPNI RSUP Dr. Kariadi</p>
              <p className="text-xs text-cyan-200/60 pt-2">Jl. Dr. Sutomo No.16, Randusari, Semarang</p>
            </div>
          </div>

          {/* Contact Person Umum (Kemenkes / Penyelenggara) */}
          <div className="md:col-span-3 space-y-3">
            <div className="flex items-center gap-2 text-emerald-300">
              <Phone className="w-4 h-4" />
              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                Narahubung Umum
              </h3>
            </div>
            <p className="text-[11px] text-cyan-200/80">Kementerian Kesehatan / Penyelenggara</p>
            
            <div className="space-y-2.5 text-xs sm:text-sm text-cyan-100">
              {CONTACT_PERSONS_UMUM.map((person, idx) => (
                <a
                  key={idx}
                  href={`https://wa.me/${person.cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-400/50 flex items-center justify-between transition-all group cursor-pointer"
                >
                  <div>
                    <span className="block font-bold text-white text-xs sm:text-sm">{person.name}</span>
                    <span className="text-cyan-200 text-xs font-mono">{person.phone}</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    WA
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Contact Person Khusus (Per Seri) */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-300">
              <UserCheck className="w-4 h-4" />
              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                Narahubung Seri
              </h3>
            </div>
            <p className="text-[11px] text-cyan-200/80">Kontak Khusus Per Topik Webinar</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-cyan-100">
              {CONTACT_PERSONS_KHUSUS.map((person, idx) => (
                <a
                  key={idx}
                  href={`https://wa.me/${person.cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-400/50 flex flex-col justify-between transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                      {person.topic}
                    </span>
                  </div>
                  <span className="font-bold text-white text-xs">{person.name}</span>
                  <span className="text-cyan-200 text-[11px] font-mono mt-0.5">{person.phone}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Right Column: Sosmed & Emblem 101 */}
          <div className="md:col-span-2 space-y-4 text-left md:text-right flex flex-col items-start md:items-end">
            <div className="space-y-2">
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
                Ikuti Kami
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-emerald-500 text-white flex items-center justify-center transition-all hover:scale-110"
                  aria-label="Instagram"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-emerald-500 text-white flex items-center justify-center transition-all hover:scale-110"
                  aria-label="YouTube"
                >
                  <Youtube className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://www.rskariadi.co.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-emerald-500 text-white flex items-center justify-center transition-all hover:scale-110"
                  aria-label="Website"
                >
                  <Globe className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm flex flex-col items-center">
              <img src={logo101Corpo} alt="Logo 101 Kariadi" className="h-12 object-contain mb-1" />
              <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">HUT KE-101</span>
            </div>
          </div>

        </div>

        {/* Copyright, Status Check & Admin Link */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cyan-200/60 font-medium">
          <div>
            © 2026 RSUP Dr. Kariadi Semarang. All rights reserved. Parade Webinar Nasional HUT Ke-101.
          </div>

          <div className="flex items-center gap-4">
            {onOpenCheckStatus && (
              <button
                onClick={onOpenCheckStatus}
                className="text-cyan-200 hover:text-emerald-300 font-bold transition-colors cursor-pointer underline flex items-center gap-1"
              >
                <span>🔍 Cek Status & Cetak Invoice Mandiri</span>
              </button>
            )}

            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="text-cyan-300/70 hover:text-cyan-100 flex items-center gap-1 font-semibold transition-colors cursor-pointer border border-cyan-400/30 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10"
              >
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Portal Tim Admin</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
};
