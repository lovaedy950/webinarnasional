import React from 'react';
import { WEBINAR_SERIES_DATA } from '../data/webinarData';
import { WebinarSeries } from '../types';
import { Users, User, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface WebinarSeriesSectionProps {
  onSelectSeries: (series: WebinarSeries) => void;
}

export const WebinarSeriesSection: React.FC<WebinarSeriesSectionProps> = ({ onSelectSeries }) => {
  return (
    <section id="webinar" className="py-16 bg-slate-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            4 <span className="relative inline-block text-slate-900">
              Seri
              <span className="absolute bottom-1 left-0 w-full h-1 bg-cyan-600 rounded-full"></span>
            </span> Webinar Ilmiah
          </h2>
        </div>

        {/* Stepper Timeline Header */}
        <div className="relative mb-12 max-w-5xl mx-auto">
          {/* Horizontal Line */}
          <div className="hidden md:block absolute top-6 left-12 right-12 h-1 bg-slate-300 -z-0"></div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            {WEBINAR_SERIES_DATA.map((item) => {
              const isTeal = item.badgeColor === 'teal';
              return (
                <div key={item.id} className="flex flex-col items-center text-center group">
                  {/* Circle Number */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-md transition-transform group-hover:scale-110 mb-2 ${
                      isTeal ? 'bg-cyan-700' : 'bg-lime-600'
                    }`}
                  >
                    {item.id}
                  </div>
                  {/* Date & Day */}
                  <span className="font-extrabold text-xs sm:text-sm text-slate-800 uppercase tracking-wider">
                    {item.date}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {WEBINAR_SERIES_DATA.map((series, idx) => {
            const isTeal = series.badgeColor === 'teal';

            return (
              <motion.div
                key={series.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`bg-white rounded-2xl border ${
                  isTeal ? 'border-cyan-200/80 hover:border-cyan-400' : 'border-lime-200/80 hover:border-lime-400'
                } shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-5 relative overflow-hidden group`}
              >
                <div>
                  {/* Series Badge Header */}
                  <div className="mb-4">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-extrabold text-white rounded-md tracking-wider uppercase ${
                        isTeal ? 'bg-cyan-700' : 'bg-lime-600'
                      }`}
                    >
                      {series.seriesNumber}
                    </span>
                  </div>

                  {/* Title & Time */}
                  <h3
                    className={`text-xl sm:text-2xl font-black mb-1.5 uppercase tracking-tight ${
                      isTeal ? 'text-cyan-700' : 'text-lime-700'
                    }`}
                  >
                    {series.title}
                  </h3>

                  <div className="text-xs font-bold text-slate-700 mb-3 bg-slate-100 inline-block px-2.5 py-1 rounded-md">
                    {series.time}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed font-medium mb-6 min-h-[70px]">
                    {series.fullTitle}
                  </p>
                </div>

                {/* Speaker Stats & Action Button */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>{series.speakersCount} Narasumber Ahli</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{series.moderatorsCount} Moderator</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectSeries(series)}
                    className={`w-full py-2.5 px-4 text-xs font-bold rounded-xl border transition-all duration-200 flex items-center justify-center gap-1.5 group/btn cursor-pointer ${
                      isTeal
                        ? 'border-cyan-300 text-cyan-800 hover:bg-cyan-50 hover:border-cyan-500'
                        : 'border-lime-300 text-lime-800 hover:bg-lime-50 hover:border-lime-500'
                    }`}
                  >
                    <span>LIHAT DETAIL</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-slate-500 font-medium mt-8">
          * Klik &quot;Lihat Detail&quot; untuk melihat tema lengkap, narasumber, dan moderator setiap seri webinar.
        </p>

      </div>
    </section>
  );
};
