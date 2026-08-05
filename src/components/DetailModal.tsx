import React from 'react';
import { WebinarSeries } from '../types';
import { X, Calendar, Clock, Users, UserCheck, ArrowRight, CheckCircle2, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DetailModalProps {
  series: WebinarSeries | null;
  onClose: () => void;
  onOpenRegisterForSeries: (seriesTitle: string) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  series,
  onClose,
  onOpenRegisterForSeries,
}) => {
  if (!series) return null;

  const isTeal = series.badgeColor === 'teal';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-slate-900/70 backdrop-blur-sm">
        
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
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-200 my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header Banner */}
          <div
            className={`p-4 sm:p-8 text-white relative shrink-0 ${
              isTeal ? 'bg-gradient-to-r from-cyan-900 via-cyan-800 to-teal-700' : 'bg-gradient-to-r from-lime-900 via-lime-800 to-emerald-700'
            }`}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <span className="inline-block px-3 py-1 text-xs font-extrabold bg-white/20 backdrop-blur-md rounded-md tracking-wider uppercase mb-3">
              {series.seriesNumber}
            </span>

            <h2 className="text-xl sm:text-3xl font-black tracking-tight mb-2 pr-8">
              {series.title}: {series.fullTitle}
            </h2>

            <p className="text-xs sm:text-sm font-medium text-white/90 leading-relaxed max-w-xl">
              {series.description}
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4 sm:mt-6 text-xs font-bold text-white/90">
              <div className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1.5 rounded-lg backdrop-blur-sm">
                <Calendar className="w-4 h-4 text-white" />
                <span>{series.date} ({series.day})</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1.5 rounded-lg backdrop-blur-sm">
                <Clock className="w-4 h-4 text-white" />
                <span>{series.time}</span>
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 overflow-y-auto flex-1">
            
            {/* Speakers List */}
            <div>
              <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-700" />
                <span>Narasumber Ahli ({series.speakers.length})</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {series.speakers.map((sp, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-cyan-100/70 text-cyan-800 font-bold text-xs flex items-center justify-center shrink-0">
                      {sp.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                        {sp.name}
                      </h4>
                      <p className="text-[11px] text-cyan-800 font-medium">{sp.role}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{sp.institution}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Moderator */}
            <div>
              <h3 className="text-base font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-lime-700" />
                <span>Moderator</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {series.moderators.map((mod, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-lime-100 text-lime-800 font-bold text-xs flex items-center justify-center shrink-0">
                      MOD
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                        {mod.name}
                      </h4>
                      <p className="text-[11px] text-lime-800 font-medium">{mod.role}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{mod.institution}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Narahubung Khusus Seri */}
            {series.contactPerson && (
              <div className="p-4 rounded-2xl bg-cyan-50/80 border border-cyan-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-cyan-800 font-bold uppercase tracking-wider">Narahubung Seri {series.title}</p>
                    <p className="text-sm font-extrabold text-slate-900">{series.contactPerson.name} ({series.contactPerson.phone})</p>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${series.contactPerson.cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm shrink-0 flex items-center justify-center gap-1.5"
                >
                  <span>Chat WhatsApp</span>
                </a>
              </div>
            )}

            {/* Susunan Acara / Agenda */}
            <div>
              <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-700" />
                <span>Rundown & Topic Highlights</span>
              </h3>

              <div className="space-y-2.5">
                {series.agenda.map((ag, idx) => (
                  <div
                    key={idx}
                    className="p-3 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-xs font-bold text-cyan-800 bg-cyan-100/70 px-2.5 py-1 rounded-md shrink-0">
                        {ag.time}
                      </span>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                          {ag.topic}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {ag.speaker}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Footer Action */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Termasuk E-Sertifikat JEP & Rekaman Video</span>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenRegisterForSeries(series.title);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span>DAFTAR SERI INI</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
